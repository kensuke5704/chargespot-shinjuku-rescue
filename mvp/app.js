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
const locations = C.stations.map(st => st.facility || st.place);
const captions = [
  ['ガルルを追え。','チャポポを連れ去ったガルル。街に残された痕跡を追おう。'],
  ['ガルルに追いついた。','異常を見つけて、電力の奪取を止めろ。'],
  ['救出の力を、借りる。','チャポポを救うため、SAFE ENERGYを確保しよう。'],
  ['救出作戦、最終局面。','集めたログをつなぎ、チャポポへエネルギーを届けよう。']
];
const promotionBodies = C.promotions.map(p => esc(p.body));
const link = (url, label, className='') => '<a class="'+className+'" href="'+esc(url)+'" target="_blank" rel="noopener">'+label+'</a>';
function art(title, description='') {
  return '<figure class="scene"><img src="./shinjuku-night.jpg" width="1536" height="1024" alt="新宿の夜景を見下ろすガルルと、街に続くエネルギーの軌跡"><figcaption><strong>'+esc(title)+'</strong><p>'+esc(description)+'</p></figcaption></figure>';
}
function status() {
  return '<div class="status"><p>CHAPOPO ENERGY<strong>'+S.done*25+'%</strong></p><div class="segments" aria-label="'+S.done+' / 4地点完了">'+C.stations.map((_,i)=>'<i class="'+(i<S.done?'done':'')+'"></i>').join('')+'</div></div>';
}
function stageHead(i) {
  return '<div class="stage-heading"><span class="stage-number">'+String(i+1).padStart(2,'0')+'</span><span>STATION / '+['追跡','阻止','補給','救出'][i]+'</span></div>';
}
function frame(i, content, title, description) {
  return status()+'<section class="mission-layout">'+art(title ?? captions[i][0],description ?? captions[i][1])+'<div class="mission-panel">'+content+'</div></section>';
}
function revealPending() {
  return Number.isInteger(S.reveal) && S.reveal===S.done-1 && C.promotions[S.reveal];
}
function intro() {
  $('#app').innerHTML='<section class="intro"><div class="intro-copy"><h1><span>チャポポ</span><span>救出作戦</span></h1><p class="lead">ガルルを追え。<br>新宿に残された4つの手がかり。</p><button id="start" class="primary">捜査を始める <span aria-hidden="true">→</span></button><div class="intro-meta"><span><strong>4</strong>地点</span><span><strong>30-45</strong>分</span></div></div><figure class="intro-image"><img src="./shinjuku-night.jpg" width="1536" height="1024" fetchpriority="high" alt="新宿の夜、屋上でエネルギーを奪ったガルル"></figure></section><p class="intro-note">受付で受け取った捜査ファイルをご用意ください。ST3ではChargeSPOTをレンタルします。</p>';
  $('#start').onclick=()=>{S.started=true;save();render();};
}
function mission() {
  const n=S.done, st=C.stations[n], rent=n===2;
  const place='<div class="place"><p>'+esc(st.place)+'</p>'+link(st.map,'地図 ↗')+'</div>';
  const rental=rent ? '<section class="rental"><h3>1時間無料券でエネルギーを補給</h3><ol><li>配布券の条件を確認</li><li>公式アプリで券を適用してレンタル</li></ol><button id="rent" class="'+(S.rented||S.rescue?'secondary':'primary')+'">'+(S.rented?'レンタル確認済み':S.rescue?'代替参加を確認済み':'レンタルできた')+'</button><p class="rental-note">無料時間を超えると料金が発生します。料金・返却完了は公式アプリで確認。</p><details><summary>レンタルできないとき</summary><p>現地スタッフの代替参加案内を受けてください。</p><button id="rescue" class="secondary">スタッフ案内で進む</button></details></section>' : '';
  $('#app').innerHTML=frame(n,stageHead(n)+'<h1>'+esc(shortName(st))+'</h1>'+place+rental+'<p class="instruction">現地映像を見て、冊子のST'+(n+1)+'を解こう。</p><form id="answerForm" class="answer-form"><label for="answer">謎の答え</label><div class="input-row"><input id="answer" name="answer" aria-describedby="feedback" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="'+(n===0?'3桁の数字':n===3?'英単語をスペースで区切る':'合言葉を入力')+'" '+(n===0?'inputmode="numeric"':'')+'><button id="check" class="primary" type="submit">送信</button></div><p id="feedback" class="feedback" role="status"></p></form><div class="helpers"><details><summary>ヒントを見る</summary><p>'+esc(st.hint)+'</p></details><details><summary>映像が見られない</summary><p>現地スタッフにST'+(n+1)+'の代替キーをお尋ねください。</p></details></div>'+(n===0?'<div class="choice"><label for="pre">ChargeSPOTを使ったことは？</label><select id="pre"><option>未経験</option><option>経験あり</option></select></div>':''));
  if(n===0 && S.pre) $('#pre').value=S.pre;
  $('#answerForm').onsubmit=e=>{
    e.preventDefault();
    if(rent&&!S.rented&&!S.rescue){$('#feedback').textContent='レンタル後に「レンタルできた」を押してください。';return;}
    if(norm($('#answer').value)!==st.answer){$('#feedback').textContent=$('#answer').value.trim()?'まだ一致しません。現地映像と冊子をもう一度。':'答えを入力してください。';$('#answer').setAttribute('aria-invalid','true');return;}
    if(n===0) S.pre=$('#pre').value;
    S.reveal=n;S.done++;save();render(true);
  };
  if(rent){
    $('#rent').onclick=()=>{S.rented=true;save();render();};
    $('#rescue').onclick=()=>{if(confirm('現地スタッフから代替参加の案内を受けましたか？')){S.rescue=true;save();render();}};
  }
}
function promotion() {
  const i=S.reveal, p=C.promotions[i];
  $('#app').innerHTML=frame(i,'<section class="promotion">'+stageHead(i)+'<h1 id="correctTitle" tabindex="-1">正解！</h1><p class="clear-answer">'+esc(C.stations[i].answer)+'</p><h3>'+esc(p.title)+'</h3><p class="promotion-body">'+promotionBodies[i]+'</p><p class="story-next">'+esc(p.story)+'</p><button id="continue" class="primary">'+(i===3?'ゴールへ進む':'次のステーションへ')+' <span aria-hidden="true">→</span></button></section>',i===3?'チャポポに、届いた。':'手がかりを、つかんだ。',p.story);
  $('#continue').onclick=()=>{delete S.reveal;save();render(true);};
}
function goal() {
  $('#app').innerHTML=frame(3,'<section class="goal"><div class="clear-symbol" aria-hidden="true">✓</div><h1>チャポポ救出成功！</h1><p class="promotion-body">街の灯りが戻った。<br>あなたが集めたSAFE ENERGYで、チャポポが復活した。</p><h2>必要なときに、<br>安全を借りよう。</h2><p class="rental-note">レンタル中の方は、無料時間内の返却とアプリの返却完了表示を確認してください。</p><div class="choice"><label for="post">次に充電が足りなくなったら？</label><select id="post"><option value="">選択してください</option><option>ChargeSPOTを使いたい</option><option>必要なときに検討したい</option><option>まだ分からない</option></select></div><div class="goal-actions"><button id="surveySave" class="secondary">回答を保存</button><span class="rental-note"> 端末内保存</span></div><p id="surveyResult" class="save-message" role="status"></p></section>','作戦完了。','新宿の4つの手がかりが、一つの救出作戦につながった。');
  $('#post').value=S.post||'';
  $('#surveySave').onclick=()=>{if(!$('#post').value){$('#surveyResult').textContent='回答を選んでください。';return;}S.post=$('#post').value;save();$('#surveyResult').textContent='保存しました。ご参加ありがとうございました。';};
}
function route() {
  $('#app').innerHTML='<section class="route-page"><h1>捜査ルート</h1><ol class="route-list">'+C.stations.map((st,i)=>'<li class="'+(i<S.done?'finished':i===S.done?'current':'')+'"><b>'+String(i+1).padStart(2,'0')+'</b><div><h2>'+locations[i]+'</h2><p>'+esc(st.place.replace(locations[i],''))+'</p><p>'+(i<S.done?'捜査完了':i===S.done?'現在の目的地':i===2?'レンタル地点':'')+'</p></div>'+link(st.map,'地図 ↗')+'</li>').join('')+'</ol><p class="rental-note">4地点 / 30-45分。屋内移動やレンタル時間で前後します。</p></section>';
}
function logs() {
  $('#app').innerHTML='<section class="logs-page"><h1>捜査ログ</h1>'+(S.done ? C.promotions.slice(0,S.done).map((p,i)=>'<article class="log-entry"><span class="log-code">ST'+(i+1)+' / '+esc(C.stations[i].answer)+'</span><h2>'+esc(p.title)+'</h2><p>'+promotionBodies[i]+'</p></article>').join('') : '<p class="empty">まだログがありません。<br>謎を解くと、ここに安全の手がかりが記録されます。</p>')+link('https://chargespot.jp/topics/2444/','ChargeSPOTの安全への取り組み ↗','source')+'</section>';
}
function render(focus=false) {
  document.querySelectorAll('[data-view]').forEach(button=>{if(button.dataset.view===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(view==='route')route();else if(view==='logs')logs();else if(revealPending())promotion();else if(S.done===4)goal();else if(!S.started)intro();else mission();
  if(focus){const heading=$('#correctTitle')||$('#app');heading.focus({preventScroll:true});$('#app').scrollIntoView({block:'start',behavior:'instant'});}
}
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;render();});
$('#settingsOpen').onclick=()=>$('#settings').showModal();
$('#settingsClose').onclick=()=>$('#settings').close();
$('#reset').onclick=()=>{if(confirm('進捗を消して最初からやり直しますか？')){S=fresh();save();view='mission';$('#settings').close();render();}};
$('#testAnswers').onclick=()=>$('#answers').textContent=C.stations.map((st,i)=>'ST'+(i+1)+': '+st.answer).join(' / ');
render();
})();
