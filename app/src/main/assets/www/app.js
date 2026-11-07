'use strict';
/* ========== أساسيات ========== */
const $ = s => document.querySelector(s);
const N = window.Android || null;          // جسر الأندرويد
const RING_MODE = new URLSearchParams(location.search).get('mode') === 'ring';
const PRAYERS = [
  {k:'fajr', n:'الفجر'}, {k:'sunrise', n:'الشروق', noAdhan:true}, {k:'dhuhr', n:'الظهر'},
  {k:'asr', n:'العصر'}, {k:'maghrib', n:'المغرب'}, {k:'isha', n:'العشاء'}
];
const PNAME = Object.fromEntries(PRAYERS.map(p => [p.k, p.n]));

const CITIES = [
  ['الرياض',24.7136,46.6753,'Asia/Riyadh','UmmAlQura'],['مكة المكرمة',21.3891,39.8579,'Asia/Riyadh','UmmAlQura'],
  ['المدينة المنورة',24.5247,39.5692,'Asia/Riyadh','UmmAlQura'],['جدة',21.4858,39.1925,'Asia/Riyadh','UmmAlQura'],
  ['الدمام',26.4207,50.0888,'Asia/Riyadh','UmmAlQura'],['الخبر',26.2172,50.1971,'Asia/Riyadh','UmmAlQura'],
  ['الظهران',26.2361,50.0393,'Asia/Riyadh','UmmAlQura'],['الأحساء',25.3800,49.5860,'Asia/Riyadh','UmmAlQura'],
  ['الجبيل',27.0046,49.6460,'Asia/Riyadh','UmmAlQura'],['القطيف',26.5196,50.0115,'Asia/Riyadh','UmmAlQura'],
  ['حفر الباطن',28.4328,45.9708,'Asia/Riyadh','UmmAlQura'],['الطائف',21.2703,40.4158,'Asia/Riyadh','UmmAlQura'],
  ['ينبع',24.0890,38.0637,'Asia/Riyadh','UmmAlQura'],['رابغ',22.7986,39.0349,'Asia/Riyadh','UmmAlQura'],
  ['بريدة',26.3592,43.9818,'Asia/Riyadh','UmmAlQura'],['عنيزة',26.0840,43.9940,'Asia/Riyadh','UmmAlQura'],
  ['الرس',25.8694,43.4973,'Asia/Riyadh','UmmAlQura'],['حائل',27.5114,41.7208,'Asia/Riyadh','UmmAlQura'],
  ['تبوك',28.3835,36.5662,'Asia/Riyadh','UmmAlQura'],['الجوف - سكاكا',29.9697,40.2064,'Asia/Riyadh','UmmAlQura'],
  ['عرعر',30.9753,41.0381,'Asia/Riyadh','UmmAlQura'],['القريات',31.3317,37.3428,'Asia/Riyadh','UmmAlQura'],
  ['أبها',18.2465,42.5117,'Asia/Riyadh','UmmAlQura'],['خميس مشيط',18.3000,42.7333,'Asia/Riyadh','UmmAlQura'],
  ['الباحة',20.0129,41.4677,'Asia/Riyadh','UmmAlQura'],['جازان',16.8892,42.5511,'Asia/Riyadh','UmmAlQura'],
  ['نجران',17.5656,44.2289,'Asia/Riyadh','UmmAlQura'],['بيشة',19.9846,42.6051,'Asia/Riyadh','UmmAlQura'],
  ['المجمعة',25.9039,45.3456,'Asia/Riyadh','UmmAlQura'],['الخرج',24.1556,47.3346,'Asia/Riyadh','UmmAlQura'],
  ['وادي الدواسر',20.4607,44.7795,'Asia/Riyadh','UmmAlQura'],['الكويت',29.3759,47.9774,'Asia/Kuwait','Kuwait'],
  ['الدوحة',25.2854,51.5310,'Asia/Qatar','Qatar'],['دبي',25.2048,55.2708,'Asia/Dubai','Dubai'],
  ['أبوظبي',24.4539,54.3773,'Asia/Dubai','Dubai'],['المنامة',26.2285,50.5860,'Asia/Bahrain','UmmAlQura'],
  ['مسقط',23.5880,58.3829,'Asia/Muscat','MuslimWorldLeague'],['عمّان',31.9454,35.9284,'Asia/Amman','MuslimWorldLeague'],
  ['القاهرة',30.0444,31.2357,'Africa/Cairo','Egyptian'],['صنعاء',15.3694,44.1910,'Asia/Aden','MuslimWorldLeague']
];
const METHODS = [
  ['auto','تلقائي حسب البلد'],['UmmAlQura','أم القرى (السعودية)'],['MuslimWorldLeague','رابطة العالم الإسلامي'],
  ['Egyptian','الهيئة المصرية'],['Kuwait','الكويت'],['Qatar','قطر'],['Dubai','الإمارات'],['Karachi','كراتشي'],['Turkey','تركيا']
];
const AUDIO_BASE = 'https://raw.githubusercontent.com/meypod/audio_files/main/adhan/';
const SOUND_SLOTS = [
  {id:'nabawi',   n:'أذان المسجد النبوي',  d:'تحميل من النت', url:AUDIO_BASE+'masjid_an_nabawi.mp3'},
  {id:'mulla',    n:'علي أحمد ملا',        d:'مؤذن المسجد الحرام'},
  {id:'bukhari',  n:'عصام بخاري',          d:'مؤذن المسجد النبوي'},
  {id:'qatami',   n:'ناصر القطامي',        d:'أذان'},
  {id:'afasy',    n:'مشاري العفاسي',       d:'أذان'},
  {id:'abdulbasit',n:'عبدالباسط عبدالصمد', d:'تحميل من النت', url:AUDIO_BASE+'abdul_basit_abdus_samad.mp3'},
  {id:'ghalwash', n:'راغب مصطفى غلوش',     d:'تحميل من النت', url:AUDIO_BASE+'ragheb_mustafa_ghalwash.mp3'},
  {id:'refaat',   n:'محمد رفعت',           d:'أذان'},
  {id:'fajr_adhan',n:'أذان فجر خاص',       d:'أذان فيه «الصلاة خير من النوم»'},
  {id:'custom1',  n:'صوت إضافي ١',         d:'أذان أو نغمة تختارها'},
  {id:'tone1',    n:'نغمة منبه ١',          d:'صوت قوي للمنبه'},
  {id:'tone2',    n:'نغمة منبه ٢',          d:'صوت قوي للمنبه'}
];

const DEF = {
  loc:{type:'city', i:0}, method:'auto', madhab:'Shafi',
  fajrOn:true, offset:0, barcode:null, emerg:2,
  fajrAdhanFirst:true, fajrSound:'', alarmSound:'', adhanSound:'',
  adhan:{fajr:false, dhuhr:true, asr:true, maghrib:true, isha:true},
  fontQ:26, lastSurah:null
};
function loadS(){ try{ const v = JSON.parse(localStorage.getItem('fajr.settings') || 'null'); return v ? Object.assign({}, DEF, v, {adhan:Object.assign({}, DEF.adhan, v.adhan||{})}) : structuredClone(DEF); }catch(e){ return structuredClone(DEF); } }
let S = loadS();
function save(){ try{ localStorage.setItem('fajr.settings', JSON.stringify(S)); }catch(e){} }

const ar = n => Number(n).toLocaleString('ar-SA');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600); }

/* ========== الموقع والمواقيت ========== */
function getLoc(){
  if (S.loc.type === 'gps' && typeof S.loc.lat === 'number'){
    return {lat:S.loc.lat, lng:S.loc.lng, tz:Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh', label:S.loc.label || 'موقعي الحالي', method:S.loc.method || 'UmmAlQura'};
  }
  const c = CITIES[S.loc.i] || CITIES[0];
  return {lat:c[1], lng:c[2], tz:c[3], label:c[0], method:c[4]};
}
function params(){
  const L = getLoc();
  const m = S.method === 'auto' ? L.method : S.method;
  const p = (adhan.CalculationMethod[m] || adhan.CalculationMethod.UmmAlQura)();
  p.madhab = S.madhab === 'Hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  return p;
}
function ymd(date, tz){
  const o = {}; new Intl.DateTimeFormat('en-CA', {timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(date).forEach(p => o[p.type] = p.value);
  return {y:+o.year, m:+o.month, d:+o.day};
}
const _cache = new Map();
function timesFor(offset){
  const L = getLoc(); const t = ymd(new Date(), L.tz);
  const d = new Date(t.y, t.m - 1, t.d + offset);
  const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}|${L.lat},${L.lng}|${S.method}|${S.madhab}`;
  if (_cache.has(key)) return _cache.get(key);
  const pt = new adhan.PrayerTimes(new adhan.Coordinates(L.lat, L.lng), d, params());
  const r = {day:`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`, fajr:pt.fajr, sunrise:pt.sunrise, dhuhr:pt.dhuhr, asr:pt.asr, maghrib:pt.maghrib, isha:pt.isha};
  if (_cache.size > 200) _cache.clear();
  _cache.set(key, r); return r;
}
function fmt(d, opts){ const L = getLoc(); return new Intl.DateTimeFormat('ar-SA-u-nu-latn', Object.assign({timeZone:L.tz, hour:'numeric', minute:'2-digit', hour12:true}, opts||{})).format(d); }
function nextPrayer(now){
  const t0 = timesFor(0);
  for (const p of PRAYERS){ if (p.k !== 'sunrise' && t0[p.k] > now) return {k:p.k, at:t0[p.k]}; }
  return {k:'fajr', at:timesFor(1).fajr};
}
function nextAlarmAt(now){
  for (let i = 0; i < 3; i++){ const a = new Date(timesFor(i).fajr.getTime() + S.offset*60000); if (a > now) return a; }
  return null;
}
function dayWord(d){
  const L = getLoc(); const a = ymd(d, L.tz), b = ymd(new Date(), L.tz);
  const diff = Math.round((Date.UTC(a.y,a.m-1,a.d) - Date.UTC(b.y,b.m-1,b.d)) / 864e5);
  return diff === 0 ? 'اليوم' : diff === 1 ? 'بكرة' : '';
}

/* ========== الرئيسية ========== */
const BELL = '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
function renderHome(){
  const now = new Date(); const L = getLoc(); const t = timesFor(0); const np = nextPrayer(now);
  $('#placeLabel').textContent = L.label;
  try { $('#hijri').textContent = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {weekday:'long', day:'numeric', month:'long', year:'numeric'}).format(now); } catch(e){ $('#hijri').textContent = ''; }
  $('#nextName').textContent = PNAME[np.k];
  $('#nextAt').textContent = `الأذان ${dayWord(np.at)} الساعة ${fmt(np.at)}`;
  $('#prayerList').innerHTML = PRAYERS.map(p => {
    const at = t[p.k]; const past = at <= now; const isNext = (np.k === p.k && at.getTime() === np.at.getTime());
    const on = !!S.adhan[p.k];
    return `<li class="${isNext ? 'is-next' : past ? 'is-past' : ''}"><span class="pn">${p.n}</span><span class="time">${fmt(at)}</span>
      <button class="bell" data-p="${p.k}" aria-pressed="${on}" aria-label="أذان ${p.n}" ${p.noAdhan ? 'disabled' : ''}>${BELL}</button></li>`;
  }).join('');
  // خط اليوم
  const mins = d => { const o = {}; new Intl.DateTimeFormat('en-GB',{timeZone:L.tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).forEach(p => o[p.type]=p.value); return (+o.hour)*60 + (+o.minute); };
  $('#dayline').innerHTML = PRAYERS.map(p => `<span class="tick ${np.k===p.k?'next':''}" style="left:${(mins(t[p.k])/1440*100).toFixed(2)}%"></span>`).join('')
    + `<span class="now" style="left:${(mins(now)/1440*100).toFixed(2)}%"></span>`;
  // القبلة
  const q = adhan.Qibla(new adhan.Coordinates(L.lat, L.lng));
  $('#qiblaDeg').textContent = Math.round(q);
  $('#qiblaNeedle').setAttribute('transform', `rotate(${q} 32 32)`);
  renderAlarmTile();
}
function renderAlarmTile(){
  const a = nextAlarmAt(new Date());
  $('#alarmAtTile').textContent = S.fajrOn && a ? fmt(a) : 'متوقف';
  $('#alarmStateTile').textContent = !S.fajrOn ? 'فعّله من تبويب المنبه' : S.barcode ? 'يوقف بالباركود' : 'سجّل باركود للإيقاف';
}
function tick(){
  const now = new Date();
  $('#clock').textContent = fmt(now);
  const np = nextPrayer(now); let s = Math.max(0, Math.floor((np.at - now)/1000));
  const h = Math.floor(s/3600), m = Math.floor(s%3600/60), sec = s%60;
  $('#nextCount').textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  if (tick._min !== now.getMinutes()){ tick._min = now.getMinutes(); renderHome(); }
  if (RING_MODE || ringing) $('#ringTime').textContent = fmt(now);
  webTimers(now);
}
$('#prayerList').addEventListener('click', e => {
  const b = e.target.closest('.bell'); if (!b) return;
  const k = b.dataset.p; S.adhan[k] = !S.adhan[k]; save(); renderHome(); sync();
  toast(S.adhan[k] ? `بيأذّن لصلاة ${PNAME[k]}` : `أوقفت أذان ${PNAME[k]}`);
});

/* ========== التبويبات ========== */
function show(v){
  document.querySelectorAll('.view').forEach(x => x.hidden = x.id !== 'v-' + v);
  document.querySelectorAll('.tabs button').forEach(b => { if (b.dataset.v === v) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  if (v === 'alarm') renderPerms();
  window.scrollTo(0,0);
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.v); });

/* ========== المزامنة مع الأندرويد ========== */
function buildEvents(){
  const ev = []; const now = Date.now();
  for (let i = 0; i < 45; i++){
    const t = timesFor(i);
    if (S.fajrOn) ev.push({type:'alarm', prayer:'fajr', at:t.fajr.getTime() + S.offset*60000});
    for (const p of ['fajr','dhuhr','asr','maghrib','isha']){
      if (p === 'fajr' && S.fajrOn) continue;
      if (S.adhan[p]) ev.push({type:'adhan', prayer:p, at:t[p].getTime()});
    }
  }
  return ev.filter(e => e.at > now).sort((a,b) => a.at - b.at);
}
function sync(){
  renderAlarmLine();
  if (!N) return;
  try{
    N.saveSchedule(JSON.stringify(buildEvents()), JSON.stringify({
      fajrAdhanFirst:S.fajrAdhanFirst, fajrSound:S.fajrSound || S.adhanSound, alarmSound:S.alarmSound, adhanSound:S.adhanSound,
      names:Object.fromEntries(PRAYERS.map(p => [p.k, p.n]))
    }));
  }catch(e){ console.warn(e); }
}

/* ========== المنبه ========== */
function renderAlarmLine(){
  const a = nextAlarmAt(new Date());
  $('#alarmNextLine').textContent = S.fajrOn && a ? `يرن ${dayWord(a)} الساعة ${fmt(a)}` : 'المنبه متوقف';
  renderAlarmTile();
}
function renderBarcode(){
  const box = $('#barcodeBox');
  const ico = '<svg viewBox="0 0 44 30" aria-hidden="true"><g fill="currentColor"><rect x="1" y="2" width="2" height="26"/><rect x="5" y="2" width="1" height="26"/><rect x="8" y="2" width="3" height="26"/><rect x="13" y="2" width="1" height="26"/><rect x="16" y="2" width="2" height="26"/><rect x="21" y="2" width="1" height="26"/><rect x="24" y="2" width="3" height="26"/><rect x="29" y="2" width="1" height="26"/><rect x="32" y="2" width="2" height="26"/><rect x="36" y="2" width="1" height="26"/><rect x="39" y="2" width="3" height="26"/></g></svg>';
  if (S.barcode){
    box.className = 'barcode-box set';
    box.innerHTML = `${ico}<div><b>باركود مسجّل</b><small>ينتهي بـ ${esc(S.barcode.slice(-4))} · ${S.barcode.length} خانة</small></div>`;
    $('#regBarcode').textContent = 'تغيير الباركود';
  } else {
    box.className = 'barcode-box';
    box.innerHTML = `${ico}<div><b>ما فيه باركود مسجّل</b><small>بدونه ما يوقف المنبه إلا زر الطوارئ</small></div>`;
    $('#regBarcode').textContent = 'تسجيل باركود';
  }
  $('#testBarcode').disabled = !S.barcode;
}
function soundOptions(sel, defLabel){
  const have = N ? JSON.parse(N.listSounds() || '{}') : {};
  const opts = [`<option value="">${defLabel}</option>`].concat(
    SOUND_SLOTS.filter(s => have[s.id]).map(s => `<option value="${s.id}">${esc(s.n)}</option>`));
  sel.innerHTML = opts.join('');
  sel.value = have[S[sel.id]] ? S[sel.id] : '';
}
function renderSoundSelects(){
  soundOptions($('#fajrSound'), 'نفس صوت الأذان');
  soundOptions($('#alarmSound'), 'نغمة المنبه الأساسية في الجوال');
  soundOptions($('#adhanSound'), 'نغمة الإشعار في الجوال');
}
function initAlarmTab(){
  const off = $('#offset');
  off.innerHTML = [-30,-20,-15,-10,-5,0,5,10,15,20,30].map(m =>
    `<option value="${m}">${m === 0 ? 'مع الأذان' : m < 0 ? `قبل الأذان بـ ${ar(-m)} دقيقة` : `بعد الأذان بـ ${ar(m)} دقيقة`}</option>`).join('');
  off.value = S.offset;
  $('#fajrOn').checked = S.fajrOn;
  $('#fajrAdhanFirst').checked = S.fajrAdhanFirst;
  $('#emerg').value = S.emerg;
  off.onchange = () => { S.offset = +off.value; save(); sync(); };
  $('#fajrOn').onchange = e => { S.fajrOn = e.target.checked; save(); sync(); };
  $('#fajrAdhanFirst').onchange = e => { S.fajrAdhanFirst = e.target.checked; save(); sync(); };
  const setEm = v => { S.emerg = Math.max(1, Math.min(30, Math.round(+v || 1))); $('#emerg').value = S.emerg; save(); };
  $('#emerg').onchange = e => setEm(e.target.value);
  $('#emergMinus').onclick = () => setEm(S.emerg - 1);
  $('#emergPlus').onclick = () => setEm(S.emerg + 1);
  ['fajrSound','alarmSound','adhanSound'].forEach(id => $('#'+id).onchange = e => { S[id] = e.target.value; save(); sync(); });
  $('#regBarcode').onclick = () => openScanner('register');
  $('#testBarcode').onclick = () => openScanner('test');
  $('#testAlarm').onclick = () => { if (N) N.testAlarm(); else startRing(true); };
  renderBarcode(); renderSoundSelects(); renderAlarmLine();
}
function renderPerms(){
  const ul = $('#perms');
  if (!N){ ul.innerHTML = '<li><span>المنبه الكامل يشتغل في تطبيق الأندرويد. هنا يرن فقط والصفحة مفتوحة.</span></li>'; return; }
  let p = {}; try { p = JSON.parse(N.permStatus()); } catch(e){}
  const rows = [
    ['notif','الإشعارات','لإظهار المنبه والأذان'],
    ['exact','المنبهات الدقيقة','عشان يرن بالدقيقة'],
    ['full','الظهور فوق شاشة القفل','عشان تطلع شاشة المنبه والجوال مقفل'],
    ['battery','استثناء من توفير البطارية','عشان ما يوقفه النظام بالليل'],
    ['camera','الكاميرا','لمسح الباركود']
  ];
  ul.innerHTML = rows.map(([k,n,d]) => `<li><span><b>${n}</b><br><small>${d}</small></span>${p[k]
    ? '<span class="pill ok">مفعّل</span>' : `<button class="btn" data-perm="${k}">تفعيل</button>`}</li>`).join('');
}
$('#perms').addEventListener('click', e => { const b = e.target.closest('[data-perm]'); if (b && N) N.fixPerm(b.dataset.perm); });
window.onPermsChanged = () => { renderPerms(); };

/* ========== الماسح ========== */
let qr = null, scanMode = null, scanBusy = false;
async function openScanner(mode){
  scanMode = mode; scanBusy = false;
  $('#scanner').hidden = false; $('#scanMsg').textContent = '';
  $('#scanTitle').textContent = mode === 'register' ? 'امسح باركود المنتج اللي بتستخدمه للإيقاف' : 'امسح الباركود المسجّل';
  if (typeof Html5Qrcode === 'undefined'){ $('#scanMsg').textContent = 'الماسح غير متاح، استخدم التصوير.'; return; }
  try{
    qr = new Html5Qrcode('qrReader', {verbose:false});
    await qr.start({facingMode:'environment'}, {fps:12, qrbox:(w,h) => ({width:Math.floor(Math.min(w*0.85, 320)), height:Math.floor(Math.min(h*0.5, 170))}), aspectRatio:1.333}, onCode, () => {});
  }catch(e){
    $('#scanMsg').textContent = 'ما قدرت أفتح الكاميرا. فعّل صلاحية الكاميرا أو استخدم التصوير.';
    if (N) try{ N.fixPerm('camera'); }catch(_){}
  }
}
async function closeScanner(){
  if (qr){ try{ if (qr.isScanning) await qr.stop(); }catch(e){} try{ qr.clear(); }catch(e){} qr = null; }
  $('#scanner').hidden = true;
}
async function onCode(text){
  if (scanBusy) return; text = String(text).trim(); if (!text) return;
  if (scanMode === 'register'){
    scanBusy = true; S.barcode = text; save(); await closeScanner(); renderBarcode(); renderAlarmTile();
    toast('تم تسجيل الباركود. حط المنتج بعيد عن سريرك');
  } else if (scanMode === 'test'){
    scanBusy = true; await closeScanner();
    toast(text === S.barcode ? 'تمام، هذا هو الباركود المسجّل' : 'هذا باركود مختلف عن المسجّل');
  } else if (scanMode === 'stop'){
    if (text === S.barcode){ scanBusy = true; await closeScanner(); stopRing(); }
    else { $('#scanMsg').textContent = 'هذا مو الباركود المسجّل. روح للمنتج الصحيح'; if (navigator.vibrate) navigator.vibrate(200); }
  }
}
$('#scanClose').onclick = closeScanner;
$('#scanPhoto').onchange = async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  try{
    if (qr && qr.isScanning) await qr.stop();
    if (!qr) qr = new Html5Qrcode('qrReader', {verbose:false});
    const text = await qr.scanFile(f, false); onCode(text);
  }catch(err){ $('#scanMsg').textContent = 'ما قدرت أقرأ الباركود من الصورة. قرّب الكاميرا وخلّ الإضاءة أوضح.'; }
};

/* ========== شاشة المنبه ========== */
let ringing = false, holdTimer = null, holdStart = 0;
let webTone = null;
function startRing(test){
  ringing = true;
  document.getElementById('app').hidden = !!RING_MODE;
  $('#ring').hidden = false; $('#ringMain').hidden = false; $('#ringDone').hidden = true;
  $('#ringScan').hidden = !S.barcode;
  $('#holdHint').textContent = `اضغط مطوّلاً ${ar(S.emerg)} ${S.emerg === 1 ? 'دقيقة' : S.emerg === 2 ? 'دقيقتين' : 'دقائق'} بدون ما ترفع إصبعك`;
  $('#ringTime').textContent = fmt(new Date());
  if (!N) startWebTone();
}
function stopRing(){
  ringing = false; resetHold();
  if (N) { try{ N.stopAlarm(); }catch(e){} } else stopWebTone();
  $('#ringMain').hidden = true; $('#ringDone').hidden = false;
}
$('#ringScan').onclick = () => openScanner('stop');
$('#ringClose').onclick = () => { $('#ring').hidden = true; if (RING_MODE && N) N.finishScreen(); else document.getElementById('app').hidden = false; };
$('#goMorning').onclick = () => { $('#ring').hidden = true; document.getElementById('app').hidden = false; show('azkar'); selectAzkar('morning'); initQuran(); };

function resetHold(){
  clearInterval(holdTimer); holdTimer = null;
  $('#holdFill').style.transform = 'scaleX(0)'; $('#holdTxt').textContent = 'زر الطوارئ';
}
const hold = $('#holdBtn');
hold.addEventListener('pointerdown', e => {
  e.preventDefault(); try{ hold.setPointerCapture(e.pointerId); }catch(_){}
  holdStart = Date.now(); const total = S.emerg * 60000;
  clearInterval(holdTimer);
  holdTimer = setInterval(() => {
    const el = Date.now() - holdStart; const left = Math.max(0, total - el);
    $('#holdFill').style.transform = `scaleX(${Math.min(1, el/total)})`;
    const s = Math.ceil(left/1000);
    $('#holdTxt').textContent = `استمر بالضغط… ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    if (el >= total){ clearInterval(holdTimer); holdTimer = null; stopRing(); }
  }, 200);
});
['pointerup','pointercancel','lostpointercapture'].forEach(ev => hold.addEventListener(ev, () => { if (holdTimer) { resetHold(); $('#holdHint').textContent = 'رفعت إصبعك، بدأ العد من جديد'; } }));
hold.addEventListener('contextmenu', e => e.preventDefault());

/* صوت بديل خارج تطبيق الأندرويد */
function startWebTone(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)(); let vol = 0.2;
    const burst = () => { const t = ctx.currentTime; [0,.18,.36].forEach((d,i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = [880,988,1175][i]; g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(vol,t+d+.02); g.gain.linearRampToValueAtTime(0,t+d+.15); o.connect(g).connect(ctx.destination); o.start(t+d); o.stop(t+d+.16); }); vol = Math.min(vol+.03,.8); };
    burst(); webTone = {ctx, iv:setInterval(burst, 1000)};
  }catch(e){}
}
function stopWebTone(){ if (webTone){ clearInterval(webTone.iv); try{ webTone.ctx.close(); }catch(e){} webTone = null; } }
const _loadedAt = Date.now(); let _webFired = '';
function webTimers(now){
  if (N || ringing || !S.fajrOn) return;
  const t = timesFor(0); const a = t.fajr.getTime() + S.offset*60000;
  if (now >= a && now - a < 15*60000 && _loadedAt < a && _webFired !== t.day){ _webFired = t.day; startRing(false); }
}

/* ========== الأذكار ========== */
let QURAN = null;
async function loadQuran(){ if (QURAN) return QURAN; const r = await fetch('quran.json'); QURAN = await r.json(); return QURAN; }
function qText(ref, basm){
  if (!QURAN) return '…';
  const [s,a,b] = ref; const v = QURAN[s-1][2].slice(a-1, b);
  return (basm ? 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ' : '') + v.map((t,i) => `${t} <span class="ayah-n">${ar(a+i)}</span>`).join(' ');
}
let zkCat = 'morning', zkLeft = {};
function renderChips(){
  $('#azkarChips').innerHTML = AZKAR.map(c => `<button class="chip" role="tab" data-c="${c.id}" aria-selected="${c.id===zkCat}">${c.name}</button>`).join('');
}
function selectAzkar(id){ zkCat = id; zkLeft = {}; renderChips(); renderAzkar(); }
$('#azkarChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) selectAzkar(b.dataset.c); });
async function renderAzkar(){
  const cat = AZKAR.find(c => c.id === zkCat); const body = $('#azkarBody');
  if (cat.tasbih) return renderTasbih(body);
  if (cat.items.some(z => z.q)) await loadQuran();
  cat.items.forEach((z,i) => { if (zkLeft[i] == null) zkLeft[i] = z.c; });
  const done = cat.items.filter((z,i) => zkLeft[i] === 0).length;
  body.innerHTML = `<div class="zk-top"><span class="zk-progress">أنهيت ${ar(done)} من ${ar(cat.items.length)} · اضغط على الذكر للعدّ</span><button class="btn" id="zkReset">إعادة</button></div>
  <div class="zk-list">${cat.items.map((z,i) => `<button class="zk ${zkLeft[i]===0?'done':''}" data-i="${i}">
    <p class="zk-t ${z.q?'q':''}">${z.q ? qText(z.q, z.b) : esc(z.t)}</p>
    <div class="zk-f"><span class="zk-n">${z.n ? esc(z.n) : z.c > 1 ? `يُقال ${ar(z.c)} مرات` : 'مرة واحدة'}</span><span class="zk-c">${zkLeft[i]===0 ? '✓' : ar(zkLeft[i])}</span></div>
  </button>`).join('')}</div>`;
}
$('#azkarBody').addEventListener('click', e => {
  if (e.target.id === 'zkReset'){ zkLeft = {}; renderAzkar(); return; }
  const z = e.target.closest('.zk'); if (!z) return; const i = +z.dataset.i;
  if (zkLeft[i] > 0){ zkLeft[i]--; if (navigator.vibrate) navigator.vibrate(zkLeft[i] === 0 ? 60 : 12);
    const c = z.querySelector('.zk-c'); c.textContent = zkLeft[i] === 0 ? '✓' : ar(zkLeft[i]);
    if (zkLeft[i] === 0){ z.classList.add('done'); const cat = AZKAR.find(c => c.id === zkCat); const done = cat.items.filter((_,j) => zkLeft[j] === 0).length; $('.zk-progress').textContent = `أنهيت ${ar(done)} من ${ar(cat.items.length)} · اضغط على الذكر للعدّ`; }
  }
});
const TASBIH = ['سُبْحَانَ اللَّهِ','الْحَمْدُ لِلَّهِ','اللَّهُ أَكْبَرُ','لَا إِلَهَ إِلَّا اللَّهُ','أَسْتَغْفِرُ اللَّهَ','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ','لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ','اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ'];
let tsb = {i:0, n:0};
function renderTasbih(body){
  body.innerHTML = `<div class="tasbih"><select id="tsbPhrase">${TASBIH.map((t,i) => `<option value="${i}">${t}</option>`).join('')}</select>
    <div class="tasbih-phrase" id="tsbText">${TASBIH[tsb.i]}</div>
    <button class="tasbih-btn" id="tsbBtn" aria-label="سبّح"><b id="tsbN">${ar(tsb.n)}</b></button>
    <button class="btn" id="tsbReset">تصفير</button></div>`;
  $('#tsbPhrase').value = tsb.i;
  $('#tsbPhrase').onchange = e => { tsb = {i:+e.target.value, n:0}; renderTasbih(body); };
  $('#tsbBtn').onclick = () => { tsb.n++; $('#tsbN').textContent = ar(tsb.n); if (navigator.vibrate) navigator.vibrate(tsb.n % 33 === 0 ? 120 : 10); };
  $('#tsbReset').onclick = () => { tsb.n = 0; $('#tsbN').textContent = ar(0); };
}

/* ========== القرآن ========== */
async function initQuran(){
  await loadQuran();
  const list = $('#surahs');
  list.innerHTML = QURAN.map((s,i) => `<li data-q="${i+1} ${s[0]}"><button data-s="${i+1}"><span class="s-no">${ar(i+1)}</span><span class="s-name">${s[0]}</span><span class="s-meta">${s[1]==='m'?'مكية':'مدنية'} · ${ar(s[2].length)} آية</span></button></li>`).join('');
  renderResume();
}
function renderResume(){
  const r = $('#resume');
  if (S.lastSurah && QURAN){ r.hidden = false; r.innerHTML = `<span>تابع القراءة: سورة ${QURAN[S.lastSurah-1][0]}</span><span>←</span>`; } else r.hidden = true;
}
$('#resume').onclick = () => openSurah(S.lastSurah);
$('#surahSearch').oninput = e => {
  const q = e.target.value.trim().replace(/[أإآ]/g,'ا');
  document.querySelectorAll('#surahs li').forEach(li => li.hidden = q && !li.dataset.q.replace(/[أإآ]/g,'ا').includes(q));
};
$('#surahs').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) openSurah(+b.dataset.s); });
let curSurah = 1;
function openSurah(n){
  curSurah = n; S.lastSurah = n; save();
  const s = QURAN[n-1];
  $('#readerTitle').textContent = 'سورة ' + s[0];
  const basm = (n !== 1 && n !== 9) ? '<div class="basmala">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>' : '';
  $('#mushaf').innerHTML = basm + s[2].map((t,i) => `${t} <span class="ayah-n">${ar(i+1)}</span>`).join(' ');
  $('#mushaf').style.fontSize = S.fontQ + 'px';
  $('#nextSurah').hidden = n === 114;
  $('#quranList').hidden = true; $('#reader').hidden = false; window.scrollTo(0,0);
}
$('#readerBack').onclick = () => { $('#reader').hidden = true; $('#quranList').hidden = false; renderResume(); };
$('#fontPlus').onclick = () => { S.fontQ = Math.min(44, S.fontQ + 2); save(); $('#mushaf').style.fontSize = S.fontQ + 'px'; };
$('#fontMinus').onclick = () => { S.fontQ = Math.max(18, S.fontQ - 2); save(); $('#mushaf').style.fontSize = S.fontQ + 'px'; };
$('#nextSurah').onclick = () => openSurah(curSurah + 1);
$('#listenSurah').onclick = () => { const u = 'https://quran.com/' + curSurah; if (N) N.openUrl(u); else window.open(u, '_blank'); };

/* ========== الإعدادات ========== */
function initPrefs(){
  const city = $('#city');
  city.innerHTML = (S.loc.type === 'gps' ? `<option value="gps">${esc(S.loc.label || 'موقعي الحالي')} (GPS)</option>` : '') +
    CITIES.map((c,i) => `<option value="${i}">${c[0]}</option>`).join('');
  city.value = S.loc.type === 'gps' ? 'gps' : String(S.loc.i);
  city.onchange = () => { if (city.value !== 'gps'){ S.loc = {type:'city', i:+city.value}; save(); _cache.clear(); renderHome(); sync(); toast('تم تحديث المواقيت حسب ' + CITIES[+city.value][0]); } };
  const m = $('#method'); m.innerHTML = METHODS.map(([k,n]) => `<option value="${k}">${n}</option>`).join(''); m.value = S.method;
  m.onchange = () => { S.method = m.value; save(); _cache.clear(); renderHome(); sync(); };
  $('#madhab').value = S.madhab;
  $('#madhab').onchange = e => { S.madhab = e.target.value; save(); _cache.clear(); renderHome(); sync(); };
  renderSounds();
}
const SA_BOX = {minLat:16, maxLat:32.2, minLng:34.5, maxLng:55.7};
$('#useGps').onclick = () => {
  $('#gpsMsg').textContent = 'جاري تحديد موقعك…';
  if (N){ N.requestLocation(); return; }
  if (!navigator.geolocation){ $('#gpsMsg').textContent = 'تحديد الموقع غير متاح هنا، اختر مدينتك.'; return; }
  navigator.geolocation.getCurrentPosition(p => window.onNativeLocation({lat:p.coords.latitude, lng:p.coords.longitude, city:''}),
    () => window.onNativeLocation(null), {timeout:15000});
};
window.onNativeLocation = loc => {
  if (!loc){ $('#gpsMsg').textContent = 'ما قدرت أحدد موقعك. شغّل الموقع (GPS) أو اختر مدينتك من القائمة.'; return; }
  const inSA = loc.lat > SA_BOX.minLat && loc.lat < SA_BOX.maxLat && loc.lng > SA_BOX.minLng && loc.lng < SA_BOX.maxLng;
  S.loc = {type:'gps', lat:+loc.lat.toFixed(4), lng:+loc.lng.toFixed(4), label:loc.city || 'موقعي الحالي', method: inSA ? 'UmmAlQura' : 'MuslimWorldLeague'};
  save(); _cache.clear(); initPrefs(); renderHome(); sync();
  $('#gpsMsg').textContent = `تم: ${S.loc.label} (${S.loc.lat}, ${S.loc.lng})`;
};
function renderSounds(){
  const have = N ? JSON.parse(N.listSounds() || '{}') : {};
  $('#sounds').innerHTML = SOUND_SLOTS.map(s => `<li><span class="dot ${have[s.id]?'on':''}"></span>
    <span class="who"><b>${esc(s.n)}</b><small>${have[s.id] ? esc(have[s.id]) : esc(s.d)}</small></span>
    <span class="act">${have[s.id]
      ? `<button class="btn" data-play="${s.id}">تشغيل</button><button class="btn" data-pick="${s.id}">استبدال</button><button class="btn danger" data-del="${s.id}" aria-label="حذف">حذف</button>`
      : (s.url ? `<button class="btn primary" data-dl="${s.id}">${downloading.has(s.id) ? 'جاري التحميل…' : 'تحميل'}</button>` : '')
        + `<button class="btn" data-pick="${s.id}">${s.url ? 'من ملف' : 'إضافة ملف'}</button>`}</span></li>`).join('');
  renderSoundSelects();
}
const downloading = new Set();
function downloadSound(id){
  const slot = SOUND_SLOTS.find(x => x.id === id); if (!slot || !slot.url || !N || downloading.has(id)) return;
  downloading.add(id); renderSounds(); N.downloadSound(id, slot.url, slot.n);
}
window.onSoundFailed = slot => { downloading.delete(slot); renderSounds(); toast('ما قدرت أحمّل الصوت. تأكد من النت وجرّب مرة ثانية'); };
let playing = null;
$('#sounds').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (!N){ toast('إضافة الأصوات متاحة في تطبيق الأندرويد'); return; }
  if (b.dataset.dl) downloadSound(b.dataset.dl);
  else if (b.dataset.pick) N.pickSound(b.dataset.pick);
  else if (b.dataset.del){ N.deleteSound(b.dataset.del); ['fajrSound','alarmSound','adhanSound'].forEach(k => { if (S[k] === b.dataset.del) S[k] = ''; }); save(); renderSounds(); sync(); }
  else if (b.dataset.play){
    if (playing === b.dataset.play){ N.stopPreview(); playing = null; b.textContent = 'تشغيل'; }
    else { N.stopPreview(); document.querySelectorAll('[data-play]').forEach(x => x.textContent = 'تشغيل'); N.previewSound(b.dataset.play); playing = b.dataset.play; b.textContent = 'إيقاف'; }
  }
});
window.onSoundPicked = (slot, name) => {
  downloading.delete(slot); renderSounds();
  if (!S.adhanSound && !slot.startsWith('tone')) { S.adhanSound = slot; }
  if (!S.alarmSound && slot.startsWith('tone')) { S.alarmSound = slot; }
  save(); renderSoundSelects(); sync(); toast('تمت إضافة الصوت: ' + name);
};
window.onPreviewEnded = () => { playing = null; document.querySelectorAll('[data-play]').forEach(x => x.textContent = 'تشغيل'); };

/* ========== تشغيل ========== */
function boot(){
  if (typeof adhan === 'undefined'){ document.body.innerHTML = '<p style="padding:24px">تعذّر تحميل مكتبة المواقيت.</p>'; return; }
  initAlarmTab(); initPrefs(); renderChips(); renderHome(); tick();
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden){ renderHome(); renderPerms(); } });
  if (RING_MODE){ startRing(false); }
  else {
    initQuran(); renderAzkar(); sync();
    // أول تشغيل: نحمّل أذان المسجد النبوي تلقائياً عشان يطلع صوت الأذان مباشرة
    if (N){ let have = {}; try { have = JSON.parse(N.listSounds() || '{}'); } catch(e){}
      if (!have.nabawi && !localStorage.getItem('fajr.autoDl')){ try{ localStorage.setItem('fajr.autoDl','1'); }catch(e){} downloadSound('nabawi'); toast('جاري تحميل صوت الأذان…'); } }
  }
}
boot();
