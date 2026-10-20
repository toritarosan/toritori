// 子ども向けページ共通: 辞書の語だけにふりがなを付ける(長い語を先に)。辞書にない漢字には付けない
const DICT = {
  "小金井市議会議員":"こがねいしぎかいぎいん","小金井市長":"こがねいしちょう","小金井市":"こがねいし","小金井":"こがねい",
  "市議会":"しぎかい","市役所":"しやくしょ","市長":"しちょう","市民":"しみん","選挙":"せんきょ","任期":"にんき",
  "図書館":"としょかん","公園":"こうえん","学校":"がっこう","中学生":"ちゅうがくせい","高校生":"こうこうせい","小学校":"しょうがっこう","中学校":"ちゅうがっこう",
  "勉強":"べんきょう","自習":"じしゅう","居場所":"いばしょ","若い人":"わかいひと","意見":"いけん","部活動":"ぶかつどう","地域":"ちいき",
  "大学":"だいがく","専門学校":"せんもんがっこう","障害":"しょうがい","工事":"こうじ","栗山":"くりやま","梶野":"かじの","三楽":"さんらく",
  "洋式":"ようしき","目標":"もくひょう","予定":"よてい","達成":"たっせい","肥料":"ひりょう","地球温暖化":"ちきゅうおんだんか","気候変動":"きこうへんどう",
  "気候市民会議":"きこうしみんかいぎ","会議":"かいぎ","多様化":"たようか","応援":"おうえん","大阪府":"おおさかふ","枚方市":"ひらかたし",
  "生まれ":"うまれ","家族":"かぞく","係":"かかり","会社":"かいしゃ","約":"やく","妻":"つま","朝":"あさ","毎日":"まいにち",
  "仕事":"しごと","案":"あん","決め":"きめ","話し合":"はなしあ","進め":"すすめ","手伝":"てつだ","子ども":"こども","若者":"わかもの",
  "生ごみ":"なまごみ","分け方":"わけかた","通え":"かよえ","字":"じ","読":"よ","書":"か","合":"あ","力":"ちから","外":"そと",
  "考え":"かんがえ","生か":"いか","開":"ひら","使":"つか","集":"あつ","終":"お","年":"ねん","月":"がつ","人たち":"ひとたち",
  "学び方":"まなびかた","学び":"まなび","早く":"はやく","子":"こ","市":"し","工事":"こうじ",
  "写真":"しゃしん","入":"はい","金":"かね","人":"ひと","場所":"ばしょ","遊":"あそ","代":"だい","声":"こえ","変":"か","会":"かい","広":"ひろ","行":"い","自分":"じぶん","政策":"せいさく",
  "東小金井駅":"ひがしこがねいえき","駅":"えき","喫煙所":"きつえんじょ","煙":"けむり","自転車":"じてんしゃ","事故":"じこ","路線":"ろせん","利用":"りよう",
  "交流":"こうりゅう","防災":"ぼうさい","見守":"みまも","放課後":"ほうかご","休み":"やすみ","登校":"とうこう","夜":"よる","夕方":"ゆうがた","時間":"じかん",
  "小学生":"しょうがくせい","守":"まも","減":"へ","歩":"ある","楽":"たの","災害":"さいがい","地図":"ちず","場合":"ばあい","下":"した","上":"うえ","家":"いえ","帰":"かえ",
  "一日":"いちにち","道":"みち","乗":"の","町":"まち","作":"つく","吸":"す","雨":"あめ","友":"とも","全部":"ぜんぶ","近所":"きんじょ","何":"なに","気":"き","大人":"おとな","近く":"ちかく","学ぶ":"まなぶ","子育て":"こそだて","建物":"たてもの","出会":"であ","休みの日":"やすみのひ","分けます":"わけます",
  "使い方":"つかいかた","計画":"けいかく","強め":"つよめ","始まる":"はじまる","前":"まえ","意味":"いみ","一人":"ひとり",
  "発行者名":"はっこうしゃめい","要確認":"ようかくにん","見":"み","関係":"かんけい","出":"で","一度":"いちど","資源":"しげん","地球":"ちきゅう","気温":"きおん","天気":"てんき","長い":"ながい","重要課題":"じゅうようかだい","文":"ぶん","ハム太":"はむた","白井":"しらい","案内役":"あんないやく","色":"いろ","注目":"ちゅうもく","知":"し","着":"つ","答":"こた","始":"はじ","売":"う","電車":"でんしゃ","速":"はや","分":"わ","決":"き","運動会":"うんどうかい","花火大会":"はなびたいかい","もん中":"もんちゅう","送":"おく","閉":"と","消":"き","条例":"じょうれい","権利":"けんり","自然":"しぜん","親しむ":"したしむ","点":"てん","関する":"かんする","回った":"まわった","回数":"かいすう","回":"かい","走":"はし","入れ":"いれ","話":"はなし","大きな":"おおきな","絵":"え","本物":"ほんもの","か所":"かしょ","声":"こえ","変":"か"
};
const KEYS = Object.keys(DICT).sort((a,b)=>b.length-a.length);
const RE = new RegExp(KEYS.join('|'),'g'); // 辞書の語は漢字・かな・数字だけなのでエスケープ不要
// ルビは漢字の部分にだけ付ける(送り仮名には付けない): 「決め/きめ」→ 決(き)+め、「話し合/はなしあ」→ 話(はな)+し+合(あ)
// 語を漢字の続き/それ以外に分け、それ以外の部分を読みの中で目印にして切り分ける。ルビは漢字以外(かな・数字・記号)には絶対に付けない
const hira=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
function splitRuby(word,yomi){
  const runs=word.match(/[一-鿿々]+|[^一-鿿々]+/g);
  if(runs.length===1) return /[一-鿿々]/.test(word)?[[word,yomi]]:[[word,null]];
  const pat='^'+runs.map(r=>/[一-鿿々]/.test(r)?'(.+?)':'('+hira(r)+')').join('')+'$';
  const m=yomi.match(new RegExp(pat));
  if(!m){ // 漢字ごとに読みを分けられない語: 漢字だけの語なら語全体に付ける。漢字以外を含むならルビを付けない(漢字以外にルビを付けないルール)
    if(/^[一-鿿々]+$/.test(word)) return [[word,yomi]];
    console.warn('ルビを付けない(読みを漢字ごとに分けられない):',word,yomi); return [[word,null]]; }
  return runs.map((r,k)=>/[一-鿿々]/.test(r)?[r,m[k+1]]:[r,null]);
}
const SPLIT={}; for(const k of KEYS) SPLIT[k]=splitRuby(k,DICT[k]);
// ルビと本文の間を詰める: ルビの行高が本文(1.8〜1.9倍)を引き継いで間が空くので、ルビだけ1倍にする
(()=>{const st=document.createElement('style');st.textContent='rt{line-height:1}';document.head.append(st);})();
function addRuby(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
    const p=n.parentElement; if(!p||p.closest('script,style,rt,ruby,.src,.draftbar,.tools,footer,.noruby,svg'))return NodeFilter.FILTER_REJECT;
    return /[一-鿿]/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  for(const n of nodes){
    const t=n.nodeValue; RE.lastIndex=0; if(!RE.test(t))continue; RE.lastIndex=0;
    const frag=document.createDocumentFragment();let i=0;
    t.replace(RE,(m,off)=>{
      if(off>i)frag.append(t.slice(i,off));
      for(const [base,yomi] of SPLIT[m]){
        if(yomi===null){frag.append(base);continue;}
        const r=document.createElement('ruby');r.append(base);const rt=document.createElement('rt');rt.textContent=yomi;r.append(rt);frag.append(r);
      }
      i=off+m.length;return m;});
    if(i<t.length)frag.append(t.slice(i));
    n.replaceWith(frag);
  }
}
function setupToggles(){
  const rb=document.getElementById('rubyBtn'),sb=document.getElementById('srcBtn');
  rb.onclick=()=>{const on=rb.getAttribute('aria-pressed')!=='true';rb.setAttribute('aria-pressed',on);document.body.classList.toggle('no-ruby',!on);};
  sb.onclick=()=>{const on=sb.getAttribute('aria-pressed')!=='true';sb.setAttribute('aria-pressed',on);document.body.classList.toggle('hide-src',!on);};
}
