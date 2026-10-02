const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = __dirname + '/';
function harness(initial) {
  const elements = {};
  const storage = {'chapopo-mvp-4-v1':JSON.stringify(initial)};
  const element = s => elements[s] ||= {style:{},textContent:'',innerHTML:'',value:'',dataset:{},append(){},after(){},insertAdjacentHTML(position,html){this.inserted=html;},focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){},showModal(){},close(){}};
  const tabs=['mission','logs'].map(v=>{const x=element(v);x.dataset.view=v;return x;});
  const c={window:{},document:{createElement:()=>element('#puzzleContent'),querySelector:element,querySelectorAll:()=>tabs},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},confirm:()=>true};
  vm.createContext(c);
  const boot=()=>{vm.runInContext(fs.readFileSync(base+'config.js','utf8'),c);vm.runInContext(fs.readFileSync(base+'app.js','utf8'),c);};
  boot();return {element,c,boot,tabs,storage};
}
const h=harness(null),el=h.element;
for(const art of [...h.c.window.EVENT_CONFIG.sceneArt,h.c.window.EVENT_CONFIG.endingArt])assert.ok(fs.existsSync(base+art.file));
assert.equal(new Set(h.c.window.EVENT_CONFIG.sceneArt.map(a=>a.file)).size,4);
assert.doesNotMatch(JSON.stringify(h.c.window.EVENT_CONFIG.prologue),/夜/);
el('#start').onclick();
assert.match(el('#app').innerHTML,/次の目的地/);
const answer=s=>{el('#answer').value=s;el('#answerForm').onsubmit({preventDefault(){}});};
for(let i=0;i<4;i++){
  assert.match(el('#app').innerHTML,/到着した/);
  assert.doesNotMatch(el('#app').innerHTML,/answerForm/);
  el('#arrive').onclick();assert.match(el('#app').innerHTML,/story-sheet/);
  const arrivalFile=h.c.window.EVENT_CONFIG.sceneArt[i].file;
  assert.ok(el('#app').innerHTML.includes(arrivalFile));
  el('#solve').onclick();assert.match(el('#app').innerHTML,/answerForm/);
  if(i!==2){answer('wrong');assert.match(el('#feedback').textContent,/一致しません/);}
  if(i===2){answer('SAFE');assert.match(el('#feedback').textContent,/レンタル後/);el('#rent').onclick();}
  answer(i===0?'３６５':h.c.window.EVENT_CONFIG.stations[i].answer.toLowerCase());
  assert.match(el('#app').innerHTML,/正解！/);
  assert.match(el('#app').innerHTML,/result-information/);
  assert.ok(el('#app').innerHTML.includes(h.c.window.EVENT_CONFIG.promotions[i].body));
  assert.doesNotMatch(el('#app').innerHTML,/storyReader|reader-prose|<img|ガルル|チャポポが目を開けた|次のステーションへ|救出を完了する/);
  h.boot();assert.match(el('#app').innerHTML,/result-information/);
  el('#resultNext').onclick();
  assert.doesNotMatch(el('#app').innerHTML,/正解！|result-information|promotion-body/);
  if(i===3){assert.match(el('#app').innerHTML,/チャポポが目を開けた/);assert.doesNotMatch(el('#app').innerHTML,/物語のエネルギー/);assert.match(el('#app').innerHTML,/ガルルはどうなった/);}
  assert.doesNotMatch(el('#app').innerHTML,/謎の解説|解説を読み終える|storyNext/);
  const outcomeFile=i===3?h.c.window.EVENT_CONFIG.endingArt.file:h.c.window.EVENT_CONFIG.sceneArt[h.c.window.EVENT_CONFIG.outcomeArt[i]].file;
  assert.notEqual(arrivalFile,outcomeFile);
  if(i<3)assert.notEqual(outcomeFile,h.c.window.EVENT_CONFIG.sceneArt[i+1].file);
  assert.ok(el('#app').innerHTML.includes(outcomeFile));
  h.boot();assert.match(el('#app').innerHTML,/story-sheet/);
  assert.doesNotMatch(el('#app').innerHTML,/正解！/);
  el('#continue').onclick();
}
assert.match(el('#app').innerHTML,/チャポポ救出成功/);
assert.match(el('#app').innerHTML,/返却完了/);
assert.doesNotMatch(el('#app').innerHTML,/day-ending.jpg/);
assert.match(el('#app').innerHTML,/<figcaption>チャポポ<\/figcaption>/);
assert.doesNotMatch(fs.readFileSync(base+'app.js','utf8'),/id="pre"|id="post"|surveySave|puzzle-explanation|解説を読み終える/);
h.tabs[1].onclick();assert.match(el('#app').innerHTML,/365日/);
assert.doesNotMatch(fs.readFileSync(base+'index.html','utf8'),/data-view="route"/);
el('#reset').onclick();assert.match(el('#app').innerHTML,/捜査を始める/);
const migrated=harness({done:2,rented:false,rescue:false});assert.match(migrated.element('#app').innerHTML,/ビックカメラ/);
assert.doesNotMatch(fs.readFileSync(base+'app.js','utf8'),/<br\s*\/?\s*>/);
const pending=harness({done:1,reveal:0,started:true});
assert.match(pending.element('#app').innerHTML,/result-information/);
pending.element('#resultNext').onclick();
pending.tabs[1].onclick();pending.tabs[0].onclick();
assert.match(pending.element('#app').innerHTML,/story-sheet/);
console.log('PASS 4 flows: correct/brand-only screen → separate story → next destination, persisted result/story phases, rental gate, changing art, logs, reset, migration, no hard-coded prose breaks');
