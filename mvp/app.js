(() => {
'use strict';
const C = window.EVENT_CONFIG;
const K = 'chapopo-' + C.version;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const norm = value => value.normalize('NFKC').trim().toUpperCase().replace(/[\s　]+/g, ' ');
const fresh = () => ({done:0, rented:false, rescue:false, started:false,run:Date.now().toString(36)+Math.random().toString(36).slice(2,8)});
const copy = value => JSON.parse(JSON.stringify(value));
let S, latest, view = 'mission', sceneObserver;
try { S = JSON.parse(localStorage.getItem(K)); } catch {}
if (!S || !Number.isInteger(S.done) || S.done < 0 || S.done > C.stations.length) S = fresh();
if (S.done > 0) S.started = true;
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
  if(!S.started)return '#/prologue';
  const stem='#/station/'+(S.done+1)+'/';
  if(!S.arrived?.includes(S.done))return stem+'destination';
  if(S.puzzleAt!==S.done)return stem+'story';
  if(S.done===2&&!S.rented&&!S.rescue)return stem+'rental';
  return stem+'puzzle';
}
function restorePage(entry){
  const snapshot=entry?.chapopo;
  if(!snapshot||snapshot.version!==C.version||snapshot.state?.run!==latest.run||!Number.isInteger(snapshot.state.done)||snapshot.state.done<0||snapshot.state.done>4)return false;
  S=copy(snapshot.state);view=snapshot.view==='logs'?'logs':'mission';return true;
}
function recordPage(mode){
  if(mode==='none'||!window.history||!window.location)return;
  const route=pageRoute(),entry={chapopo:{version:C.version,state:copy(S),view}};
  if(mode==='replace'||window.location.hash===route)window.history.replaceState(entry,'',route);
  else window.history.pushState(entry,'',route);
}
const shortName = station => station.name.split('｜').slice(1).join('｜') || station.name;
const facilityTitle = station => {
  const parts = station.facility === '東急歌舞伎町タワー' ? ['東急','歌舞伎町','タワー']
    : station.facility === 'タイトーステーション新宿東口店' ? ['タイトーステーション','新宿東口店']
    : station.facility === 'ビックカメラ新宿東口店' ? ['ビックカメラ','新宿東口店'] : [station.facility];
  return parts.map(part=>'<span>'+esc(part)+'</span>').join('');
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
  $('#app').innerHTML=status()+'<section class="travel-screen"><div class="destination-panorama" aria-hidden="true"></div><div class="destination-copy"><p class="travel-label">次の目的地 / STATION '+(n+1)+'</p><h1>'+facilityTitle(st)+'</h1><p class="travel-place">'+esc(st.place)+'</p></div><div class="travel-actions">'+link(st.map,'地図を開く ↗','secondary')+'<button id="arrive" class="primary">到着した <span aria-hidden="true">→</span></button></div><p class="travel-note">到着したら、立ち止まって作戦を確認しよう。</p></section>';
  $('#arrive').onclick=()=>{S.arrived||=[];if(!S.arrived.includes(n))S.arrived.push(n);delete S.puzzleAt;save();render(true);};
}
function arrivalStory() {
  const n=S.done;
  $('#app').innerHTML=storyPage(n,'arrival','solve',n===2&&!S.rented&&!S.rescue?'レンタルへ':'謎を解く');
  bindReader(n,'arrival');
}
function comicTitle() {
  return '<img class="comic-title" src="./comic-title-r13.jpg" width="1774" height="887" alt="チャポポ救出作戦">';
}
function storyFigure(i,phase,detail=false) {
  const asset=(detail?C.storyInserts:C.storyArt)[i][phase];
  return '<figure class="inserted-scene"><img src="./'+esc(asset.file)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'" decoding="async"></figure>';
}
function illustratedProse(paragraphs,i,phase){
  const cut=C.storyInserts[i][phase].after;
  return paragraphs.map((text,index)=>prose(text)+(index===2?storyFigure(i,phase):'')+(index===cut-1?storyFigure(i,phase,true):'')).join('');
}
function storyPage(i,phase,id,label) {
  const paragraphs=C.storyText[i][phase];
  const chapter=i<2?0:i===2?1:2;
  return '<article class="reading-page story-screen story-st'+(i+1)+' story-'+phase+'">'+status()+'<header class="reading-head"><p class="chapter-mark chapter-'+chapter+'"><span class="sr-only">'+['追跡','反撃準備','救出'][chapter]+'</span></p><h1 class="sr-only">ST'+(i+1)+' '+(phase==='after'?'物語の続き':'到着時の物語')+'</h1></header><section id="storyReader" class="reading-body reader-prose" aria-label="'+esc(phase==='after'?'物語の続き':'到着時の物語')+'">'+illustratedProse(paragraphs,i,phase)+'</section><button id="'+id+'" class="primary reading-action">'+esc(label)+'</button></article>';
}
const link = (url, label, className='') => '<a class="'+className+'" href="'+esc(url)+'" target="_blank" rel="noopener">'+label+'</a>';
function art(title, description='', asset=C.sceneArt[0]) {
  return '<figure class="scene"><img src="./'+esc(asset.file)+'" style="object-position:'+esc(asset.position)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'"><figcaption><strong>'+esc(title)+'</strong><p>'+esc(description)+'</p></figcaption></figure>';
}
function status() {
  return '<div class="status"><p aria-label="'+S.done+' / 4地点完了"><strong>'+S.done+'</strong><span> / 4</span></p><div class="segments" aria-hidden="true">'+C.stations.map((_,i)=>'<i class="'+(i<S.done?'done':'')+'"></i>').join('')+'</div><span class="sr-only">チャポポのエネルギー '+S.done*25+'%</span></div>';
}
function stageHead(i) {
  return '<div class="stage-heading"><span class="stage-number">ST'+(i+1)+'</span><span>'+['追跡','阻止','補給','救出'][i]+'</span></div>';
}
function frame(i, content, title, description, asset=C.sceneArt[i]) {
  return status()+'<section class="puzzle-page"><div class="puzzle-title">'+comicTitle()+'</div><div class="mission-panel">'+content+'</div></section>';
}
function revealPending() {
  return Number.isInteger(S.reveal) && S.reveal===S.done-1 && C.promotions[S.reveal];
}
function intro() {
  $('#app').innerHTML='<article class="reading-page reading-intro"><h1 class="sr-only">チャポポ救出作戦</h1><div class="reading-logo">'+comicTitle()+'</div><section class="reading-body reader-prose" aria-label="プロローグ">'+illustratedProse(C.introText,0,'arrival')+'</section><button id="start" class="primary reading-action">捜査を始める</button><div class="intro-meta"><span><strong>4</strong>地点</span><span><strong>30-45</strong>分</span></div><p class="intro-note">捜査ファイルをご用意ください。ST3ではChargeSPOTをレンタルします。</p></article>';
  $('#start').onclick=()=>{S.started=true;save();render(true);};
}
function rentalPage() {
  const st=C.stations[2];
  $('#app').innerHTML=status()+'<section class="rental-page"><div class="rental-visual"><header>'+stageHead(2)+'<h1>バッテリーをレンタル</h1><p class="rental-offer">配布された1時間無料券を使おう</p></header>'+storyFigure(2,'after')+'</div><section class="rental"><h2 class="sr-only">レンタルの手順</h2><ol class="rental-steps"><li><strong>無料券を確認</strong><span>配布券の利用条件を確認する</span></li><li><strong>アプリで借りる</strong><span>ChargeSPOT公式アプリで券を適用し、レンタルする</span></li><li><strong>受け取りを確認</strong><span>バッテリーを受け取り、アプリでレンタル開始を確認する</span></li></ol><div class="rental-confirm"><p>受け取れたら、下のボタンを押してください。</p><button id="rent" class="primary">レンタルできた <span aria-hidden="true">→</span></button><p class="rental-note">無料時間を超えると料金が発生します。料金・返却完了は公式アプリで確認してください。</p></div><details><summary>レンタルできないとき</summary><p>在庫や無料券について、現地スタッフにお尋ねください。代替参加の案内を受けた方は、下のボタンで進めます。</p><button id="rescue" class="secondary">スタッフ案内で進む</button></details></section><div class="place"><p>'+esc(st.place)+'</p>'+link(st.map,'地図 ↗')+'</div></section>';
  if(latest.rented||latest.rescue)$('#rent').textContent='確認済み・謎へ進む';
  $('#rent').onclick=()=>{S.rented=latest.rented||!latest.rescue;S.rescue=latest.rescue;save();render(true);};
  $('#rescue').onclick=()=>{if(confirm('現地スタッフから代替参加の案内を受けましたか？')){S.rescue=true;save();render(true);}};
}
function mission() {
  const n=S.done, st=C.stations[n], rent=n===2;
  const place='<div class="place"><p>'+esc(st.place)+'</p>'+link(st.map,'地図 ↗')+'</div>';
  const rental=rent?'<p class="rental-confirmed">'+(S.rented?'レンタル確認済み':'スタッフ案内で代替参加')+'</p>':'';
  $('#app').innerHTML=frame(n,stageHead(n)+'<h1>'+esc(shortName(st))+'</h1>'+place+rental+'<p class="instruction">現地映像を見て、冊子のST'+(n+1)+'を解こう。</p><form id="answerForm" class="answer-form"><label for="answer">謎の答え</label><div class="input-row"><input id="answer" name="answer" aria-describedby="feedback" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="'+(n===0?'3桁の数字':n===3?'英単語をスペースで区切る':'合言葉を入力')+'" '+(n===0?'inputmode="numeric"':'')+'><button id="check" class="primary" type="submit">送信</button></div><p id="feedback" class="feedback" role="status"></p></form><div class="helpers"><details><summary>ヒントを見る</summary><p>'+esc(st.hint)+'</p></details><details><summary>映像が見られない</summary><p>現地スタッフにST'+(n+1)+'の代替キーをお尋ねください。</p></details><button id="storyBack" class="text-button">物語を読み返す</button></div>');
  $('#storyBack').onclick=()=>{delete S.puzzleAt;save();render(true);};
  $('#answerForm').onsubmit=e=>{
    e.preventDefault();
    if(rent&&!S.rented&&!S.rescue){$('#feedback').textContent='レンタル後に「レンタルできた」を押してください。';return;}
    if(norm($('#answer').value)!==st.answer){$('#feedback').textContent=$('#answer').value.trim()?'まだ一致しません。現地映像と冊子をもう一度。':'答えを入力してください。';$('#answer').setAttribute('aria-invalid','true');return;}
    S.reveal=n;delete S.revealPhase;S.done++;view='mission';save();render(true);
  };
}
function promotion() {
  const i=S.reveal, p=C.promotions[i];
  const asset=C.promotionArt[i];
  $('#app').innerHTML='<section class="result-page result-'+i+'" aria-label="正解とChargeSPOTの紹介"><header class="result-heading"><h1 id="correctTitle" tabindex="-1">正解！</h1><p class="result-answer '+(i===3?'protocol':'')+'">'+esc(C.stations[i].answer)+'</p></header><div class="promotion-spread"><figure class="promotion-illustration"><img src="./'+esc(asset.file)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'" decoding="async"></figure><section class="result-information"><h2>'+promotionTitle(p.title)+'</h2><p>'+promotionBodies[i]+'</p></section></div><button id="resultNext" class="primary">物語の続きへ <span aria-hidden="true">→</span></button></section>';
  $('#resultNext').onclick=()=>{S.revealPhase='story';save();render(true);};
}
function outcomeStory() {
  const i=S.reveal;
  $('#app').innerHTML=storyPage(i,'after','continue',i===3?'救出を完了する':i===2?'タワーへ向かう':'次のステーションへ');
  $('#continue').onclick=()=>{delete S.reveal;delete S.revealPhase;delete S.puzzleAt;save();render(true);};
}
function goal() {
  $('#app').innerHTML='<section class="completion"><div class="completion-main"><p class="completion-label">4地点のミッション完了</p><h1>チャポポ救出成功！</h1><div class="reader-prose">'+prose('『今度はぼくが、充電に困っている人を助けにいくね。』')+'<p>チャポポは手を振って、街へ駆け出した。 ゴールスタッフに、この画面を見せてください。</p></div><p class="completion-copy">必要なときに、安全を借りよう。</p></div><section class="return-panel"><h2>レンタル中の方へ</h2><p>無料時間内にバッテリーを返却してください。</p><ol><li>返却可能なChargeSPOTステーションへ戻す</li><li>公式アプリで「返却完了」を確認する</li></ol><p>無料時間を超えると料金が発生します。料金・返却状況は公式アプリで確認できます。</p></section></section>';
}
function logs() {
  $('#app').innerHTML='<section class="logs-page"><h1>捜査ログ</h1>'+(S.done ? C.promotions.slice(0,S.done).map((p,i)=>'<article class="log-entry"><span class="log-code">ST'+(i+1)+' / '+esc(C.stations[i].token)+'</span><h2>'+esc(C.missionRecords[i])+'</h2><p>'+promotionBodies[i]+'</p></article>').join('') : '<p class="empty">まだログがありません。 謎を解くと、ここに安全の手がかりが記録されます。</p>')+link('https://chargespot.jp/topics/2444/','ChargeSPOTの安全への取り組み ↗','source')+'</section>';
}
function render(focus=false,historyMode='push') {
  document.querySelectorAll('[data-view]').forEach(button=>{if(button.dataset.view===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(view==='logs')logs();else if(revealPending()){if(S.revealPhase==='story')outcomeStory();else promotion();}else if(S.done===4)goal();else if(!S.started)intro();else if(!S.arrived?.includes(S.done))travel();else if(S.puzzleAt!==S.done)arrivalStory();else if(S.done===2&&!S.rented&&!S.rescue)rentalPage();else mission();
  document.body.classList.toggle('reading-mode',!!$('.reading-page'));
  sceneObserver?.disconnect();
  if(typeof window.matchMedia==='function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    sceneObserver=new window.IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');sceneObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'100px 0px'});
    document.querySelectorAll('.inserted-scene').forEach(scene=>{scene.classList.add('motion-ready');sceneObserver.observe(scene);});
  }
  if(focus){const heading=$('#correctTitle')||$('#app');heading.focus({preventScroll:true});$('#app').scrollIntoView({block:'start',behavior:'instant'});}
  recordPage(historyMode);
}
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;render();});
$('#settingsOpen').onclick=()=>$('#settings').showModal();
$('#settingsClose').onclick=()=>$('#settings').close();
$('#reset').onclick=()=>{if(confirm('進捗を消して最初からやり直しますか？')){S=fresh();latest=copy(S);save();view='mission';$('#settings').close();render(true);}};
$('#testAnswers').onclick=()=>$('#answers').textContent=C.stations.map((st,i)=>'ST'+(i+1)+': '+st.answer).join(' / ');
if(typeof window.addEventListener==='function')window.addEventListener('popstate',event=>{
  if(restorePage(event.state))render(false,'none');
  else {S=copy(latest);view='mission';render(false,'replace');}
});
restorePage(window.history?.state);
save();
render(false,'replace');
})();
