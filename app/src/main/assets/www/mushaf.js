'use strict';
/* المصحف: صفحات مصحف المدينة (٦٠٤ صفحة) بخط مجمع الملك فهد QCF4، مع فهرس وتفسير.
   بيانات الصفحات مضمّنة، والخطوط تتحمّل من النت أول مرة ثم تبقى محفوظة.
   بدون نت: نعرض نص الصفحة نفسها بخط أميري قرآن. */
(function(){
  const QCF_BASE = window.QCF_BASE || 'https://cdn.jsdelivr.net/npm/quran-qcf4@1.1.0/fonts-woff2/';
  const TAFSIR_ONLINE = {
    saadi:  'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafseer-al-saddi/',
    kathir: 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-ibn-kathir/'
  };
  const JUZ = [1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];

  let PAGES = null, IDX = null, TAF = null, v2page = null, ready = null;
  let page = 1, selV = null, qTab = 'surahs', busy = false;

  function load(){
    if (ready) return ready;
    ready = Promise.all([fetch('mushaf.json').then(r => r.json()), fetch('mushaf-index.json').then(r => r.json()), loadQuran()])
      .then(([p, i]) => {
        PAGES = p; IDX = i; v2page = new Uint16Array(IDX.cum[114] + 1);
        p.forEach((lines, k) => lines.forEach(l => { if (l[0] === 'w') l[3].forEach(v => { if (v && !v2page[v]) v2page[v] = k + 1; }); }));
      });
    return ready;
  }
  const sa = v => { let s = 1; while (IDX.cum[s] < v) s++; return [s, v - IDX.cum[s-1]]; };
  const gv = (s, a) => IDX.cum[s-1] + a;
  const juzOf = p => { let j = 1; for (let k = 0; k < 30; k++) if (JUZ[k] <= p) j = k + 1; return j; };
  const surahOfPage = p => { const first = PAGES[p-1].find(l => l[0] === 'w'); return first ? sa(first[3][0])[0] : PAGES[p-1].find(l => l[0] === 'h')[3]; };

  /* ---------- الخطوط ---------- */
  const fonts = new Map();
  function fontFile(n){ return n === 0 ? 'QCF4_QBSML' : 'QCF4_Hafs_' + String(n).padStart(2,'0') + '_W'; }
  function ensureFont(n){
    if (fonts.has(n)) return fonts.get(n);
    const f = new FontFace('qcf' + n, `url(${QCF_BASE}${fontFile(n)}.woff2)`, {display:'block'});
    const pr = f.load().then(ff => { document.fonts.add(ff); return true; });
    pr.catch(() => fonts.delete(n));
    fonts.set(n, pr); return pr;
  }
  const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

  /* ---------- رسم الصفحة ---------- */
  function headHtml(p){
    return `<div class="m-head"><span>سورة ${IDX.chapters[surahOfPage(p)-1][0]}</span><span>الجزء ${ar(juzOf(p))}</span></div>`;
  }
  function glyphPage(p){
    const lines = PAGES[p-1];
    return headHtml(p) + '<div class="m-lines" id="mLines">' + lines.map(l => {
      const [t, f, chars, vs] = l; const cs = Array.from(chars);
      if (t === 'w') return `<div class="m-line" style="font-family:qcf${f}">${cs.map((c,i) => `<span data-v="${vs[i]}">${c}</span>`).join('')}</div>`;
      return `<div class="m-line hdr" data-k="${t}" style="font-family:qcf${f}">${chars}</div>`;
    }).join('') + `</div><div class="m-num"><b>${ar(p)}</b></div>`;
  }
  function textPage(p){
    const vs = new Set(); PAGES[p-1].forEach(l => { if (l[0] === 'w') l[3].forEach(v => v && vs.add(v)); });
    let html = '';
    [...vs].sort((a,b) => a-b).forEach(v => {
      const [s, a] = sa(v);
      if (a === 1){ html += `<span class="shdr">سورة ${IDX.chapters[s-1][0]}</span>`;
        if (s !== 1 && s !== 9) html += '<span class="shdr" style="border:0">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</span>'; }
      html += `<span data-v="${v}">${QURAN[s-1][2][a-1]}</span> <span class="ayah-n">${ar(a)}</span> `;
    });
    return headHtml(p) + `<div class="m-text">${html}</div><div class="m-num"><b>${ar(p)}</b></div>`;
  }
  function fit(){
    const box = document.getElementById('mLines'); if (!box) return;
    const lines = [...box.querySelectorAll('.m-line')];
    const base = 20; box.style.fontSize = base + 'px';
    const avail = box.clientWidth - 6;
    let maxW = 1; lines.forEach(l => { if (!l.classList.contains('hdr')) maxW = Math.max(maxW, l.scrollWidth); });
    let size = base * avail / maxW * 0.97;
    const hAvail = box.clientHeight; const per = hAvail / Math.max(15, lines.length);
    size = Math.min(size, per / 1.45);
    box.style.fontSize = size.toFixed(2) + 'px';
    lines.forEach(l => { if (l.classList.contains('hdr') && l.scrollWidth > avail) l.style.fontSize = (avail / l.scrollWidth).toFixed(3) + 'em'; });
  }
  async function draw(p, dir){
    p = Math.max(1, Math.min(604, p)); page = p; S.lastPage = p; save();
    const el = $('#mPage');
    if (dir){ el.style.transition = 'transform .22s ease-in, opacity .22s'; el.style.transform = `translateX(${dir > 0 ? 40 : -40}%)`; el.style.opacity = '0'; await new Promise(r => setTimeout(r, 200)); }
    updateBar();
    const need = [...new Set(PAGES[p-1].map(l => l[1]))];
    let ok = true;
    if (!need.every(n => fonts.has(n))) el.innerHTML = headHtml(p) + '<div class="m-load">جاري تحميل صفحة المصحف…</div>';
    try { await Promise.race([Promise.all(need.map(ensureFont)), timeout(12000)]); } catch(e){ ok = false; }
    if (p !== page) return;
    el.innerHTML = ok ? glyphPage(p) : textPage(p);
    if (!ok && !draw._warned){ draw._warned = true; toast('بدون نت: نعرض نص الصفحة. وصّل النت لعرض خط المصحف'); }
    if (dir){ el.style.transition = 'none'; el.style.transform = `translateX(${dir > 0 ? -40 : 40}%)`; void el.offsetWidth; el.style.transition = ''; el.style.transform = ''; el.style.opacity = '1'; }
    if (ok) requestAnimationFrame(fit);
    if (selV) markSel();
    // نجهّز خطوط الصفحات المجاورة
    [p+1, p+2, p-1].filter(x => x >= 1 && x <= 604).forEach(x => PAGES[x-1].forEach(l => ensureFont(l[1]).catch(() => {})));
  }
  function updateBar(){
    $('#mSurah').textContent = 'سورة ' + IDX.chapters[surahOfPage(page)-1][0];
    $('#mJuz').textContent = `الجزء ${ar(juzOf(page))} · صفحة ${ar(page)}`;
    $('#mMark').setAttribute('aria-pressed', S.marks.includes(page));
  }
  function markSel(){ document.querySelectorAll('#mPage [data-v]').forEach(x => x.classList.toggle('sel', +x.dataset.v === selV)); }

  async function open(p){
    await load();
    $('#mushaf').hidden = false; selV = null;
    draw(p || S.lastPage || 1);
  }
  function close(){ $('#mushaf').hidden = true; closeSheet(); renderIndex(); }
  window.openMushaf = open;

  $('#mBack').onclick = close;
  $('#mNext').onclick = () => page < 604 && draw(page + 1, 1);
  $('#mPrev').onclick = () => page > 1 && draw(page - 1, -1);
  $('#mMark').onclick = () => {
    const i = S.marks.indexOf(page);
    if (i >= 0) S.marks.splice(i, 1); else S.marks.unshift(page);
    save(); updateBar(); toast(i >= 0 ? 'شلت العلامة' : 'حفظت علامة على صفحة ' + ar(page));
  };
  window.addEventListener('resize', () => { if (!$('#mushaf').hidden) fit(); });

  // التقليب بالسحب: في المصحف العربي الصفحة التالية على اليسار، فالسحب لليمين يقلب للأمام
  let sx = 0, sy = 0, st = 0;
  const stage = $('#mStage');
  stage.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, {passive:true});
  stage.addEventListener('touchend', e => {
    const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - st < 800){
      if (dx > 0 && page < 604) draw(page + 1, 1); else if (dx < 0 && page > 1) draw(page - 1, -1);
    }
  }, {passive:true});
  document.addEventListener('keydown', e => { if ($('#mushaf').hidden) return; if (e.key === 'ArrowLeft') $('#mNext').click(); if (e.key === 'ArrowRight') $('#mPrev').click(); });

  /* ---------- التفسير ---------- */
  $('#mPage').addEventListener('click', e => { const sp = e.target.closest('[data-v]'); if (sp && +sp.dataset.v) openSheet(+sp.dataset.v); });
  async function loadTafsir(){ if (!TAF) TAF = await fetch('tafsir.json').then(r => r.json()); return TAF; }
  const onlineCache = new Map();
  async function tafsirText(kind, s, a){
    if (kind === 'muyassar'){ await loadTafsir(); return TAF[s-1][a-1]; }
    const key = kind + s + ':' + a; if (onlineCache.has(key)) return onlineCache.get(key);
    const r = await fetch(TAFSIR_ONLINE[kind] + s + '/' + a + '.json');
    if (!r.ok) throw new Error('http');
    const j = await r.json(); const t = (j.text || '').trim() || 'تفسير هذه الآية مدمج مع الآيات اللي قبلها. ارجع للآية السابقة.';
    onlineCache.set(key, t); return t;
  }
  async function openSheet(v){
    selV = v; markSel();
    const [s, a] = sa(v);
    $('#tRef').textContent = `سورة ${IDX.chapters[s-1][0]} · الآية ${ar(a)}`;
    $('#tAyah').textContent = QURAN[s-1][2][a-1];
    document.querySelectorAll('#tTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === S.tafsir));
    $('#sheet').hidden = false;
    const body = $('#tBody'); body.textContent = 'جاري التحميل…';
    try { const t = await tafsirText(S.tafsir, s, a); if (selV === v) body.textContent = t; }
    catch(e){ if (selV === v) body.textContent = 'هذا التفسير يحتاج نت. التفسير الميسّر يشتغل بدون نت.'; }
  }
  function closeSheet(){ $('#sheet').hidden = true; selV = null; markSel(); }
  $('#sheetBack').onclick = closeSheet; $('#tClose').onclick = closeSheet;
  $('#tTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b && selV){ S.tafsir = b.dataset.k; save(); openSheet(selV); } });
  function step(d){
    const v = Math.max(1, Math.min(IDX.cum[114], selV + d));
    const p = v2page[v]; if (p !== page) draw(p, p > page ? 1 : -1).then(() => openSheet(v)); else openSheet(v);
  }
  $('#tNext').onclick = () => step(1); $('#tPrev').onclick = () => step(-1);

  /* ---------- الفهرس ---------- */
  function renderIndex(){
    if (!IDX) return;
    const r = $('#resume'); const lp = S.lastPage || 1;
    r.innerHTML = `<span><b>${lp > 1 ? 'تابع القراءة' : 'ابدأ القراءة'}</b><small>سورة ${IDX.chapters[surahOfPage(lp)-1][0]} · صفحة ${ar(lp)} · الجزء ${ar(juzOf(lp))}</small></span><span aria-hidden="true">‹</span>`;
    document.querySelectorAll('#qTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === qTab));
    const q = $('#surahSearch').value.trim().replace(/[أإآ]/g,'ا');
    const norm = t => t.replace(/[أإآ]/g,'ا');
    let html = '';
    if (qTab === 'surahs'){
      html = IDX.chapters.map((c,i) => ({c, i})).filter(({c,i}) => !q || norm(c[0]).includes(q) || String(i+1) === q || ar(i+1) === q)
        .map(({c,i}) => `<li><button data-p="${c[1]}"><span class="ix-no">${ar(i+1)}</span><span class="ix-name">${c[0]}<span class="ix-sub">${c[3]==='m'?'مكية':'مدنية'} · ${ar(c[2])} آية</span></span><span class="ix-meta">ص ${ar(c[1])}</span></button></li>`).join('');
      if (/^\d+$/.test(q) && +q >= 1 && +q <= 604) html = `<li><button data-p="${+q}"><span class="ix-no">ص</span><span class="ix-name">صفحة ${ar(+q)}<span class="ix-sub">افتح الصفحة مباشرة</span></span><span class="ix-meta"></span></button></li>` + html;
    } else if (qTab === 'juz'){
      html = JUZ.map((p,i) => `<li><button data-p="${p}"><span class="ix-no">${ar(i+1)}</span><span class="ix-name">الجزء ${ar(i+1)}<span class="ix-sub">يبدأ من سورة ${IDX.chapters[surahOfPage(p)-1][0]}</span></span><span class="ix-meta">ص ${ar(p)}</span></button></li>`).join('');
    } else {
      html = S.marks.length ? S.marks.map(p => `<li><button data-p="${p}"><span class="ix-no">◆</span><span class="ix-name">صفحة ${ar(p)}<span class="ix-sub">سورة ${IDX.chapters[surahOfPage(p)-1][0]} · الجزء ${ar(juzOf(p))}</span></span><span class="ix-meta"></span></button></li>`).join('')
        : '<li style="padding:18px;color:var(--muted)">ما عندك علامات. افتح المصحف واضغط زر العلامة فوق لحفظ الصفحة.</li>';
    }
    $('#qIndex').innerHTML = html;
    $('#surahSearch').hidden = qTab !== 'surahs';
  }
  window.initQuranIndex = () => load().then(renderIndex);
  $('#qTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ qTab = b.dataset.t; renderIndex(); } });
  $('#surahSearch').addEventListener('input', renderIndex);
  $('#qIndex').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) open(+b.dataset.p); });
  $('#resume').onclick = () => open(S.lastPage || 1);

  /* زر الرجوع في الأندرويد */
  window.onBack = () => {
    if (!$('#sheet').hidden){ closeSheet(); return true; }
    if (!$('#mushaf').hidden){ close(); return true; }
    if (!$('#qrGen').hidden){ $('#qrDone').click(); return true; }
    if (!$('#scanner').hidden){ $('#scanClose').click(); return true; }
    if (document.querySelector('#v-home').hidden){ show('home'); return true; }
    return false;
  };
})();
