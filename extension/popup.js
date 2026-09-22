'use strict';
const $=id=>document.getElementById(id);
let tab,origin,initial;
for(const [value,p]of Object.entries(Scriptbridge.profiles))$('profile').add(new Option(p.label,value));
function chosen(){return Scriptbridge.settings({source:$('source').value,profile:$('profile').value,percent:$('percent').value,stage:$('stage').value});}
function preview(){const s=chosen();$('stage').disabled=s.profile==='nordic';$('amount').value=s.percent+'%';$('note').textContent=Scriptbridge.profiles[s.profile].note;const t={en:'The little rabbit felt quite puzzled.',fr:'La mère rêve près de la fenêtre.',de:'Die Vögel fliegen über den großen Garten.'}[s.source];$('preview').textContent=Scriptbridge.transform(t,s).text;}
function report(s){$('status').textContent=s.active?`${s.replaced} of ${s.eligible} eligible letters changed.`:'Original text is showing.';}
async function connect(){await chrome.scripting.executeScript({target:{tabId:tab.id},files:['engine.js','content.js']});}
async function message(type){return chrome.tabs.sendMessage(tab.id,{type,settings:chosen()});}
async function apply(){await connect();report(await message('scriptbridge:apply'));await chrome.storage.local.set({defaults:chosen()});if($('always').checked){const {sites={}}=await chrome.storage.local.get('sites');sites[origin]=chosen();await chrome.storage.local.set({sites});}}
function fail(error){$('status').textContent='This page cannot be changed. Open a regular website and try again.';console.warn(error);}
for(const id of ['source','profile','percent','stage'])$(id).addEventListener('input',preview);
$('apply').addEventListener('click',()=>apply().catch(fail));
$('restore').addEventListener('click',async()=>{try{await connect();report(await message('scriptbridge:restore'));}catch(e){fail(e);}});
$('always').addEventListener('change',async()=>{
  const enable=$('always').checked;
  try{
    if(!origin)throw Error('unsupported page');
    const pattern=origin+'/*',id='site-'+Scriptbridge.hash(origin);
    // Request originates directly in the checkbox gesture, before any other await.
    if(enable && !await chrome.permissions.request({origins:[pattern]})){$('always').checked=false;$('status').textContent='Site access was not granted.';return;}
    const {sites={}}=await chrome.storage.local.get('sites');
    if(enable){sites[origin]=chosen();await chrome.scripting.unregisterContentScripts({ids:[id]}).catch(()=>{});await chrome.scripting.registerContentScripts([{id,matches:[pattern],js:['engine.js','content.js'],runAt:'document_idle',persistAcrossSessions:true}]);}
    else{delete sites[origin];await chrome.scripting.unregisterContentScripts({ids:[id]}).catch(()=>{});}
    await chrome.storage.local.set({sites});
    if(enable)await apply();else{
      try{report(await message('scriptbridge:restore'));}catch{report({active:false});}
      try{await chrome.permissions.remove({origins:[pattern]});}
      catch{$('status').textContent='Automatic practice is off. Remaining site access can be removed in Chrome’s extension settings.';}
    }
  }catch(e){$('always').checked=!enable;fail(e);}
});
(async()=>{
  [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const {defaults,sites={}}=await chrome.storage.local.get(['defaults','sites']);
  if(!tab?.url||!/^https?:\/\//.test(tab.url))throw Error('unsupported page');
  origin=new URL(tab.url).origin;initial=sites[origin]||defaults||Scriptbridge.settings();
  $('always').checked=!!sites[origin];
  try{const [{result:lang}]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>document.documentElement.lang});if(['en','fr','de'].includes(Scriptbridge.language(lang)))initial={...initial,source:Scriptbridge.language(lang)};}catch{}
  $('stage').value=initial.stage||3;$('source').value=initial.source;$('profile').value=initial.profile;$('percent').value=initial.percent;preview();
  try{report(await message('scriptbridge:status'));}catch{$('status').textContent='Ready when you are.';}
})().catch(fail);
