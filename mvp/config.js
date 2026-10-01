window.EVENT_CONFIG = {
  "version": "mvp-4-v1",
  "duration": "30〜45分",
  "couponCode": "",
  "surveyUrl": "",
  "promotions": [
    {
      "title": "365日、見守る安全。",
      "lead": "答えの365は、一年を通した見守りの合図。",
      "body": "スタンドとバッテリーを、24時間365日IoTで監視。借りる前から、一つひとつの状態を見守っています。",
      "story": "監視ログからガルルの痕跡を発見。次は電力の奪取を止めよう。"
    },
    {
      "title": "異常を見つけたら、貸出を止める。",
      "lead": "LOCKは、異常のあるバッテリーを貸し出さないための仕組み。",
      "body": "劣化の兆候や異常を検知したバッテリーは、貸出をロック。該当スロットへの給電を遮断する機能も備えています。",
      "story": "ガルルの奪取を阻止！ でも救出にはまだエネルギーが足りない。ST3で補給しよう。"
    },
    {
      "title": "貸して終わりではない、回収と管理。",
      "lead": "SAFE ENERGYを支えるのは、見守りから回収まで続く運用。",
      "body": "異常の兆候があるバッテリーは、全国の運用網で回収。問題がない場合も、最長3年で回収する運用です。",
      "story": "SAFE ENERGYを確保。これまでの安全ログを使い、チャポポを救出しよう。"
    },
    {
      "title": "必要なときに、安全を借りよう。",
      "lead": "MONITOR → DETECT → LOCK → RECOVER。見守る・見つける・止める・回収する。",
      "body": "監視、異常検知、貸出ロック、回収。充電を支える仕組みを知った今、ChargeSPOTを「必要なとき」の選択肢に。",
      "story": "あなたの作戦でチャポポが復活！ ゴールで救出完了を確認しよう。"
    }
  ],
  "stations": [
    {
      "name": "追跡｜消えた救難信号",
      "place": "東急歌舞伎町タワー2F・シネシティ広場側",
      "map": "https://maps.google.com/?q=Tokyu+Kabukicho+Tower",
      "story": "ガルルはステーションの電力を奪い、チャポポを連れ去った。24時間365日の監視ログに残った痕跡を解読せよ。",
      "question": "映像で光る3記号を、次の表で数字に変換して順に並べよう。◇＝3、○＝6、△＝5、□＝8。",
      "answer": "365",
      "key": "◇ → ○ → △",
      "hint": "最初に光る◇は3。映像の順番を保って3桁にしよう。",
      "token": "MONITOR",
      "image": "../assets/storyboard/st2.png",
      "cuts": [
        "0–3秒：チャポポの救難信号が途切れる。",
        "3–7秒：ガルルの痕跡を監視網が検出。24H / 365D。",
        "7–11秒：◇→○→△が左から順に光る（各1秒）。",
        "11–15秒：TRACE LOG。記号順を繰り返し表示。"
      ],
      "facility": "東急歌舞伎町タワー"
    },
    {
      "name": "阻止｜LOCK作戦",
      "place": "タイトーステーション新宿東口店4F",
      "map": "https://maps.google.com/?q=Taito+Station+Shinjuku+East+Exit",
      "story": "ガルルに追いついた！ 異常検知で電力奪取を止めよう。ただし、チャポポの信号はまだ弱い。",
      "question": "映像で赤く点灯したスロットの記号を、次の表で解読しよう。A＝OPEN、B＝LOCK、C＝WAIT。",
      "answer": "LOCK",
      "key": "スロットBだけが赤く点灯",
      "hint": "色だけでなく、点灯したスロットの文字を確認しよう。",
      "token": "LOCK",
      "image": "../assets/storyboard/st4.png",
      "cuts": [
        "0–3秒：ガルルがステーションから電力を奪おうとする。",
        "3–7秒：異常を検知。スロットA/B/Cを表示。",
        "7–11秒：Bのみ赤く点灯し、貸出ロック。Bを3秒保持。",
        "11–15秒：該当スロットの給電が遮断。チャポポはまだ救えない。"
      ],
      "facility": "タイトーステーション新宿東口店"
    },
    {
      "name": "補給｜SAFE ENERGY",
      "place": "ビックカメラ新宿東口店1F・西側エレベーター前",
      "map": "https://maps.google.com/?q=Bic+Camera+Shinjuku+East+Exit",
      "story": "チャポポを救うにはSAFE ENERGYが必要だ。配布された1時間無料券でChargeSPOTをレンタルしよう。",
      "question": "映像の色順を対応表で読むと合言葉になる。青＝S、紫＝A、白＝F、黄＝E。レンタル後、4文字を入力しよう。",
      "answer": "SAFE",
      "key": "青 → 紫 → 白 → 黄（色名も併記）",
      "hint": "映像の順に1文字ずつ拾う。最初の青はS。",
      "token": "RECOVER",
      "image": "../assets/storyboard/st5.png",
      "cuts": [
        "0–3秒：チャポポ『SAFE ENERGYが必要だよ』。公式素材差し替え枠。",
        "3–7秒：無料券確認→公式アプリでレンタル→Webで自己申告。",
        "7–11秒：青→紫→白→黄が順に点灯。色名を併記。",
        "11–15秒：状態管理されたエネルギーを受け取る。色順を保持。"
      ],
      "facility": "ビックカメラ新宿東口店"
    },
    {
      "name": "救出｜最終プロトコル",
      "place": "東急歌舞伎町タワー2F・西武新宿駅側",
      "map": "https://maps.google.com/?q=Tokyu+Kabukicho+Tower",
      "story": "タワーでガルルを止め、SAFE ENERGYをチャポポへ！ これまでの安全ログと最後の映像を組み合わせよう。",
      "question": "ログ1＝MONITOR、2＝LOCK、3＝RECOVER、新しい操作4＝DETECT。映像に出る番号順で4つの英単語を並べ、半角スペースで区切って入力しよう。",
      "answer": "MONITOR DETECT LOCK RECOVER",
      "key": "1 → 4 → 2 → 3",
      "hint": "1はMONITOR、4はDETECT。残りも番号で読む。",
      "token": "RESCUED",
      "image": "../assets/storyboard/st8.png",
      "cuts": [
        "0–3秒：ガルルが最後のエネルギーを奪おうとする。",
        "3–7秒：工程番号1→4→2→3を順に大表示。",
        "7–11秒：監視→検知→ロック→回収が起動し、奪取を止める。",
        "11–15秒：SAFE ENERGYでチャポポ復活。GOALへ案内。"
      ],
      "facility": "東急歌舞伎町タワー"
    }
  ]
};
