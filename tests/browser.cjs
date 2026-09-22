/* Real Chromium runtime test. A temporary copy pregrants only the local fixture
   origin; no production manifest or user profile is changed. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'scriptbridge-browser-'));
 const extension=path.join(tmp,'extension');await fs.cp(path.join(__dirname,'../extension'),extension,{recursive:true});
 const manifest=JSON.parse(await fs.readFile(path.join(extension,'manifest.json'),'utf8'));
 manifest.host_permissions=['http://127.0.0.1/*'];await fs.writeFile(path.join(extension,'manifest.json'),JSON.stringify(manifest));
 const html='<!doctype html><html lang="en"><body><h1>Little rabbit</h1><p id="text">The little rabbit had a map.</p><input value="rabbit"><div contenteditable="true">rabbit</div><code>rabbit</code></body></html>';
 const server=http.createServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=`http://127.0.0.1:${server.address().port}/`;
 let context;
 try{
  context=await chromium.launchPersistentContext(path.join(tmp,'profile'),{executablePath:process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-extensions-except='+extension,'--load-extension='+extension]});
  const manager=await context.newPage();await manager.goto('chrome://extensions/');
  const info=await manager.evaluate(async()=> (await chrome.developerPrivate.getExtensionsInfo({includeDisabled:true,includeTerminated:true})).find(x=>x.name==='Boulingua Scriptbridge'));
  assert.equal(info.state,'ENABLED');assert.deepEqual(info.manifestErrors,[]);assert.deepEqual(info.installWarnings,[]);
  const web=await context.newPage();await web.goto(url);const original=await web.locator('body').innerHTML();
  const popup=await context.newPage();
  // A headless tab models an action popup. Its active-tab query must address
  // the fixture rather than the extension tab itself; all other APIs are real.
  await popup.addInitScript(({url})=>{const query=chrome.tabs.query.bind(chrome.tabs);chrome.tabs.query=async q=>q.active?(await query({})).filter(t=>t.url===url):query(q);},{url});
  const errors=[];popup.on('pageerror',e=>errors.push(e.message));
  await popup.goto(`chrome-extension://${info.id}/popup.html`);await popup.waitForFunction(()=>document.querySelector('#status').textContent==='Ready when you are.');
  await popup.locator('#percent').fill('100');await popup.locator('#apply').click();await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('letters changed'));
  assert.notEqual(await web.locator('#text').innerText(),'The little rabbit had a map.');assert.equal(await web.locator('input').inputValue(),'rabbit');assert.equal(await web.locator('[contenteditable]').innerText(),'rabbit');
  await web.keyboard.down('Alt');assert.equal(await web.locator('#text').innerText(),'The little rabbit had a map.');await web.keyboard.up('Alt');await web.waitForFunction(()=>document.querySelector('#text').textContent!=='The little rabbit had a map.');
  await web.evaluate(()=>{const p=document.createElement('p');p.id='dynamic';p.textContent='little map';document.body.append(p);});await web.waitForFunction(()=>document.querySelector('#dynamic').textContent!=='little map');
  await popup.locator('#restore').click();await popup.waitForFunction(()=>document.querySelector('#status').textContent==='Original text is showing.');assert.equal(await web.locator('#dynamic').innerText(),'little map');
  await web.locator('#dynamic').evaluate(e=>e.remove());assert.equal(await web.locator('body').innerHTML(),original);
  await popup.locator('#always').check();await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('letters changed'));
  await web.reload();await web.waitForFunction(()=>document.querySelector('#text').textContent!=='The little rabbit had a map.');
  await popup.locator('#always').uncheck();await popup.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Automatic practice is off.'));
  // Required localhost permission belongs only to the test fixture. The real
  // package grants optional access; this also exercises graceful revoke failure.
  await web.reload();assert.equal(await web.locator('body').innerHTML(),original);
  assert.deepEqual(errors,[]);
  console.log('PASS: real Chromium install, popup controls, injection, input protection, Alt peek, dynamic content, lossless restore and opt-in reload/unregister. Consent dialog itself is not automated.');
 }finally{if(context)await context.close();await new Promise(r=>server.close(r));await fs.rm(tmp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
