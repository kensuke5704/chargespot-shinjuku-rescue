(() => {
'use strict';
const C = window.EVENT_CONFIG;
const K = 'chapopo-' + C.version;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const norm = value => value.normalize('NFKC').trim().toUpperCase().replace(/[\s　]+/g, ' ');
const fresh = () => ({done:0, rented:false, rescue:false, started:false});
let S, view = 'mission';
try { S = JSON.parse(localStorage.getItem(K)); } catch {}
if (!S || !Number.isInteger(S.done) || S.done < 0 || S.done > C.stations.length) S = fresh();
if (S.done > 0) S.started = true;
function save() {
  try { localStorage.setItem(K, JSON.stringify(S)); }
  catch { $('#storageNote')?.remove(); const p=document.createElement('p'); p.id='storageNote';p.className='rental-note';p.textContent='進捗を保存できません。この画面を閉じずにお進みください。';$('#app').append(p); }
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
function prose(text) {
  return text.split(/(『[^』]*』)/g).filter(Boolean).map(part=>{
    if(!part.startsWith('『'))return '<p>'+esc(part)+'</p>';
    const name=C.dialogueSpeakers[part.slice(1,-1)]||'通信';
    return '<figure class="dialogue '+(name==='ガルル'?'garuru':'chapopo')+'"><figcaption>'+esc(name)+'</figcaption><blockquote>'+esc(part.slice(1,-1))+'</blockquote></figure>';
  }).join('');
}
function readerContent(i,phase) {
  return '<div class="reader-prose" id="readerText">'+C.narrative[i][phase].map(prose).join('')+'</div>';
}
function storyBlock(i, phase='arrival') {
  return '<section class="story-part" id="storyReader" aria-label="'+esc(phase==='after'?'物語の続き':'到着時の物語')+'">'+readerContent(i,phase)+'</section>';
}
function bindReader(i,phase) {
  $('#solve').onclick=()=>{S.puzzleAt=i;save();render(true);};
}
function travel() {
  const n=S.done,st=C.stations[n];
  $('#app').innerHTML=status()+'<section class="travel-screen"><p class="travel-label">次の目的地 / STATION '+(n+1)+'</p><h1>'+facilityTitle(st)+'</h1><p class="travel-place">'+esc(st.place)+'</p><div class="travel-actions">'+link(st.map,'地図を開く ↗','secondary')+'<button id="arrive" class="primary">到着した <span aria-hidden="true">→</span></button></div><p class="travel-note">到着したら、立ち止まって作戦を確認しよう。</p></section>';
  $('#arrive').onclick=()=>{S.arrived||=[];if(!S.arrived.includes(n))S.arrived.push(n);delete S.puzzleAt;save();render(true);};
}
function arrivalStory() {
  const n=S.done;
  $('#app').innerHTML=status()+'<section class="story-screen">'+art(captions[n][0],'',C.sceneArt[n])+'<div class="story-sheet">'+stageHead(n)+'<h1>'+esc(shortName(C.stations[n]))+'</h1>'+storyBlock(n)+'<button id="solve" class="primary">'+(n===2?'レンタル・謎解きへ':'謎を解く')+' <span aria-hidden="true">→</span></button></div></section>';
  bindReader(n,'arrival');
}
const link = (url, label, className='') => '<a class="'+className+'" href="'+esc(url)+'" target="_blank" rel="noopener">'+label+'</a>';
function art(title, description='', asset=C.sceneArt[0]) {
  return '<figure class="scene"><img src="./'+esc(asset.file)+'" style="object-position:'+esc(asset.position)+'" width="1536" height="1024" alt="'+esc(asset.alt)+'"><figcaption><strong>'+esc(title)+'</strong><p>'+esc(description)+'</p></figcaption></figure>';
}
function status() {
  return '<div class="status"><p>CHAPOPO ENERGY<strong>'+S.done*25+'%</strong></p><div class="segments" aria-label="'+S.done+' / 4地点完了">'+C.stations.map((_,i)=>'<i class="'+(i<S.done?'done':'')+'"></i>').join('')+'</div></div>';
}
function stageHead(i) {
  return '<div class="stage-heading"><span class="stage-number">'+String(i+1).padStart(2,'0')+'</span><span>STATION / '+['追跡','阻止','補給','救出'][i]+'</span></div>';
}
function frame(i, content, title, description, asset=C.sceneArt[i]) {
  return status()+'<section class="mission-layout">'+art(title ?? captions[i][0],description ?? captions[i][1],asset)+'<div class="mission-panel">'+content+'</div></section>';
}
function revealPending() {
  return Number.isInteger(S.reveal) && S.reveal===S.done-1 && C.promotions[S.reveal];
}
function intro() {
  $('#app').innerHTML='<section class="intro"><div class="intro-copy"><h1><span>チャポポ</span><span>救出作戦</span></h1><p class="lead">ガルルを追え。 新宿に残された4つの手がかり。</p><button id="start" class="primary">捜査を始める <span aria-hidden="true">→</span></button><div class="intro-meta"><span><strong>4</strong>地点</span><span><strong>30-45</strong>分</span></div></div><figure class="intro-image"><img src="./ink-trace.jpg" width="1536" height="1024" fetchpriority="high" alt="昼の新宿でケーブルを引いて逃げるガルル"></figure></section><p class="intro-note">受付で受け取った捜査ファイルをご用意ください。ST3ではChargeSPOTをレンタルします。</p>';
  $('.intro-note').insertAdjacentHTML('beforebegin','<section class="prologue"><h2>消えた救難信号</h2><div class="reader-prose">'+C.prologue.map(prose).join('')+'</div></section>');
  $('#start').onclick=()=>{S.started=true;save();render(true);};
}
function mission() {
  const n=S.done, st=C.stations[n], rent=n===2;
  const place='<div class="place"><p>'+esc(st.place)+'</p>'+link(st.map,'地図 ↗')+'</div>';
  const rental=rent ? '<section class="rental"><h3>1時間無料券でエネルギーを補給</h3><ol><li>配布券の条件を確認</li><li>公式アプリで券を適用してレンタル</li></ol><button id="rent" class="'+(S.rented||S.rescue?'secondary':'primary')+'">'+(S.rented?'レンタル確認済み':S.rescue?'代替参加を確認済み':'レンタルできた')+'</button><p class="rental-note">無料時間を超えると料金が発生します。料金・返却完了は公式アプリで確認。</p><details><summary>レンタルできないとき</summary><p>現地スタッフの代替参加案内を受けてください。</p><button id="rescue" class="secondary">スタッフ案内で進む</button></details></section>' : '';
  $('#app').innerHTML=frame(n,stageHead(n)+'<h1>'+esc(shortName(st))+'</h1>'+place+rental+'<p class="instruction">現地映像を見て、冊子のST'+(n+1)+'を解こう。</p><form id="answerForm" class="answer-form"><label for="answer">謎の答え</label><div class="input-row"><input id="answer" name="answer" aria-describedby="feedback" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="'+(n===0?'3桁の数字':n===3?'英単語をスペースで区切る':'合言葉を入力')+'" '+(n===0?'inputmode="numeric"':'')+'><button id="check" class="primary" type="submit">送信</button></div><p id="feedback" class="feedback" role="status"></p></form><div class="helpers"><details><summary>ヒントを見る</summary><p>'+esc(st.hint)+'</p></details><details><summary>映像が見られない</summary><p>現地スタッフにST'+(n+1)+'の代替キーをお尋ねください。</p></details><button id="storyBack" class="text-button">物語を読み返す</button></div>');
  $('#storyBack').onclick=()=>{delete S.puzzleAt;save();render(true);};
  $('#answerForm').onsubmit=e=>{
    e.preventDefault();
    if(rent&&!S.rented&&!S.rescue){$('#feedback').textContent='レンタル後に「レンタルできた」を押してください。';return;}
    if(norm($('#answer').value)!==st.answer){$('#feedback').textContent=$('#answer').value.trim()?'まだ一致しません。現地映像と冊子をもう一度。':'答えを入力してください。';$('#answer').setAttribute('aria-invalid','true');return;}
    S.reveal=n;delete S.revealPhase;S.done++;view='mission';save();render(true);
  };
  if(rent){
    $('#rent').onclick=()=>{S.rented=true;save();render();};
    $('#rescue').onclick=()=>{if(confirm('現地スタッフから代替参加の案内を受けましたか？')){S.rescue=true;save();render();}};
  }
}
function promotion() {
  const i=S.reveal, p=C.promotions[i];
  $('#app').innerHTML='<section class="result-page" aria-label="正解とChargeSPOTの紹介"><h1 id="correctTitle" tabindex="-1">正解！</h1><p class="result-answer '+(i===3?'protocol':'')+'">'+esc(C.stations[i].answer)+'</p><section class="result-information"><h2>'+esc(p.title)+'</h2><p>'+esc(p.lead)+'</p><p>'+promotionBodies[i]+'</p></section><button id="resultNext" class="primary">物語の続きへ <span aria-hidden="true">→</span></button></section>';
  $('#resultNext').onclick=()=>{S.revealPhase='story';save();render(true);};
}
function outcomeStory() {
  const i=S.reveal, p=C.promotions[i];
  const asset=i===3?C.endingArt:C.sceneArt[C.outcomeArt[i]];
  const ending=i===3;
  const narrative=ending?'<section class="rescue-message"><h1>チャポポが目を開けた</h1><div class="reader-prose">'+prose('ガルルへ流れていたエネルギーが止まり、光の檻がほどけた。あなたが届けたSAFE ENERGYを受け取り、チャポポがゆっくり立ち上がる。通信機から声が聞こえた。『聞こえる？ ぼくだよ。もう、大丈夫。』『助けてくれて、ありがとう！』')+'</div><details class="ending-detail"><summary>ガルルはどうなった？</summary><div class="reader-prose">'+prose('力が抜けたガルルは、その場にぺたんと座り込んだ。『借りればよかったのか……。』')+'</div></details></section>':'<h1>'+esc(C.outcomeTitles[i])+'</h1>'+storyBlock(i,'after');
  $('#app').innerHTML=status()+'<section class="story-screen outcome '+(ending?'rescue-screen':'')+'">'+art(C.outcomeTitles[i],'',asset)+'<div class="story-sheet">'+narrative+'<button id="continue" class="primary">'+(ending?'救出を完了する':'次のステーションへ')+' <span aria-hidden="true">→</span></button></div></section>';
  $('#continue').onclick=()=>{delete S.reveal;delete S.revealPhase;delete S.puzzleAt;save();render(true);};
}
function goal() {
  $('#app').innerHTML='<section class="completion"><div class="completion-main"><p class="completion-label">4地点のミッション完了</p><h1>チャポポ救出成功！</h1><div class="reader-prose">'+prose('『今度はぼくが、充電に困っている人を助けにいくね。』')+'<p>チャポポは手を振って、街へ駆け出した。 ゴールスタッフに、この画面を見せてください。</p></div><p class="completion-copy">必要なときに、安全を借りよう。</p></div><section class="return-panel"><h2>レンタル中の方へ</h2><p>無料時間内にバッテリーを返却してください。</p><ol><li>返却可能なChargeSPOTステーションへ戻す</li><li>公式アプリで「返却完了」を確認する</li></ol><p>無料時間を超えると料金が発生します。料金・返却状況は公式アプリで確認できます。</p></section></section>';
}
function logs() {
  $('#app').innerHTML='<section class="logs-page"><h1>捜査ログ</h1>'+(S.done ? C.promotions.slice(0,S.done).map((p,i)=>'<article class="log-entry"><span class="log-code">ST'+(i+1)+' / '+esc(C.stations[i].token)+'</span><h2>'+esc(C.missionRecords[i])+'</h2><p>'+promotionBodies[i]+'</p></article>').join('') : '<p class="empty">まだログがありません。 謎を解くと、ここに安全の手がかりが記録されます。</p>')+link('https://chargespot.jp/topics/2444/','ChargeSPOTの安全への取り組み ↗','source')+'</section>';
}
function render(focus=false) {
  document.querySelectorAll('[data-view]').forEach(button=>{if(button.dataset.view===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(view==='logs')logs();else if(revealPending()){if(S.revealPhase==='story')outcomeStory();else promotion();}else if(S.done===4)goal();else if(!S.started)intro();else if(!S.arrived?.includes(S.done))travel();else if(S.puzzleAt!==S.done)arrivalStory();else mission();
  if(focus){const heading=$('#correctTitle')||$('#app');heading.focus({preventScroll:true});$('#app').scrollIntoView({block:'start',behavior:'instant'});}
}
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;render();});
$('#settingsOpen').onclick=()=>$('#settings').showModal();
$('#settingsClose').onclick=()=>$('#settings').close();
$('#reset').onclick=()=>{if(confirm('進捗を消して最初からやり直しますか？')){S=fresh();save();view='mission';$('#settings').close();render();}};
$('#testAnswers').onclick=()=>$('#answers').textContent=C.stations.map((st,i)=>'ST'+(i+1)+': '+st.answer).join(' / ');
render();
})();
