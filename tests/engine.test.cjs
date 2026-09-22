const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../extension/engine.js');
test('zero percent preserves every byte; 100 percent changes every eligible letter',()=>{
 const text='Little rabbit: ä ö é è Ω Привіт. https://example.com/rabbit mail@example.com';
 for(const source of ['en','fr','de'])for(const profile of Object.keys(E.profiles)){
  assert.equal(E.transform(text,{source,profile,percent:0}).text,text);
  const out=E.transform(text,{source,profile,percent:100});assert.equal(out.eligible,out.replaced);
  assert.ok(out.text.includes('https://example.com/rabbit mail@example.com'));
 }
});
test('selection is deterministic and increases monotonically with density',()=>{
 const text='The little rabbit had a black hat. '.repeat(60);let prev=text;
 for(let percent=0;percent<=100;percent+=5){const out=E.transform(text,{percent});assert.deepEqual(out,E.transform(text,{percent}));
  for(let i=0;i<text.length;i++)if(prev[i]!==text[i])assert.equal(out.text[i],prev[i]);prev=out.text;
 }
});
test('phonetic false friends and source spelling contexts are not blindly mapped',()=>{
 assert.equal(E.transform('β b',{profile:'greek',percent:100}).text,'β b');
 assert.equal(E.transform('cat thing phone knight',{profile:'greek',percent:100}).text.includes('τhing'),false);
 assert.equal(E.transform('air eau bon pain',{source:'fr',profile:'greek',percent:100}).text.includes('bο'),false);
 assert.equal(E.transform('ö ü',{source:'de',profile:'russian',percent:100}).text,'ö ü');
 assert.equal(E.transform('Gaga',{source:'fr',profile:'ukrainian',percent:100}).text,'Gаgа');
 assert.equal(E.transform('vie',{source:'fr',profile:'ukrainian',percent:100}).text,'vie');
});
test('Nordic matches are source-dependent, single letters and non-empty',()=>{
 assert.equal(E.transform('rabbit table',{profile:'nordic',percent:100}).text,'ræbbit table');
 assert.equal(E.transform('mère',{source:'fr',profile:'nordic',percent:100}).text,'märe');
 assert.equal(E.transform('Vögel',{source:'de',profile:'nordic',percent:100}).text,'Vøgel');
});
test('stages restrict candidates while preserving the original source',()=>{
 assert.equal(E.transform('m n t f p',{percent:100,stage:1}).text,'μ ν τ f p');
 assert.equal(E.transform('m n t f p',{percent:100,stage:2}).text,'μ ν τ φ π');
 assert.equal(E.settings({percent:300}).percent,100);assert.equal(E.settings({percent:-10}).percent,0);
});

test('consolidated Cyrillic migrates saved profiles and avoids differing national letters',()=>{
 for(const profile of ['russian','ukrainian'])assert.equal(E.settings({profile}).profile,'cyrillic');
 assert.equal(E.transform('g i v',{source:'fr',profile:'cyrillic',percent:100}).text,'g i v');
 assert.equal(E.transform('m n p',{profile:'cyrillic',percent:100}).text,'м н п');
});
test('Polish and Czech substitutions follow explicit source sounds',()=>{
 for(const profile of ['polish','czech']){
  assert.equal(E.transform('yes yellow',{profile,percent:100}).text,'jes jellow');
  assert.equal(E.transform('Zahl',{source:'de',profile,percent:100}).text,'Cahl');
  assert.equal(E.transform('jewel',{profile,percent:100}).text,'jewel');
 }
 assert.equal(E.transform('jour',{source:'fr',profile:'polish',percent:100}).text,'żour');
 assert.equal(E.transform('jour',{source:'fr',profile:'czech',percent:100}).text,'žour');
 assert.equal(E.transform('water sword',{profile:'polish',percent:100}).text,'łater sword');
});
