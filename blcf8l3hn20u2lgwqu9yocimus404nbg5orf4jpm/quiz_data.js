// こがハムくんのクイズ(マップ版・クイズページ共通)。
// 問題・答え・説明は kodomo.html のカード、または出典のある一般的なしくみの説明だけを使う(新しい事実・約束は書かない)。
// 答えはどこにも送らない・保存しない(ページを閉じれば消える)。「正解したら応援」のような作りにしない。
const QUIZ = {
  "p-school": {q:"学校のトイレを洋式にする目標（80％）は、どうなった？",
    choices:["予定より早く達成した","まだ始まっていない","とちゅうでやめた"], a:0,
    explain:"小学校・中学校のトイレを洋式にする目標（80％）は、予定より早く達成したよ。", src:"政策2026 P1-5T これまで欄"},
  "p-park": {q:"「play here（プレイ ヒア）」は、どんな公園づくり？",
    choices:["障害のある子も、いっしょに遊べる公園","大人だけが使える公園","夜だけ開く公園"], a:0,
    explain:"障害のある子も、いっしょに遊べる公園づくりだよ。栗山公園・梶野公園・三楽公園の工事が終わったんだって。", src:"政策2026 P5-2"},
  "p-after": {q:"若い人の居場所や自習スペースを、これからどうする？",
    choices:["ふやす","へらす","なくす"], a:0,
    explain:"「ふやします」と書いてあるよ。", src:"政策2026 P1-9"},
  "p-town": {q:"東小金井駅に、たばこを吸う場所をつくるのは、なんのため？",
    choices:["吸わない人が、煙を吸わずにすむように","たばこを売るため","電車を速くするため"], a:0,
    explain:"たばこを吸う場所を分けて、吸わない人が煙を吸わずにすむようにするんだって。", src:"政策2026 P2-5"},
  "p-home": {q:"「考えます」って、どういう意味？",
    choices:["やるかどうかを、これからしらべて決める","もう、やると決まった","ぜったいにやらない"], a:0,
    explain:"「考えます」は、やるかどうかを、これからしらべて決める、という意味だよ。朝の居場所づくりは「考えます」なんだ。", src:"政策2026 P1-4（検討します）"},
  "p-voice": {q:"10代の声を市のしごとに生かすために、開くのはどれ？",
    choices:["ティーンズ会議","運動会","花火大会"], a:0,
    explain:"「ティーンズ会議」を開くなどして、若い人の意見を生かすんだって。", src:"政策2026 P1-10"},
  // クイズページだけで出す、しくみの問題(特定の候補に限らない内容)
  "c-giketsu": {q:"市長は、市のお金の使いみちを、ひとりで決められる？",
    choices:["決められない。市議会で話し合って決める","ひとりで決められる","子どもが決める"], a:0,
    explain:"市長が案をつくって、市民がえらんだ市議会で話し合って決めるよ。", src:"地方自治法（予算の調製と議会の議決）"},
  "c-ninki": {q:"市長の任期は、何年？",
    choices:["4年","1年","10年"], a:0,
    explain:"市長は選挙でえらばれて、任期は4年だよ。", src:"地方自治法（任期4年）"},
  "c-kenri": {q:"小金井市の条例で、子どもの権利として書かれているのはどれ？",
    choices:["自然に親しむこと","テストで100点をとること","夜ふかしすること"], a:0,
    explain:"「小金井市子どもの権利に関する条例」には、「自然に親しむこと」が子どもの権利として書かれているよ。", src:"小金井市子どもの権利に関する条例 第9条⑸"},
};

// 1問を描く。onDone(正解したか) は答えたあとに呼ばれる。選択肢の順番は毎回まぜる
function renderQuiz(box, item, onDone){
  const order=[0,1,2].sort(()=>Math.random()-.5);
  box.innerHTML='';
  const wrap=document.createElement('div'); wrap.className='quiz';
  const q=document.createElement('p'); q.className='qq'; q.textContent=item.q; wrap.append(q);
  const list=document.createElement('div'); list.className='qchoices';
  order.forEach(i=>{
    const b=document.createElement('button'); b.type='button'; b.className='qbtn'; b.textContent=item.choices[i];
    b.onclick=()=>{
      const ok=i===item.a;
      list.querySelectorAll('.qbtn').forEach(x=>{x.disabled=true;});
      b.classList.add(ok?'right':'wrong');
      if(!ok) list.querySelectorAll('.qbtn')[order.indexOf(item.a)].classList.add('right');
      const fb=document.createElement('div'); fb.className='qfb '+(ok?'ok':'ng');
      fb.innerHTML='<img alt="" width="56" src="assets/hamuta/hamuta_'+(ok?'excited':'worried')+'.svg"><p><b></b><span></span><small></small></p>';
      fb.querySelector('b').textContent=ok?'せいかい！':'ざんねん！';
      fb.querySelector('span').textContent=item.explain;
      fb.querySelector('small').textContent='もとの文：'+item.src;
      wrap.append(fb); if(typeof addRuby==='function') addRuby(fb);
      fb.setAttribute('tabindex','-1'); fb.focus({preventScroll:true});
      onDone&&onDone(ok);
    };
    list.append(b);
  });
  wrap.append(list); box.append(wrap);
  if(typeof addRuby==='function') addRuby(wrap);
}

// クイズの見た目(どのページでも同じ)
(()=>{const st=document.createElement('style');st.textContent=`
.quiz{background:#fff;border:3px solid #f5ab30;border-radius:20px;padding:14px 16px;margin:0 0 14px}
.quiz .qq{margin:0 0 10px;font-weight:900;font-size:20px;line-height:1.7}
.quiz .qq::before{content:"Q";display:inline-block;background:#f5ab30;color:#3a2a00;border-radius:8px;padding:0 9px;margin-right:8px;font-size:17px}
.qchoices{display:grid;gap:10px}
.qbtn{font:inherit;font-weight:700;font-size:17px;line-height:1.6;text-align:left;background:#fffaf0;color:#2b2b2b;border:3px solid #eadfcb;border-radius:14px;padding:8px 14px;cursor:pointer;min-height:48px}
.qbtn:hover:not(:disabled),.qbtn:focus-visible{border-color:#1f6fb2;outline:none}
.qbtn:disabled{cursor:default;opacity:.75}
.qbtn.right{border-color:#2f7d4f;background:#eef8f0;opacity:1}
.qbtn.right::before{content:"○ ";color:#2f7d4f;font-weight:900}
.qbtn.wrong{border-color:#b00020;background:#fdecee;opacity:1}
.qbtn.wrong::before{content:"× ";color:#b00020;font-weight:900}
.qfb{display:flex;gap:10px;align-items:flex-start;margin-top:12px;outline:none}
.qfb img{flex:none;width:56px;height:auto}
.qfb p{margin:0;background:#fff8e1;border-radius:14px;padding:8px 12px;flex:1}
.qfb b{display:block;font-size:19px}
.qfb.ok b{color:#2f7d4f}.qfb.ng b{color:#b85300}
.qfb small{display:block;font-size:13px;color:#5f5f5f;margin-top:4px}
`;document.head.append(st);})();
