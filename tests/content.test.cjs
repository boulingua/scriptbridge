const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const sleep=()=>new Promise(r=>setTimeout(r,70));
function fixture(){
 const dom=new JSDOM('<!doctype html><html lang="en"><body><p id="text">The little rabbit had a map.</p><p lang="fr">Le petit lapin.</p><input value="rabbit"><textarea>rabbit</textarea><div contenteditable="true"><p>rabbit</p></div><code>rabbit</code><a href="/rabbit" title="rabbit">rabbit</a><p class="azbuka-skip">rabbit</p></body></html>',{url:'https://example.test',runScripts:'outside-only',pretendToBeVisual:true});
 const listeners=[];dom.window.chrome={runtime:{onMessage:{addListener:f=>listeners.push(f)}},storage:{local:{get:async()=>({})}}};
 for(const f of ['engine.js','content.js'])dom.window.eval(fs.readFileSync(require.resolve('../extension/'+f),'utf8'));
 const send=(type,settings={source:'en',profile:'greek',percent:100})=>new Promise(resolve=>{for(const f of listeners)f({type:'scriptbridge:'+type,settings},{},resolve);});
 return {dom,doc:dom.window.document,send};
}
test('apply, stage change, restore preserve markup, attributes, forms and foreign islands',async()=>{
 const {dom,doc,send}=fixture(),original=doc.body.innerHTML;
 await send('apply');assert.notEqual(doc.querySelector('#text').textContent,'The little rabbit had a map.');
 for(const s of ['textarea','code','[contenteditable]','.azbuka-skip'])assert.equal(doc.querySelector(s).textContent,'rabbit');
 assert.equal(doc.querySelector('[lang=fr]').textContent,'Le petit lapin.');assert.equal(doc.querySelector('a').getAttribute('href'),'/rabbit');assert.equal(doc.querySelector('a').title,'rabbit');
 await send('apply',{source:'en',profile:'ukrainian',percent:20,stage:1});await send('restore');assert.equal(doc.body.innerHTML,original);dom.window.close();
});
test('dynamic insertions and site rewrites become fresh originals',async()=>{
 const {dom,doc,send}=fixture();await send('apply');const n=doc.createElement('p');n.textContent='little map';doc.body.append(n);await sleep();assert.notEqual(n.textContent,'little map');
 n.firstChild.data='new little map';await sleep();assert.notEqual(n.textContent,'new little map');
 await send('restore');assert.equal(n.textContent,'new little map');dom.window.close();
});
test('Alt peek restores originals; release reapplies; making a node editable restores it',async()=>{
 const {dom,doc,send}=fixture();await send('apply');doc.body.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Alt',bubbles:true}));assert.equal(doc.querySelector('#text').textContent,'The little rabbit had a map.');
 doc.body.dispatchEvent(new dom.window.KeyboardEvent('keyup',{key:'Alt',bubbles:true}));await sleep();assert.notEqual(doc.querySelector('#text').textContent,'The little rabbit had a map.');
 doc.querySelector('#text').setAttribute('contenteditable','true');await sleep();assert.equal(doc.querySelector('#text').textContent,'The little rabbit had a map.');await send('restore');dom.window.close();
});
test('fresh page edit immediately before restoring is never overwritten',async()=>{
 const {dom,doc,send}=fixture();await send('apply');doc.querySelector('#text').firstChild.data='fresh site text';await send('restore');assert.equal(doc.querySelector('#text').textContent,'fresh site text');dom.window.close();
});

test('document-wide editing is protected',async()=>{
 const {dom,doc,send}=fixture();doc.designMode='on';const original=doc.body.innerHTML;await send('apply');assert.equal(doc.body.innerHTML,original);await send('restore');dom.window.close();
});
