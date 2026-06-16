// tweaks-app.jsx — Tweaks panel for the 白井とおる campaign site (こがおも CMYK).

const TONE_MAP = { "青×ピンク": "pop", "ピンク基調": "magenta", "ブルー基調": "blue" };
const TONE_LABELS = Object.keys(TONE_MAP);

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tone": "青×ピンク",
  "corners": "まるい",
  "heroLine1": "みんなでつくろう。",
  "heroLine2": "いろいろが彩るまち",
  "floatCta": true,
  "marquee": true
}/*EDITMODE-END*/;

function CampaignTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-tone', TONE_MAP[t.tone] || 'pop');
  }, [t.tone]);

  React.useEffect(() => {
    const s = document.documentElement.style;
    if (t.corners === 'かっちり') { s.setProperty('--r-lg','10px'); s.setProperty('--r-md','8px'); s.setProperty('--r-sm','5px'); }
    else { s.setProperty('--r-lg','30px'); s.setProperty('--r-md','18px'); s.setProperty('--r-sm','12px'); }
  }, [t.corners]);

  React.useEffect(() => {
    const h = document.getElementById('hero-headline');
    if (h) {
      const l1 = (t.heroLine1 || '').replace(/</g, '&lt;');
      const l2 = (t.heroLine2 || '').replace(/</g, '&lt;');
      h.innerHTML = `<span class="underline">${l1}</span><br><span class="underline">${l2}</span>`;
    }
  }, [t.heroLine1, t.heroLine2]);

  React.useEffect(() => {
    const cta = document.querySelector('.float-cta');
    if (cta) cta.style.display = t.floatCta ? '' : 'none';
  }, [t.floatCta]);

  React.useEffect(() => {
    const m = document.querySelector('.marquee');
    if (m) m.style.display = t.marquee ? '' : 'none';
  }, [t.marquee]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="全体のトーン" />
      <TweakRadio label="カラー" value={t.tone} options={TONE_LABELS} onChange={(v) => setTweak('tone', v)} />
      <TweakRadio label="角の形" value={t.corners} options={["まるい", "かっちり"]} onChange={(v) => setTweak('corners', v)} />

      <TweakSection label="キャッチコピー" />
      <TweakText label="1行目" value={t.heroLine1} onChange={(v) => setTweak('heroLine1', v)} />
      <TweakText label="2行目（強調）" value={t.heroLine2} onChange={(v) => setTweak('heroLine2', v)} />

      <TweakSection label="表示" />
      <TweakToggle label="流れる帯（マーキー）" value={t.marquee} onChange={(v) => setTweak('marquee', v)} />
      <TweakToggle label="フローティング応援ボタン" value={t.floatCta} onChange={(v) => setTweak('floatCta', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<CampaignTweaks />);
