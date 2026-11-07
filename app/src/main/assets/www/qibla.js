'use strict';
/* القبلة الحية: بوصلة الجوال تدور، والكعبة ثابتة على اتجاهها الحقيقي. لما تصير تحت المؤشر الذهبي أنت متجه للقبلة. */
(function(){
  let bearing = 0, smooth = null, aligned = false, gotHeading = false, webOn = false, waitT = null;
  const ticks = [];
  for (let d = 0; d < 360; d += 10){
    const big = d % 30 === 0, r1 = big ? 122 : 128, r2 = 136, a = (d - 90) * Math.PI / 180;
    ticks.push(`<line x1="${150 + r1*Math.cos(a)}" y1="${150 + r1*Math.sin(a)}" x2="${150 + r2*Math.cos(a)}" y2="${150 + r2*Math.sin(a)}" stroke="currentColor" stroke-opacity="${big ? .6 : .3}" stroke-width="${big ? 2 : 1}"/>`);
  }
  $('#qbTicks').innerHTML = ticks.join('');

  const norm = x => ((x % 360) + 540) % 360 - 180;   // فرق الزاوية بين -180 و 180

  function open(){
    const L = getLoc();
    bearing = adhan.Qibla(new adhan.Coordinates(L.lat, L.lng));
    $('#qbPlace').textContent = `${L.label} · القبلة ${Math.round(bearing)}° من الشمال`;
    $('#qbKaaba').setAttribute('transform', `rotate(${bearing.toFixed(1)} 150 150)`);
    $('#qbDial').style.transform = 'rotate(0deg)';
    smooth = null; aligned = false; gotHeading = false;
    $('#qiblaView').classList.remove('aligned');
    $('#qbState').textContent = 'جاري تشغيل البوصلة…'; $('#qbDeg').textContent = '';
    $('#qiblaView').hidden = false;
    start();
  }
  function start(){
    const L = getLoc();
    if (N && N.startCompass) N.startCompass(L.lat, L.lng);
    else if (!webOn){
      webOn = true;
      const h = e => { const hd = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? 360 - e.alpha : null); if (hd != null) window.onHeading(hd, 3); };
      window.addEventListener('deviceorientationabsolute', h); window.addEventListener('deviceorientation', h);
    }
    clearTimeout(waitT);
    waitT = setTimeout(() => { if (!gotHeading){ $('#qbState').textContent = 'البوصلة غير متاحة'; $('#qbDeg').textContent = `اتجاه القبلة ${Math.round(bearing)}° من الشمال`; $('#qbHint').textContent = 'جوالك ما فيه حساس بوصلة، أو الحساس مقفل. استخدم الزاوية مع أي بوصلة.'; } }, 3500);
  }
  function close(){
    $('#qiblaView').hidden = true; clearTimeout(waitT);
    if (N && N.stopCompass) N.stopCompass();
  }
  window.onHeading = (h, acc) => {
    if (h == null){ gotHeading = false; return; }
    gotHeading = true;
    if (smooth == null) smooth = h; else smooth = (smooth + norm(h - smooth) * 0.35 + 360) % 360;
    $('#qbDial').style.transform = `rotate(${(-smooth).toFixed(1)}deg)`;
    const diff = norm(bearing - smooth);
    const now = Math.abs(diff) < 4;
    if (now !== aligned){
      aligned = now; $('#qiblaView').classList.toggle('aligned', now);
      if (now){ if (N && N.vibrate) N.vibrate(60); else if (navigator.vibrate) navigator.vibrate(60); }
    }
    $('#qbState').textContent = now ? 'أنت متجه للقبلة' : (diff > 0 ? 'لف يمين' : 'لف يسار');
    $('#qbDeg').textContent = now ? `${Math.round(bearing)}° من الشمال` : `باقي ${Math.round(Math.abs(diff))}°`;
    $('#qbHint').textContent = acc < 2 ? 'دقة البوصلة ضعيفة: حرّك الجوال على شكل ٨ في الهواء، وابعد عن الحديد والمغناطيس.' : 'امسك الجوال مستوي وأدره لين تصير الكعبة تحت المؤشر الذهبي.';
  };
  window.onCompassPaused = () => {};
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#qiblaView').hidden) start(); });

  $('#qiblaTile').onclick = open;
  $('#qbBack').onclick = close;
  const prevBack = window.onBack;
  window.onBack = () => { if (!$('#qiblaView').hidden){ close(); return true; } return prevBack ? prevBack() : false; };
})();
