(() => {
  'use strict';
  if (globalThis.__scriptbridge) return;
  const records = new Map(), queue = new Set(), waiters = [];
  const excluded = 'script,style,noscript,textarea,input,select,button,code,pre,kbd,samp,svg,math,canvas,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[data-no-scriptbridge],.azbuka-skip,[translate="no"],[hidden]';
  let options = null, timer = 0, peeking = false, composing = false, interacted = false;
  function allowed(node) {
    if (document.designMode?.toLowerCase() === 'on') return false;
    const p = node.parentElement;
    if (!p || !node.isConnected || p.closest(excluded)) return false;
    const lang = p.closest('[lang]')?.getAttribute('lang');
    return !lang || Scriptbridge.language(lang) === options.source;
  }
  function add(root) {
    if (root.nodeType === Node.TEXT_NODE) queue.add(root);
    else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) queue.add(n);
    }
  }
  function status() {
    let eligible = 0, replaced = 0;
    for (const [node,r] of records) if (node.isConnected) {eligible += r.eligible || 0; replaced += r.replaced || 0;}
    return {active: !!options, peeking, eligible, replaced: peeking ? 0 : replaced, settings: options, language: document.documentElement.lang};
  }
  function complete() {for (const resolve of waiters.splice(0)) resolve(status());}
  function schedule() {if (!timer && !peeking && !composing && options) timer = setTimeout(chunk, 0);}
  function chunk() {
    timer = 0;
    if (!options || peeking || composing) {complete(); return;}
    const start = performance.now(); let count = 0;
    for (const node of queue) {
      queue.delete(node);
      const old = records.get(node);
      if (!allowed(node)) {
        if (old && node.data === old.last) node.data = old.original;
        records.delete(node);
      } else if (node.data.trim()) {
        const r = old || {original: node.data, last: node.data};
        if (node.data !== r.last) r.original = node.data;
        const out = Scriptbridge.transform(r.original, options);
        r.last = out.text; r.eligible = out.eligible; r.replaced = out.replaced;
        if (out.eligible) records.set(node, r); else records.delete(node);
        if (node.data !== out.text) node.data = out.text;
      } else records.delete(node);
      if (++count >= 250 || performance.now() - start >= 12) break;
    }
    if (queue.size) schedule(); else complete();
  }
  const observer = new MutationObserver(mutations => {
    if (!options || peeking) return;
    for (const m of mutations) {
      if (m.type === 'characterData') {if (records.get(m.target)?.last !== m.target.data) add(m.target);}
      else if (m.type === 'attributes') add(m.target);
      else {
        for (const n of m.addedNodes) add(n);
        if (m.removedNodes.length) for (const [n] of records) if (!n.isConnected) records.delete(n);
      }
    }
    if (queue.size) schedule();
  });
  function observe() {if (document.body) observer.observe(document.body, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['lang','contenteditable','translate','data-no-scriptbridge','hidden','class']});}
  function apply(input) {
    options = Scriptbridge.settings(input); peeking = false;
    for (const [n] of records) if (!n.isConnected) records.delete(n);
    observe(); if (document.body) add(document.body);
    return new Promise(resolve => {waiters.push(resolve); schedule();});
  }
  function reveal() {
    observer.disconnect(); clearTimeout(timer); timer = 0; queue.clear();
    for (const [node,r] of records) {
      if (node.data === r.last) node.data = r.original; else r.original = node.data;
      r.last = node.data;
    }
    complete();
  }
  function stop() {reveal();records.clear();options=null;peeking=false;}
  function unpeek() {if (peeking && options) {peeking=false;apply(options);}}
  document.addEventListener('keydown',e=>{if(e.key==='Alt'&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.repeat&&options&&!peeking&&!e.isComposing&&!e.target.closest?.(excluded)){peeking=true;reveal();}},true);
  document.addEventListener('keyup',e=>{if(e.key==='Alt')unpeek();},true);
  window.addEventListener('blur',unpeek);
  document.addEventListener('compositionstart',()=>{composing=true;},true);
  document.addEventListener('compositionend',()=>{composing=false;schedule();},true);
  chrome.runtime.onMessage.addListener((message,_sender,respond)=>{
    if(message.type==='scriptbridge:apply'){interacted=true;apply(message.settings).then(respond);return true;}
    if(message.type==='scriptbridge:restore'){interacted=true;stop();respond(status());}
    else if(message.type==='scriptbridge:status')respond(status());
  });
  globalThis.__scriptbridge={stop,status};
  chrome.storage.local.get('sites').then(({sites})=>{if(!interacted&&sites?.[location.origin])apply(sites[location.origin]);}).catch(()=>{});
})();
