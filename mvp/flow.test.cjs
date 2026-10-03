const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = __dirname + '/';
const crypto = require('node:crypto');
const fontRules=fs.readFileSync(base+'mission.css','utf8').split('\n').filter(line=>line.includes("'Yusei Magic'")&&!line.startsWith('@font-face'));
assert.equal(fontRules.length,1);
assert.ok(fontRules[0].startsWith('.reading-body .dialogue blockquote,'));
function harness(initial,windowExtras={}) {
  const elements = {};
  const storage = {'chapopo-mvp-4-v2':JSON.stringify(initial)};
  const element = s => elements[s] ||= {style:{},textContent:'',innerHTML:'',value:'',dataset:{},append(){},after(){},insertAdjacentHTML(position,html){this.inserted=html;},focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){},showModal(){},close(){}};
  const tabs=['mission','logs'].map(v=>{const x=element(v);x.dataset.view=v;return x;});
  const c={window:{...windowExtras},document:{body:{classList:{toggle(){}}},createElement:()=>element('#puzzleContent'),querySelector:element,querySelectorAll:s=>s==='.inserted-scene'?[]:tabs},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},confirm:()=>true};
  vm.createContext(c);
  const boot=()=>{vm.runInContext(fs.readFileSync(base+'config.js','utf8'),c);vm.runInContext(fs.readFileSync(base+'story-revision-r36.js','utf8'),c);vm.runInContext(fs.readFileSync(base+'story-copy-r53.js','utf8'),c);vm.runInContext(fs.readFileSync(base+'app.js','utf8'),c);};
  boot();return {element,c,boot,tabs,storage};
}
const h=harness(null),el=h.element;
const artConfig=h.c.window.EVENT_CONFIG;
const uniqueSceneFiles=[artConfig.introductionArt.file,...artConfig.introArt.map(a=>a.file),artConfig.rentalArt.file,...artConfig.storyArt.flatMap(a=>[a.arrival.file,a.after.file]),...artConfig.storyInserts.flatMap(a=>[a.arrival.file,a.after.file]),...artConfig.promotionArt.map(a=>a.file),'goal-celebration-r30.png'];
assert.equal(uniqueSceneFiles.length,25);
assert.equal(new Set(uniqueSceneFiles).size,25,'Each page must use a different narrative illustration');
const artHashes=uniqueSceneFiles.map(file=>crypto.createHash('sha256').update(fs.readFileSync(base+file)).digest('hex'));
assert.equal(new Set(artHashes).size,25,'Renaming one image does not count as a new illustration');
assert.ok(el('#app').innerHTML.includes('comic-title-story-r57.png'));
assert.doesNotMatch(el('#app').innerHTML,/event-start|event-lead|event-how/);
assert.equal(el('#pageBack').disabled,true);
const floorDestination=harness({done:1,started:true,rented:false,rescue:false});
assert.match(floorDestination.element('#app').innerHTML,/<h1><span>タイトーステーション<\/span><span>新宿東口店 4F<\/span><\/h1>/);
assert.doesNotMatch(floorDestination.element('#app').innerHTML,/class="travel-place"/);
for(const [done,floor] of [[0,'2F'],[2,'1F'],[3,'2F']]){
  const destination=harness({done,started:true,rented:false,rescue:false});
  const html=destination.element('#app').innerHTML;
  assert.match(html,new RegExp('<h1>[\\s\\S]*'+floor+'[\\s\\S]*</h1>'));
  assert.doesNotMatch(html,/<p class="travel-place">[12]F/);
  assert.doesNotMatch(html,/class="travel-place"/);
  const location={0:'シネシティ広場側',2:'南側エレベーター前',3:'西武新宿駅側'}[done];
  assert.ok(html.includes('<span class="destination-location">'+location+'</span></h1>'));
}
assert.match(el('#app').innerHTML,/event-introduction/);
assert.doesNotMatch(el('#app').innerHTML,/新宿の街で、|event-facts/);
assert.doesNotMatch(el('#app').innerHTML,/買い物帰りの人たち/);
el('#introductionNext').onclick();
assert.ok(fs.existsSync(base+'event-city-r15.jpg'));
assert.ok(fs.existsSync(base+'event-street-r20.jpg'));
assert.ok(fs.existsSync(base+'chapter-lettering-r15.jpg'));
assert.ok(fs.existsSync(base+'YuseiMagic-Regular.woff2'));
for(const art of h.c.window.EVENT_CONFIG.promotionArt)assert.ok(fs.existsSync(base+art.file));
assert.doesNotMatch(fs.readFileSync(base+'mission.css','utf8'),/\.result-answer\s*\{[^}]*Arial/);
const visualApp=fs.readFileSync(base+'app.js','utf8');
const entryHtml=fs.readFileSync(base+'index.html','utf8');
assert.doesNotMatch(visualApp,/link\(st\.map|地図を開く|地図 ↗/);
assert.match(visualApp,/goal-celebration-r30\.png/);
assert.ok(fs.existsSync(base+'goal-celebration-r30.png'));
assert.match(entryHtml,/chapter-ink/);
for(const p of h.c.window.EVENT_CONFIG.promotions){assert.match(p.body,/CHARGESPOT/);assert.match(p.body,/\d/);}
assert.match(entryHtml,/class="event-banner"/);
assert.doesNotMatch(entryHtml,/data-view="logs"|捜査メニュー/);
assert.match(entryHtml,/<footer>[\s\S]*id="settingsOpen"[\s\S]*<\/footer>/);
assert.match(entryHtml,/comic-title-story-r57\.png/);
assert.ok(fs.existsSync(base+'comic-title-story-r57.png'));
assert.doesNotMatch(visualApp,/word-unit|typesetWords|Intl\.Segmenter/);
assert.ok(fs.existsSync(base+'MPLUSRounded1c-Regular.woff2'));
assert.match(fs.readFileSync(base+'mission.css','utf8'),/body\{font-family:'M PLUS Rounded 1c'/);
assert.ok(h.c.window.EVENT_CONFIG.introText.join('').length>=250);
for(const chapter of h.c.window.EVENT_CONFIG.storyText)for(const text of Object.values(chapter)){
  assert.ok(text.join('').length>=200);
  assert.doesNotMatch(text.join(''),/ではない|記号|数字|冊子|謎|合言葉/);
}
const inserts=h.c.window.EVENT_CONFIG.storyInserts.flatMap(c=>[c.arrival.file,c.after.file]);
assert.equal(new Set(inserts).size,8);
for(const file of inserts)assert.ok(fs.existsSync(base+file),'Missing insert '+file);
function assertIllustrated(html,i,phase){
  assert.equal((html.match(/class="inserted-scene"/g)||[]).length,2);
  const file=h.c.window.EVENT_CONFIG.storyInserts[i][phase].file;
  const image=html.indexOf(file);
  assert.ok(image>0,'Missing story detail '+file);
  assert.ok(html.lastIndexOf('<p>',image)>0,'Prose before detail');
  assert.ok(html.indexOf('<p>',html.indexOf('</figure>',image))>image,'Prose resumes after detail');
}
const prologueHtml=el('#app').innerHTML;
assert.equal((prologueHtml.match(/class="inserted-scene"/g)||[]).length,2);
for(const art of h.c.window.EVENT_CONFIG.introArt){
  assert.ok(fs.existsSync(base+art.file));
  assert.ok(prologueHtml.includes(art.file));
  assert.notEqual(art.file,h.c.window.EVENT_CONFIG.storyArt[0].arrival.file);
  assert.notEqual(art.file,h.c.window.EVENT_CONFIG.storyInserts[0].arrival.file);
}
const firstArrival=harness({introduced:true,started:true,done:0,arrived:[0]});
assert.doesNotMatch(firstArrival.element('#app').innerHTML,/買い物帰りの人たち|ガルルが……！/);
assert.match(firstArrival.element('#app').innerHTML,/短い記録が開いた/);
assertIllustrated(firstArrival.element('#app').innerHTML,0,'arrival');
assert.match(visualApp,/destination-panorama/);
assert.match(visualApp,/promotion-spread/);
assert.match(visualApp,/rental-visual/);
assert.match(visualApp,/rental-steps/);
const reduced=harness(null,{matchMedia:()=>({matches:true}),IntersectionObserver:class{constructor(){throw Error('Observer must not run with reduced motion');}}});
assert.match(reduced.element('#app').innerHTML,/物語へ進む/);
let observerStarts=0,observerStops=0;
const motion=harness(null,{matchMedia:()=>({matches:false}),IntersectionObserver:class{constructor(){observerStarts++;}observe(){}unobserve(){}disconnect(){observerStops++;}}});
motion.element('#introductionNext').onclick();
motion.element('#start').onclick();
assert.equal(observerStarts,3);assert.equal(observerStops,2);
for(const art of [...h.c.window.EVENT_CONFIG.sceneArt,h.c.window.EVENT_CONFIG.endingArt])assert.ok(fs.existsSync(base+art.file));
const comicFiles=h.c.window.EVENT_CONFIG.storyArt.flatMap(c=>[c.arrival.file,c.after.file]);
for(const file of comicFiles)assert.ok(fs.existsSync(base+file),'Missing comic '+file);
assert.equal(new Set(comicFiles).size,8);
assert.ok(fs.existsSync(base+'comic-title-r13.jpg'));
assert.equal(new Set(h.c.window.EVENT_CONFIG.sceneArt.map(a=>a.file)).size,4);
assert.doesNotMatch(JSON.stringify(h.c.window.EVENT_CONFIG.prologue),/夜/);
el('#start').onclick();
assert.match(el('#app').innerHTML,/次の目的地/);
const answer=s=>{el('#answer').value=s;el('#answerForm').onsubmit({preventDefault(){}});};
for(let i=0;i<4;i++){
  assert.match(el('#app').innerHTML,/到着した/);
  assert.doesNotMatch(el('#app').innerHTML,/answerForm/);
  el('#arrive').onclick();assert.match(el('#app').innerHTML,/reading-body/);
  const arrivalFile=h.c.window.EVENT_CONFIG.storyArt[i].arrival.file;
  assert.ok(el('#app').innerHTML.includes(arrivalFile));
  const arrivalHtml=el('#app').innerHTML;
  assertIllustrated(arrivalHtml,i,'arrival');
  assert.ok(arrivalHtml.indexOf('reading-body')<arrivalHtml.indexOf('inserted-scene'));
  assert.ok(arrivalHtml.indexOf('<p>',arrivalHtml.indexOf('reading-body'))<arrivalHtml.indexOf('inserted-scene'));
  assert.ok(arrivalHtml.indexOf('<p>',arrivalHtml.indexOf('</figure>',arrivalHtml.indexOf('inserted-scene')))>arrivalHtml.indexOf('inserted-scene'));
  assert.doesNotMatch(arrivalHtml,/comic-art|comic-transcript|物語を文字で読む/);
  assert.match(arrivalHtml,/<h1 class="sr-only">Q\d /);
  assert.doesNotMatch(fs.readFileSync(base+'app.js','utf8'),/C\.storyTitles/);
  el('#solve').onclick();
  if(i===1){assert.match(el('#app').innerHTML,/rental-page/);assert.doesNotMatch(el('#app').innerHTML,/answerForm/);h.boot();assert.doesNotMatch(el('#app').innerHTML,/answerForm/);el('#rent').onclick();assert.match(el('#app').innerHTML,/answerForm/);assert.doesNotMatch(el('#app').innerHTML,/レンタル確認済み|stage-heading|class="place"|<h1>SAFE ENERGY/);h.boot();}
  assert.match(el('#app').innerHTML,/answerForm/);
  assert.doesNotMatch(el('#app').innerHTML,/stage-heading|class="place"|rental-confirmed/);
  assert.match(el('#app').innerHTML,/<h1 class="sr-only">謎の答えを入力<\/h1>/);
  assert.match(el('#app').innerHTML,new RegExp('冊子のQ'+(i+1)));
  if(i===1){assert.match(el('#app').innerHTML,/CHARGESPOTアプリの画面を見て/);assert.doesNotMatch(el('#app').innerHTML,/現地映像|スタッフから追加/);}
  answer('wrong');assert.match(el('#feedback').textContent,/一致しません/);
  if(i===1)assert.match(el('#feedback').textContent,/アプリ画面/);
  answer(i===0?'ガイシュツ':h.c.window.EVENT_CONFIG.stations[i].answer.toLowerCase());
  assert.match(el('#app').innerHTML,/正解！/);
  if(i!==1)assert.match(el('#app').innerHTML,/result-information/);
  if(i!==1)assert.ok(el('#app').innerHTML.includes(h.c.window.EVENT_CONFIG.promotions[i].body));
  else {assert.match(el('#app').innerHTML,/<p class="result-answer">EST<\/p>/);assertIllustrated(el('#app').innerHTML,i,'after');assert.match(el('#app').innerHTML,/次のステーションへ/);assert.doesNotMatch(el('#app').innerHTML,/destination-copy|result-information/);}
  if(i!==1)assert.match(el('#app').innerHTML,/promotion-illustration/);
  if(i!==1)assert.ok(el('#app').innerHTML.includes(h.c.window.EVENT_CONFIG.promotionArt[i].file));
  if(i!==1)assert.doesNotMatch(el('#app').innerHTML,/storyReader|reader-prose|scene-st|ガルル|チャポポの声|次のステーションへ|救出を完了する/);
  h.boot();assert.match(el('#app').innerHTML,/正解！/);
  el('#resultNext').onclick();
  if(i===1){assert.match(el('#app').innerHTML,/ルミネエスト|南側エレベーター前/);assert.match(el('#app').innerHTML,/到着した/);assert.doesNotMatch(el('#app').innerHTML,/storyReader/);continue;}
  assert.doesNotMatch(el('#app').innerHTML,/正解！|result-information|promotion-body/);
  if(i===3){assert.match(el('#app').innerHTML,/ありがとう！/);assert.doesNotMatch(el('#app').innerHTML,/物語のエネルギー/);assert.match(el('#app').innerHTML,/借りればよかった/);}
  assert.doesNotMatch(el('#app').innerHTML,/謎の解説|解説を読み終える|storyNext/);
  const outcomeFile=h.c.window.EVENT_CONFIG.storyArt[i].after.file;
  assert.notEqual(arrivalFile,outcomeFile);
  if(i<3)assert.notEqual(outcomeFile,h.c.window.EVENT_CONFIG.storyArt[i+1].arrival.file);
  assert.ok(el('#app').innerHTML.includes(outcomeFile));
  assertIllustrated(el('#app').innerHTML,i,'after');
  h.boot();assert.match(el('#app').innerHTML,/reading-body/);
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
el('#reset').onclick();assert.match(el('#app').innerHTML,/物語へ進む/);
const migrated=harness({done:2,rented:false,rescue:false});assert.match(migrated.element('#app').innerHTML,/ルミネエスト/);
const staffRoute=harness({done:1,started:true,arrived:[0,1],puzzleAt:1,rented:false,rescue:false});
assert.match(staffRoute.element('#app').innerHTML,/rental-page/);
staffRoute.element('#rescue').onclick();assert.match(staffRoute.element('#app').innerHTML,/answerForm/);
assert.doesNotMatch(fs.readFileSync(base+'app.js','utf8'),/<br\s*\/?\s*>/);
const pending=harness({done:1,reveal:0,started:true});
assert.match(pending.element('#app').innerHTML,/result-information/);
pending.element('#resultNext').onclick();
pending.tabs[1].onclick();pending.tabs[0].onclick();
assert.match(pending.element('#app').innerHTML,/reading-body/);
function navigationHarness(initial){
  const entries=[],listeners={},location={hash:''};let cursor=-1;
  const clone=x=>JSON.parse(JSON.stringify(x));
  const history={state:null,pushState(state,title,url){entries.splice(cursor+1);entries.push({state:clone(state),url});cursor++;this.state=clone(state);location.hash=url;},replaceState(state,title,url){if(cursor<0){entries.push({state:clone(state),url});cursor=0;}else entries[cursor]={state:clone(state),url};this.state=clone(state);location.hash=url;}};
  const h=harness(initial,{history,location,addEventListener:(name,fn)=>listeners[name]=fn});
  const go=delta=>{cursor+=delta;history.state=clone(entries[cursor].state);location.hash=entries[cursor].url;listeners.popstate({state:history.state});};
  history.back=()=>go(-1);
  return {...h,history,location,back:()=>go(-1),forward:()=>go(1)};
}
const nav=navigationHarness(null),ne=nav.element;
assert.equal(nav.location.hash,'#/introduction');
ne('#introductionNext').onclick();assert.equal(nav.location.hash,'#/prologue');
nav.back();assert.match(ne('#app').innerHTML,/event-introduction/);
nav.forward();assert.match(ne('#app').innerHTML,/プロローグ/);
ne('#start').onclick();assert.equal(nav.location.hash,'#/station/1/destination');
ne('#arrive').onclick();assert.equal(nav.location.hash,'#/station/1/story');
ne('#solve').onclick();assert.equal(nav.location.hash,'#/station/1/puzzle');
ne('#answer').value='外出';ne('#answerForm').onsubmit({preventDefault(){}});
assert.equal(nav.location.hash,'#/station/1/correct');
ne('#resultNext').onclick();assert.equal(nav.location.hash,'#/station/1/after');
ne('#continue').onclick();assert.equal(nav.location.hash,'#/station/2/destination');
ne('#pageBack').onclick();assert.match(ne('#app').innerHTML,/Q1 物語の続き/);
nav.back();assert.match(ne('#app').innerHTML,/正解！/);
nav.back();assert.match(ne('#app').innerHTML,/answerForm/);
nav.boot();assert.match(ne('#app').innerHTML,/answerForm/);
assert.equal(JSON.parse(nav.storage['chapopo-mvp-4-v2']).done,1);
nav.forward();assert.match(ne('#app').innerHTML,/正解！/);
nav.forward();assert.match(ne('#app').innerHTML,/Q1 物語の続き/);
nav.tabs[1].onclick();assert.equal(nav.location.hash,'#/logs');
nav.back();assert.match(ne('#app').innerHTML,/Q1 物語の続き/);
const rentNav=navigationHarness({done:1,started:true,rented:false,rescue:false,arrived:[1],puzzleAt:1}),re=rentNav.element;
assert.equal(rentNav.location.hash,'#/station/2/rental');
re('#rent').onclick();assert.equal(rentNav.location.hash,'#/station/2/puzzle');
rentNav.back();assert.match(re('#app').innerHTML,/rental-page/);
assert.equal(re('#rent').textContent,'確認済み・謎へ進む');
assert.equal(JSON.parse(rentNav.storage['chapopo-mvp-4-v2']).rented,true);
rentNav.boot();assert.match(re('#app').innerHTML,/rental-page/);
rentNav.forward();assert.match(re('#app').innerHTML,/answerForm/);
re('#reset').onclick();rentNav.back();assert.match(re('#app').innerHTML,/物語へ進む/);
console.log('PASS 4 flows + page URLs + Back/Forward + historical-page reload + durable completed/rental progress + reset invalidation');
for(const [done,spellings] of [[0,['外出','がいしゅつ','ガイシュツ','ｶﾞｲｼｭﾂ',' がいしゅつ ']], [1,['EST','est','ＥＳＴ','エスト','えすと','ｴｽﾄ']], [2,['監視','かんし','カンシ','ｶﾝｼ']], [3,['ロック','ろっく','ﾛｯｸ','LOCK','施錠','せじょう','セジョウ']]]){
  for(const spelling of spellings){
    const test=harness({done,started:true,arrived:[done],puzzleAt:done,rented:true,rescue:false});
    test.element('#answer').value=spelling;
    test.element('#answerForm').onsubmit({preventDefault(){}});
    assert.match(test.element('#app').innerHTML,/正解！/,`Rejected Q${done+1}: ${spelling}`);
    assert.ok(test.element('#app').innerHTML.includes(done===1?'ルミネエスト':test.c.window.EVENT_CONFIG.stations[done].answer));
  }
}
const oldAnswer=harness({done:0,started:true,arrived:[0],puzzleAt:0});
oldAnswer.element('#answer').value='365';oldAnswer.element('#answerForm').onsubmit({preventDefault(){}});
assert.match(oldAnswer.element('#feedback').textContent,/一致しません/);
const gated=harness({done:1,started:true,arrived:[1],puzzleAt:1,rented:false});
assert.match(gated.element('#app').innerHTML,/rental-page/);
assert.match(gated.element('#app').innerHTML,/CHARGESPOT/);
assert.doesNotMatch(gated.element('#app').innerHTML,/配布|スタッフから追加/);
for(const file of ['app.js','config.js','story-revision-r36.js'])assert.doesNotMatch(fs.readFileSync(base+file,'utf8'),/配布/);
assert.doesNotMatch(gated.element('#app').innerHTML,/answerForm/);
console.log('PASS 24 kana/kanji/Latin variants + canonical result words + obsolete answer rejection + rental-before-EST gate');
