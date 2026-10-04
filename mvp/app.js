(() => {
'use strict';
const C = window.EVENT_CONFIG;
const K = 'chapopo-' + C.version;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// Compare readings without changing the canonical answer shown on the result page.
const norm = value => String(value).normalize('NFKC').toUpperCase().replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0)-0x60)).replace(/[\s　]+/g, '');
const accepts = (station,value) => [station.answer,...(station.acceptedAnswers||[])].some(answer=>norm(answer)===norm(value));
const fresh = () => ({done:0, rented:false, rescue:false, started:false,run:Date.now().toString(36)+Math.random().toString(36).slice(2,8)});
const copy = value => JSON.parse(JSON.stringify(value));
let S, latest, view = 'mission', sceneObserver, pageDepth=0;
try { S = JSON.parse(localStorage.getItem(K)); } catch {}
if (!S || !Number.isInteger(S.done) || S.done < 0 || S.done > C.stations.length) S = fresh();
if (S.done > 0) S.started = true;
if(S.started)S.introduced=true;
if(!S.run)S.run=fresh().run;
latest=copy(S);
function save() {
  // Browser Back changes the displayed page, never erases completed progress.
  const base=S.done<latest.done?latest:S;
  latest=copy({...base,rented:S.rented||latest.rented,rescue:S.rescue||latest.rescue});
  try { localStorage.setItem(K, JSON.stringify(latest)); }
  catch { $('#storageNote')?.remove(); const p=document.createElement('p'); p.id='storageNote';p.className='rental-note';p.textContent='進捗を保存できません。この画面を閉じずにお進みください。';$('#app').append(p); }
}
function pageRoute(){
  if(view==='logs')return '#/logs';
  if(revealPending())return '#/station/'+(S.reveal+1)+'/'+(S.revealPhase==='story'?'after':'correct');
  if(S.done===4)return '#/goal';
  if(!S.introduced)return '#/introduction';
  if(!S.started)return '#/prologue';
  const stem='#/station/'+(S.done+1)+'/';
  if(!S.arrived?.includes(S.done))return stem+'destination';
  if(S.puzzleAt!==S.done)return stem+'story';
  if(S.done===C.rentalStationIndex&&!S.rented&&!S.rescue)return stem+'rental';
  return stem+'puzzle';
}
function restorePage(entry){
  const snapshot=entry?.chapopo;
  if(!snapshot||snapshot.version!==C.version||snapshot.state?.run!==latest.run||!Number.isInteger(snapshot.state.done)||snapshot.state.done<0||snapshot.state.done>4)return false;
  if(snapshot.view==='logs')return false;
  S=copy(snapshot.state);pageDepth=snapshot.depth||0;view='mission';return true;
}
function recordPage(mode){
  if(mode==='none'||!window.history||!window.location)return;
  const route=pageRoute();
  if(mode!=='replace'&&window.location.hash!==route)pageDepth++;
  const entry={chapopo:{version:C.version,state:copy(S),view,depth:pageDepth}};
  if(mode==='replace'||window.location.hash===route)window.history.replaceState(entry,'',route);
  else window.history.pushState(entry,'',route);
}
const shortName = station => station.name.split('｜').slice(1).join('｜') || station.name;
const facilityTitle = station => {
  const parts = station.facility === '東急歌舞伎町タワー2F' ? ['東急','歌舞伎町','タワー 2F']
    : station.facility === 'タイトーステーション新宿東口店4F' ? ['タイトーステーション','新宿東口店 4F']
    : station.facility === 'ルミネエスト新宿店1F' ? ['ルミネエスト','新宿店 1F'] : [station.facility];
  const location=(station.place.startsWith(station.facility)?station.place.slice(station.facility.length):station.place).replace(/^・/,'');
  return parts.map(part=>'<span>'+esc(part)+'</span>').join('')+(location?'<span class="destination-location">'+esc(location)+'</span>':'');
};
const captions = [
  ['ガルルを追え。','チャポポを連れ去ったガルル。街に残された痕跡を追おう。'],
  ['ガルルに追いついた。','異常を見つけて、電力の奪取を止めろ。'],
  ['バッテリーをレンタルしよう','チャポポへ送るSAFE ENERGYを確保しよう。'],
  ['ガルルを止めろ','集めたログをつなぎ、チャポポへエネルギーを届けよう。']
];
const promotionBodies = C.promotions.map(p => esc(p.body));
const promotionTitle = title => esc(title);
function prose(text) {
  return text.split(/(『[^』]*』)/g).filter(Boolean).map(part=>{
    if(!part.startsWith('『'))return '<p>'+esc(part)+'</p>';
    const name=C.comicSpeakers[part.slice(1,-1)]||C.dialogueSpeakers[part.slice(1,-1)]||'通信';
    const words=part.slice(1,-1);
    const voice=['もっと、よこせ！','最後の力も、いただきだ！','ありがとう！'].includes(words)?' voice-strong':['力が、足りない……','まだ、助からない……','ここだよ……'].includes(words)?' voice-quiet':'';
    return '<figure class="dialogue '+(name==='ガルル'?'garuru':'chapopo')+voice+'"><figcaption>'+esc(name)+'</figcaption><blockquote>'+esc(words)+'</blockquote></figure>';
  }).join('');
}
function readerContent(i,phase) {
  return '<div class="reader-prose" id="readerText">'+C.comicNarrative[i][phase].map(prose).join('')+'</div>';
}
function storyBlock(i, phase='arrival') {
  return '<section class="story-part" id="storyReader" aria-label="'+esc(phase==='after'?'物語の続き':'到着時の物語')+'">'+readerContent(i,phase)+'</section>';
}
function bindReader(i,phase) {
  $('#solve').onclick=()=>{S.puzzleAt=i;save();render(true);};
}
function travel() {
  const n=S.done,st=C.stations[n];
  $('#app').innerHTML=status()+'<section class="travel-screen"><div class="destination-panorama" aria-hidden="true"></div><div class="destination-copy"><p class="travel-label">次の目的地</p><h1>'+facilityTitle(st)+'</h1></div><div class="travel-actions"><button id="arrive" class="primary">到着した <span aria-hidden="true">→</span></button></div></section>';
  $('#arrive').onclick=()=>{S.arrived||=[];if(!S.arrived.includes(n))S.arrived.push(n);delete S.puzzleAt;save();render(true);};
}
function arrivalStory() {
  const n=S.done;
  $('#app').innerHTML=storyPage(n,'arrival','solve',n===C.rentalStationIndex&&!S.rented&&!S.rescue?'レンタルへ':'謎を解く');
  bindReader(n,'arrival');
}
function comicTitle() {
  return '<img class="comic-title" src="./comic-title-daisakusen-r68.png" width="1774" height="887" alt="チャポポ救出大作戦">';
}
function storyFigure(i,phase,detail=false) {
  const asset=(detail?C.storyInserts:C.storyArt)[i][phase];
  return '<figure class="inserted-scene"><img src="./'+esc(asset.file)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'" decoding="async"></figure>';
}
function standaloneFigure(asset){
  return '<figure class="inserted-scene"><img src="./'+esc(asset.file)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'" decoding="async"></figure>';
}
function illustratedProse(paragraphs,i,phase){
  const cut=C.storyInserts[i][phase].after;
  return paragraphs.map((text,index)=>prose(text)+(index===2?storyFigure(i,phase):'')+(index===cut-1?storyFigure(i,phase,true):'')).join('');
}
function prologueContent(){
  const illustration=index=>'<figure class="inserted-scene"><img src="./'+esc(C.introArt[index].file)+'" width="1536" height="1024" alt="'+esc(C.introArt[index].alt)+'" decoding="async"></figure>';
  return C.introText.map((text,index)=>prose(text)+(index===2?illustration(0):'')+(index===4?illustration(1):'')).join('');
}
function storyPage(i,phase,id,label) {
  const paragraphs=C.storyText[i][phase];
  return '<article class="reading-page story-screen story-st'+(i+1)+' story-'+phase+'">'+status()+'<h1 class="sr-only">Q'+(i+1)+' '+(phase==='after'?'物語の続き':'到着時の物語')+'</h1><section id="storyReader" class="reading-body reader-prose" aria-label="'+esc(phase==='after'?'物語の続き':'到着時の物語')+'">'+illustratedProse(paragraphs,i,phase)+'</section><button id="'+id+'" class="primary reading-action">'+esc(label)+'</button></article>';
}
const link = (url, label, className='') => '<a class="'+className+'" href="'+esc(url)+'" target="_blank" rel="noopener">'+label+'</a>';
function art(title, description='', asset=C.sceneArt[0]) {
  return '<figure class="scene"><img src="./'+esc(asset.file)+'" style="object-position:'+esc(asset.position)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'"><figcaption><strong>'+esc(title)+'</strong><p>'+esc(description)+'</p></figcaption></figure>';
}
function status() {
  return '<div class="status"><p aria-label="'+S.done+' / 4地点完了"><strong>'+S.done+'</strong><span> / 4</span></p><div class="segments" aria-hidden="true">'+C.stations.map((_,i)=>'<i class="'+(i<S.done?'done':'')+'"></i>').join('')+'</div><span class="sr-only">チャポポのエネルギー '+S.done*25+'%</span></div>';
}
function frame(i, content, title, description, asset=C.sceneArt[i]) {
  return status()+'<section class="puzzle-page"><div class="mission-panel">'+content+'</div></section>';
}
function revealPending() {
  return Number.isInteger(S.reveal) && S.reveal===S.done-1 && C.promotions[S.reveal];
}
function introduction(){
  $('#app').innerHTML='<article class="event-introduction reading-page"><h1 class="sr-only">チャポポ救出大作戦</h1>'+comicTitle()+'<button id="introductionNext" class="primary reading-action">物語へ進む</button></article>';
  $('#introductionNext').onclick=()=>{S.introduced=true;save();render(true);};
}
function intro() {
  $('#app').innerHTML='<article class="reading-page reading-intro"><h1 class="sr-only">チャポポ救出大作戦</h1><section class="reading-body reader-prose" aria-label="プロローグ">'+prologueContent()+'</section><button id="start" class="primary reading-action">捜査を始める</button></article>';
  $('#start').onclick=()=>{S.started=true;save();render(true);};
}
function rentalPage() {
  $('#app').innerHTML=status()+'<section class="rental-page"><div class="rental-visual"><header><h1>バッテリーをレンタル</h1><p class="rental-offer">1時間無料コードを使おう</p></header>'+standaloneFigure(C.rentalArt)+'</div><section class="rental"><h2 class="sr-only">レンタルの手順</h2><ol class="rental-steps"><li><strong>無料券コード</strong><span class="coupon-code">CHARGESPOT</span></li><li><strong>アプリで借りる</strong><span>CHARGESPOT公式アプリにコードを入力して、レンタルする</span></li><li><strong>受け取りを確認</strong><span>バッテリーを受け取り、アプリでレンタル開始を確認する</span></li></ol><div class="rental-confirm"><button id="rent" class="primary">レンタルできた <span aria-hidden="true">→</span></button><p class="rental-note">無料時間を超えると料金が発生します。料金・返却完了は公式アプリで確認してください。</p></div><details><summary>レンタルできないとき</summary><p>在庫・無料券については現地スタッフへ。代替参加はスタッフの案内後にお進みください。</p><button id="rescue" class="secondary">スタッフ案内で進む</button></details></section></section>';
  if(latest.rented||latest.rescue)$('#rent').textContent='確認済み・謎へ進む';
  $('#rent').onclick=()=>{S.rented=latest.rented||!latest.rescue;S.rescue=latest.rescue;save();render(true);};
  $('#rescue').onclick=()=>{if(confirm('現地スタッフから代替参加の案内を受けましたか？')){S.rescue=true;save();render(true);}};
}
function mission() {
  const n=S.done, st=C.stations[n], rent=n===C.rentalStationIndex;
  const instruction=rent?'CHARGESPOTアプリの画面を見て、冊子のQ2を解こう。':'現地CHARGESPOTステーションのモニターを見て、冊子のQ'+(n+1)+'を解こう。';
  const fallback=rent?'レンタル状況を確認できない場合は、現地スタッフへお尋ねください。':'現地スタッフにQ'+(n+1)+'の代替キーをお尋ねください。';
  $('#app').innerHTML=frame(n,'<h1 class="sr-only">謎の答えを入力</h1><p class="instruction">'+esc(instruction)+'</p><form id="answerForm" class="answer-form"><label for="answer">謎の答え</label><div class="input-row"><input id="answer" name="answer" aria-describedby="feedback" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="'+'答えを入力'+'" '+''+'><button id="check" class="primary" type="submit">送信</button></div><p id="feedback" class="feedback" role="status"></p></form><div class="helpers"><details><summary>ヒントを見る</summary><p>'+esc(st.hint)+'</p></details><details><summary>'+(rent?'アプリ画面が見られない':'モニターが見られない')+'</summary><p>'+esc(fallback)+'</p></details><button id="storyBack" class="text-button">物語を読み返す</button></div>');
  $('#storyBack').onclick=()=>{delete S.puzzleAt;save();render(true);};
  $('#answerForm').onsubmit=e=>{
    e.preventDefault();
    if(rent&&!S.rented&&!S.rescue){$('#feedback').textContent='レンタル後に「レンタルできた」を押してください。';return;}
    if(!accepts(st,$('#answer').value)){$('#feedback').textContent=$('#answer').value.trim()?(rent?'まだ一致しません。アプリ画面と冊子をもう一度。':'まだ一致しません。現地CHARGESPOTステーションのモニターと冊子をもう一度。'):'答えを入力してください。';$('#answer').setAttribute('aria-invalid','true');return;}
    S.reveal=n;delete S.revealPhase;S.done++;view='mission';save();render(true);
  };
}
function promotion() {
  const i=S.reveal, p=C.promotions[i];
  const asset=C.promotionArt[i];
  if(i===1){
    $('#app').innerHTML='<section class="result-page result-1"><header class="result-heading"><h1 id="correctTitle" tabindex="-1">正解！</h1><p class="result-answer">'+esc(C.stations[i].answer)+'</p></header><section id="storyReader" class="reading-body reader-prose" aria-label="物語の続き">'+illustratedProse(C.storyText[i].after,i,'after')+'</section><button id="resultNext" class="primary">次のステーションへ <span aria-hidden="true">→</span></button></section>';
    $('#resultNext').onclick=()=>{delete S.reveal;delete S.revealPhase;delete S.puzzleAt;save();render(true);};
    return;
  }
$('#app').innerHTML='<section class="result-page result-'+i+'" aria-label="正解とCHARGESPOTの紹介"><header class="result-heading"><h1 id="correctTitle" tabindex="-1">正解！</h1><p class="result-answer ">'+esc(C.stations[i].answer)+'</p></header><div class="promotion-spread"><figure class="promotion-illustration"><img src="./'+esc(asset.file)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'" decoding="async"></figure><section class="result-information"><h2>'+promotionTitle(p.title)+'</h2><p>'+promotionBodies[i]+'</p><p class="promotion-source"><a href="'+esc(p.sourceUrl||'https://chargespot.jp/topics/2444/')+'" target="_blank" rel="noopener">出典：'+esc(p.sourceLabel||'CHARGESPOT公式発表（2026年8月4日）')+'</a></p></section></div><button id="resultNext" class="primary">物語の続きへ <span aria-hidden="true">→</span></button></section>';
  $('#resultNext').onclick=()=>{S.revealPhase='story';save();render(true);};
}
function outcomeStory() {
  const i=S.reveal;
  $('#app').innerHTML=storyPage(i,'after','continue',i===3?'救出を完了する':i===2?'タワーへ向かう':'次のステーションへ');
  $('#continue').onclick=()=>{delete S.reveal;delete S.revealPhase;delete S.puzzleAt;save();render(true);};
}
function goal() {
  $('#app').innerHTML='<section class="completion"><div class="completion-main"><h1>チャポポ救出成功！</h1><figure class="completion-art inserted-scene"><img src="./goal-celebration-r30.png" width="1536" height="1024" alt="開いた光の檻から光が立ちのぼり、ガルルがほっとした表情で座っている" decoding="async"></figure><div class="reading-body reader-prose">'+prose('『今度はぼくが、充電に困っている人を助けにいくね。』')+'<p>チャポポは手を振って、街へ駆け出した。</p></div><p class="completion-copy">必要なときに、安全を借りよう。</p></div><section class="return-panel"><h2>レンタル中の方へ</h2><p>バッテリーを返却できます。</p><ol><li>返却可能なCHARGESPOTステーションへ戻す</li><li>公式アプリで「返却完了」を確認する</li></ol><p>無料時間を超えると料金が発生します。料金・返却状況は公式アプリで確認できます。</p></section></section>';
}
function logs() {
  $('#app').innerHTML='<section class="logs-page"><h1>捜査ログ</h1>'+(S.done ? C.promotions.slice(0,S.done).map((p,i)=>'<article class="log-entry"><span class="log-code">Q'+(i+1)+' / '+esc(C.stations[i].token)+'</span><h2>'+esc(C.missionRecords[i])+'</h2><p>'+promotionBodies[i]+'</p></article>').join('') : '<p class="empty">まだログがありません。 謎を解くと、ここに安全の手がかりが記録されます。</p>')+link('https://chargespot.jp/topics/2444/','CHARGESPOTの安全への取り組み ↗','source')+'</section>';
}
function render(focus=false,historyMode='push') {
  document.querySelectorAll('[data-view]').forEach(button=>{if(button.dataset.view===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(view==='logs')logs();else if(revealPending()){if(S.revealPhase==='story')outcomeStory();else promotion();}else if(S.done===4)goal();else if(!S.introduced)introduction();else if(!S.started)intro();else if(!S.arrived?.includes(S.done))travel();else if(S.puzzleAt!==S.done)arrivalStory();else if(S.done===C.rentalStationIndex&&!S.rented&&!S.rescue)rentalPage();else mission();
  document.body.classList.toggle('reading-mode',!!$('.reading-page'));
  document.body.classList.toggle('title-mode',pageRoute()==='#/introduction');
  $('#pageBack').disabled=pageRoute()==='#/introduction';
  sceneObserver?.disconnect();
  if(typeof window.matchMedia==='function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    sceneObserver=new window.IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');sceneObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'100px 0px'});
    document.querySelectorAll('.inserted-scene').forEach(scene=>{scene.classList.add('motion-ready');sceneObserver.observe(scene);});
  }
  if(focus){const heading=$('#correctTitle')||$('#app');heading.focus({preventScroll:true});}
  recordPage(historyMode);
  window.scrollTo?.({top:0,left:0,behavior:'instant'});
}
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;render();});
$('#settingsOpen').onclick=()=>$('#settings').showModal();
$('#pageBack').onclick=()=>{
  if(pageDepth>0&&typeof window.history?.back==='function'){window.history.back();return;}
  if(revealPending()){
    if(S.revealPhase==='story')delete S.revealPhase;
    else {S.done--;delete S.reveal;delete S.revealPhase;S.puzzleAt=S.done;}
  }else if(S.done===4){S.reveal=3;S.revealPhase='story';}
  else if(S.puzzleAt===S.done)delete S.puzzleAt;
  else if(S.arrived?.includes(S.done))S.arrived=S.arrived.filter(n=>n!==S.done);
  else if(S.done>0){S.reveal=S.done-1;S.revealPhase='story';}
  else if(S.started)S.started=false;
  else S.introduced=false;
  save();render(true,'replace');
};
$('#settingsClose').onclick=()=>$('#settings').close();
$('#reset').onclick=()=>{if(confirm('進捗を消して最初からやり直しますか？')){S=fresh();latest=copy(S);save();view='mission';$('#settings').close();render(true);}};
$('#testAnswers').onclick=()=>$('#answers').textContent=C.stations.map((st,i)=>'Q'+(i+1)+': '+st.answer).join(' / ');
if(window.history)window.history.scrollRestoration='manual';
if(typeof window.addEventListener==='function')window.addEventListener('popstate',event=>{
  if(restorePage(event.state))render(false,'none');
  else {S=copy(latest);view='mission';render(false,'replace');}
});
restorePage(window.history?.state);
save();
render(false,'replace');
})();
