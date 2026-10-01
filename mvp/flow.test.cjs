const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = __dirname + '/';
function harness(initial) {
  const elements = {};
  const storage = {'chapopo-mvp-4-v1':JSON.stringify(initial)};
  const element = s => elements[s] ||= {style:{},textContent:'',innerHTML:'',value:'',dataset:{},focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){},showModal(){},close(){}};
  const tabs=['mission','route','logs'].map(v=>{const x=element(v);x.dataset.view=v;return x;});
  const c={window:{},document:{querySelector:element,querySelectorAll:()=>tabs},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},confirm:()=>true};
  vm.createContext(c);
  const boot=()=>{vm.runInContext(fs.readFileSync(base+'config.js','utf8'),c);vm.runInContext(fs.readFileSync(base+'app.js','utf8'),c);};
  boot();return {element,c,boot,tabs,storage};
}
const h=harness(null),el=h.element;
el('#start').onclick();
const answer=s=>{el('#answer').value=s;el('#answerForm').onsubmit({preventDefault(){}});};
answer('wrong');assert.match(el('#feedback').textContent,/一致しません/);
for(let i=0;i<4;i++){
  if(i===2){answer('SAFE');assert.match(el('#feedback').textContent,/レンタル後/);el('#rent').onclick();}
  answer(i===0?'３６５':h.c.window.EVENT_CONFIG.stations[i].answer.toLowerCase());
  assert.match(el('#app').innerHTML,/正解！/);
  h.boot();assert.match(el('#app').innerHTML,/正解！/);
  el('#continue').onclick();
}
assert.match(el('#app').innerHTML,/チャポポ救出成功/);
h.tabs[2].onclick();assert.match(el('#app').innerHTML,/365日/);
h.tabs[1].onclick();assert.match(el('#app').innerHTML,/捜査ルート/);
el('#reset').onclick();assert.match(el('#app').innerHTML,/捜査を始める/);
const migrated=harness({done:2,rented:false,rescue:false});assert.match(migrated.element('#app').innerHTML,/SAFE ENERGY/);
console.log('PASS intro, wrong answer, 4 promotion screens, reload, continue, rental gate, logs, route, reset, previous progress migration');
