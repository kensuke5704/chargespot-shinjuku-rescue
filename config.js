/* Replace only this file after site-survey approval. */
window.EVENT_CONFIG = {
  title: 'CHAPOPO RESCUE // SAFE ENERGY PROTOCOL',
  start: 'STATION 1：東急歌舞伎町タワー 2F エントランス付近（シネシティ広場側）',
  goal: 'STATION 8：東急歌舞伎町タワー 2F エントランス付近（西武新宿駅側）',
  stations: [
    {id:1, name:'STATION 1｜最初の異常', address:'東急歌舞伎町タワー 2F エントランス付近（シネシティ広場側）', map:'https://maps.google.com/?q=Tokyu+Kabukicho+Tower', hours:'施設・スタンド稼働時間を開催前確認'},
    {id:2, name:'STATION 2｜IoTログ解析', address:'東急歌舞伎町タワー外 自販機', map:'https://maps.google.com/?q=Tokyu+Kabukicho+Tower', hours:'屋外設置状況・稼働時間を開催前確認'},
    {id:3, name:'STATION 3｜移動方向', address:'GiGO 新宿歌舞伎町', map:'https://maps.google.com/?q=GiGO+Shinjuku+Kabukicho', hours:'施設・スタンド稼働時間を開催前確認'},
    {id:4, name:'STATION 4｜LOCK作戦', address:'タイトーステーション 新宿東口店 4F', map:'https://maps.google.com/?q=Taito+Station+Shinjuku+East+Exit', hours:'4Fへの入館可否・営業時間を開催前確認'},
    {id:5, name:'STATION 5｜SAFE ENERGY補給', address:'ビックカメラ 新宿東口店 西側エレベーター前 1F', map:'https://maps.google.com/?q=Bic+Camera+Shinjuku+East+Exit', hours:'在庫・返却枠・営業時間を開催前確認'},
    {id:6, name:'STATION 6｜安全性の証明', address:'ルミネエスト新宿店 1F 南側エレベーター前', map:'https://maps.google.com/?q=Lumine+Est+Shinjuku', hours:'入館可否・営業時間を開催前確認'},
    {id:7, name:'STATION 7｜救出座標', address:'西武鉄道 西武新宿駅北口', map:'https://maps.google.com/?q=Seibu+Shinjuku+Station+North+Exit', hours:'設置位置・稼働時間を開催前確認'},
    {id:8, name:'STATION 8｜最終決戦', address:'東急歌舞伎町タワー 2F エントランス付近（西武新宿駅側）', map:'https://maps.google.com/?q=Tokyu+Kabukicho+Tower', hours:'施設・スタンド稼働時間を開催前確認'}
  ],
  couponCode: 'SAFE-ENERGY-60', // replace with issued campaign coupon before opening
  surveyUrl: 'https://example.com/survey', // replace with approved survey URL
  answers: ['MONITOR','365','NORTH','LOCK','SAFE','RECOVER','TOWER','MONITOR DETECT LOCK RECOVER'],
  hints: [
    '動画に現れる4つの記号の順番を、冊子p.4の対応表で文字にします。',
    '動画の異常ログをそのまま半角数字で入力します。',
    '動画内でガルルが移動した3色の順を、冊子p.6の方位表に照合します。',
    '動画で赤く点灯した安全機能の英単語を入力します。',
    'レンタル完了後に表示される合言葉です。自己申告後に入力できます。',
    '動画の4つの工程のうち、最後に実行される操作を入力します。',
    '集めた文字を冊子p.11の座標表に置くと現れる場所です。',
    '動画の順序を半角スペース区切りで入力します。'
  ]
};
