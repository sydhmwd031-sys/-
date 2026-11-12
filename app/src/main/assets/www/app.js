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
const MEYPOD = 'https://raw.githubusercontent.com/meypod/audio_files/main/adhan/';
const ABODE  = 'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/';
const ab = f => ABODE + encodeURIComponent('Athan ' + f) + '.mp3';
/* كل المؤذنين يتحمّلون من النت مرة وحدة ويشتغلون بعدها بدون نت */
const ADHANS = [
  {id:'nabawi',    n:'المسجد النبوي',            d:'أذان الحرم المدني',   url:MEYPOD+'masjid_an_nabawi.mp3'},
  {id:'makkah',    n:'المسجد الحرام',            d:'أذان الحرم المكي',    url:ab('Makkah')},
  {id:'fajr_malek',n:'أذان الفجر',               d:'مالك شيبة · فيه «الصلاة خير من النوم»', url:ab('Al-fajer - Malek chebae'), fajr:true},
  {id:'afasy',     n:'مشاري العفاسي',            d:'الكويت',              url:ab('Mishary Alafasi')},
  {id:'qatami',    n:'ناصر القطامي',             d:'الرياض',              url:ab('Nasser Alqatami')},
  {id:'zahrani',   n:'منصور الزهراني',           d:'الرياض',              url:ab('Mansoor Az-Zahrani')},
  {id:'malki',     n:'حمدان المالكي',            d:'',                    url:ab('Hamdan Almalki')},
  {id:'deghreri',  n:'حمد الدغريري',             d:'',                    url:ab('Hamad Deghreri')},
  {id:'nufais',    n:'أحمد النفيس',              d:'',                    url:ab('Ahmad Nuyne3')},
  {id:'arkani',    n:'إبراهيم الأركاني',         d:'',                    url:ab('Ibrahim Al-Arkani')},
  {id:'hamathani', n:'ماجد الحمداني',            d:'',                    url:ab('Majed Al-hamathani')},
  {id:'khatba',    n:'صهيب خطبة',                d:'',                    url:ab('Suhaib Khatba')},
  {id:'abdulbasit',n:'عبدالباسط عبدالصمد',       d:'مصر',                 url:MEYPOD+'abdul_basit_abdus_samad.mp3'},
  {id:'minshawi',  n:'محمد صديق المنشاوي',        d:'مصر',                 url:ab('Mohammad Almenshawy')},
  {id:'refaat',    n:'محمد رفعت',                d:'مصر',                 url:ab('Mohammad Ref3at')},
  {id:'ghalwash',  n:'راغب مصطفى غلوش',          d:'مصر',                 url:MEYPOD+'ragheb_mustafa_ghalwash.mp3'}
];
/* نغمات منبه مدمجة في التطبيق */
const TONES = [
  {id:'tone_sunrise', n:'شروق',        d:'نغمة متصاعدة هادئة',  f:'sunrise'},
  {id:'tone_bells',   n:'أجراس',       d:'رنين صافي',            f:'bells'},
  {id:'tone_breeze',  n:'نسيم',        d:'لحن شرقي',             f:'breeze'},
  {id:'tone_birds',   n:'طيور الصباح', d:'عصافير وأجراس',        f:'birds'},
  {id:'tone_pulse',   n:'نبض',         d:'تنبيه رقمي قوي',       f:'pulse'},
  {id:'tone_siren',   n:'إنذار',       d:'الأقوى لثقيلين النوم', f:'siren'}
];
const MINE = [
  {id:'custom1', n:'صوت من جوالك ١'}, {id:'custom2', n:'صوت من جوالك ٢'}, {id:'custom3', n:'صوت من جوالك ٣'}
];
const ALL_SOUNDS = [...ADHANS, ...TONES, ...MINE];
const soundName = id => (ALL_SOUNDS.find(x => x.id === id) || {}).n || id;

const DEF = {
  loc:{type:'city', i:0}, method:'auto', madhab:'Shafi',
  fajrOn:true, offset:0, barcode:null, emerg:2,
  fajrAdhanFirst:true, fajrSound:'', alarmSound:'tone_sunrise', adhanSound:'',
  adhan:{fajr:false, dhuhr:true, asr:true, maghrib:true, isha:true},
  lastPage:1, marks:[], tafsir:'muyassar', theme:'sun'
};
function loadS(){ try{ const v = JSON.parse(localStorage.getItem('fajr.settings') || 'null'); return v ? Object.assign({}, DEF, v, {adhan:Object.assign({}, DEF.adhan, v.adhan||{})}) : structuredClone(DEF); }catch(e){ return structuredClone(DEF); } }
let S = loadS();
if (!S.alarmSound) S.alarmSound = 'tone_sunrise';
if (!Array.isArray(S.marks)) S.marks = [];
function save(){ try{ localStorage.setItem('fajr.settings', JSON.stringify(S)); }catch(e){} }

const ar = n => Number(n).toLocaleString('ar-SA');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const _scripts = {};
function loadScript(src){ return _scripts[src] || (_scripts[src] = new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => { delete _scripts[src]; rej(new Error(src)); }; document.head.appendChild(el); })); }
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
    const mins = Math.max(0, Math.round((at - now) / 60000));
    const left = isNext ? `<span class="left">بعد ${mins >= 60 ? ar(Math.floor(mins/60)) + ' س ' : ''}${ar(mins % 60)} د</span>` : '';
    return `<li class="${isNext ? 'is-next' : past ? 'is-past' : ''}"><span class="pn">${p.n}${left}</span><span class="time">${fmt(at)}</span>
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
  if (tick._min !== now.getMinutes()){ tick._min = now.getMinutes(); renderHome(); applyTheme(); }
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
  if (v === 'azkar' && !azkarReady){ azkarReady = true; renderAzkar(); }
  if (v === 'quran' && window.initQuranIndex) window.initQuranIndex();
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
  const on = S.fajrOn && a;
  $('#alarmHero').classList.toggle('off', !on);
  $('#alarmBig').textContent = a ? fmt(a) : '—';
  $('#alarmDay').textContent = on ? `منبه الفجر · ${dayWord(a) || 'بعد بكرة'}` : 'منبه الفجر متوقف';
  $('#alarmNextLine').textContent = on ? 'يرن حتى لو الجوال مقفل والتطبيق مسكّر' : 'فعّله من المفتاح عشان يرن وقت الفجر';
  renderAlarmTile();
}
function renderBarcode(){
  const box = $('#barcodeBox');
  const ico = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="currentColor"><path d="M4 4h12v12H4zM7 7v6h6V7zM24 4h12v12H24zM27 7v6h6V7zM4 24h12v12H4zM7 27v6h6v-6z"/><path d="M24 24h4v4h-4zM30 24h6v4h-6zM24 30h4v6h-4zM30 30h2v2h-2zM32 32h4v4h-4z"/></g></svg>';
  if (S.barcode){
    const mine = S.barcode.startsWith('FAJR-');
    box.className = 'barcode-box set';
    box.innerHTML = `${ico}<div><b>${mine ? 'باركود الإيقاف جاهز' : 'باركود منتج مسجّل'}</b><small>${mine ? esc(S.barcode) : 'ينتهي بـ ' + esc(S.barcode.slice(-4))}</small></div>`;
  } else {
    box.className = 'barcode-box';
    box.innerHTML = `${ico}<div><b>ما فيه باركود مسجّل</b><small>بدونه ما يوقف المنبه إلا زر الطوارئ</small></div>`;
  }
  $('#testBarcode').disabled = !S.barcode;
}
let _have = null;
function haveSounds(){
  if (_have) return _have;
  try { _have = N ? JSON.parse(N.listSounds() || '{}') : {}; } catch(e){ _have = {}; }
  setTimeout(() => { _have = null; }, 0);   // صالح لنفس الدورة فقط
  return _have;
}
function available(id, have){ return id.startsWith('tone_') || !!have[id]; }
function soundOptions(sel, defLabel, list){
  const have = haveSounds();
  sel.innerHTML = [`<option value="">${defLabel}</option>`].concat(
    list.filter(x => available(x.id, have)).map(x => `<option value="${x.id}">${esc(x.n)}</option>`)).join('');
  sel.value = available(S[sel.id] || '', have) ? S[sel.id] : '';
}
function renderSoundSelects(){
  soundOptions($('#fajrSound'), 'نفس صوت الأذان', [...ADHANS, ...MINE]);
  soundOptions($('#alarmSound'), 'نغمة المنبه في الجوال', [...TONES, ...ADHANS, ...MINE]);
  soundOptions($('#adhanSound'), 'نغمة الإشعار في الجوال', [...ADHANS, ...MINE]);
}
/* ---------- إنشاء باركود إيقاف ---------- */
function newCode(){
  const a = new Uint8Array(6); (crypto.getRandomValues ? crypto.getRandomValues(a) : a.forEach((_,i) => a[i] = Math.random()*256));
  return 'FAJR-' + Array.from(a, x => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 32]).join('');
}
function drawQr(code){
  const q = qrcode(0, 'H'); q.addData(code); q.make();
  const c = $('#qrCanvas'), g = c.getContext('2d'), n = q.getModuleCount();
  const W = c.width, cell = Math.floor((W - 80) / n), off = Math.floor((W - cell*n) / 2);
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, c.height);
  g.fillStyle = '#0d2a2c';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r,k)) g.fillRect(off + k*cell, 40 + r*cell, cell, cell);
  g.textAlign = 'center'; g.fillStyle = '#0d2a2c';
  g.font = '700 38px Messiri, Readex, sans-serif'; g.fillText('امسحني عشان توقف منبه الفجر', W/2, 40 + n*cell + 70);
  g.font = '600 26px Readex, sans-serif'; g.fillStyle = '#986812'; g.fillText(code, W/2, 40 + n*cell + 115);
}
async function openQrGen(){
  try { await loadScript('lib/qrcode.js'); } catch(e){ toast('ما قدرت أجهّز الكيو آر، جرّب مرة ثانية'); return; }
  const code = newCode(); drawQr(code);
  S.barcode = code; save(); renderBarcode(); renderAlarmTile();
  $('#qrGen').hidden = false;
}
$('#qrDone').onclick = () => { $('#qrGen').hidden = true; toast('تم. المنبه ما يوقف إلا بهذا الباركود'); };
$('#qrSave').onclick = () => {
  const data = $('#qrCanvas').toDataURL('image/png').split(',')[1];
  if (N){ const r = N.saveImage(data, 'باركود-منبه-الفجر.png'); toast(r || 'تم الحفظ في الصور'); }
  else toast('اضغط مطوّلاً على الصورة واحفظها');
};
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
  $('#genBarcode').onclick = openQrGen;
  $('#goSounds').onclick = () => { show('prefs'); setTimeout(() => $('#soundsTitle').scrollIntoView({behavior:'smooth'}), 50); };
  $('#alarmTile').onclick = () => show('alarm');
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
window.onPermsChanged = () => {
  renderPerms();
  if (pendingScan && N){ let p = {}; try { p = JSON.parse(N.permStatus()); } catch(e){}
    const m = pendingScan; pendingScan = null;
    if (p.camera) openScanner(m); else toast('فعّل صلاحية الكاميرا عشان تمسح الباركود'); }
};

/* ========== الماسح ========== */
let qr = null, scanMode = null, scanBusy = false, pendingScan = null;
async function openScanner(mode){
  scanMode = mode; scanBusy = false;
  if (N){ let p = {}; try { p = JSON.parse(N.permStatus()); } catch(e){}
    if (!p.camera){ pendingScan = mode; N.fixPerm('camera'); return; } }
  $('#scanner').hidden = false; $('#scanMsg').textContent = '';
  $('#scanTitle').textContent = mode === 'register' ? 'امسح باركود أو كيو آر المنتج اللي بتستخدمه للإيقاف' : 'امسح باركود الإيقاف';
  try { await loadScript('lib/html5-qrcode.min.js'); } catch(e){ $('#scanMsg').textContent = 'الماسح غير متاح، جرّب مرة ثانية.'; return; }
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
    await loadScript('lib/html5-qrcode.min.js');
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
$('#goMorning').onclick = () => { $('#ring').hidden = true; document.getElementById('app').hidden = false; show('azkar'); selectAzkar('morning'); };

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
let azkarReady = false;
function zkProgress(){ const cat = AZKAR.find(c => c.id === zkCat); const bar = $('#zkBar'); if (!cat || cat.tasbih){ bar.style.width = '0'; return; }
  const tot = cat.items.reduce((n,z) => n + z.c, 0), left = cat.items.reduce((n,z,i) => n + (zkLeft[i] == null ? z.c : zkLeft[i]), 0); bar.style.width = (tot ? (1 - left/tot) * 100 : 0) + '%'; }
function selectAzkar(id){ azkarReady = true; zkCat = id; zkLeft = {}; renderChips(); renderAzkar(); }
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
  zkProgress();
}
$('#azkarBody').addEventListener('click', e => {
  if (e.target.id === 'zkReset'){ zkLeft = {}; renderAzkar(); return; }
  const z = e.target.closest('.zk'); if (!z) return; const i = +z.dataset.i;
  if (zkLeft[i] > 0){ zkLeft[i]--; zkProgress(); if (navigator.vibrate) navigator.vibrate(zkLeft[i] === 0 ? 60 : 12);
    const c = z.querySelector('.zk-c'); c.textContent = zkLeft[i] === 0 ? '✓' : ar(zkLeft[i]);
    if (zkLeft[i] === 0){ z.classList.add('done'); const cat = AZKAR.find(c => c.id === zkCat); const done = cat.items.filter((_,j) => zkLeft[j] === 0).length; $('.zk-progress').textContent = `أنهيت ${ar(done)} من ${ar(cat.items.length)} · اضغط على الذكر للعدّ`; }
  }
});
const TASBIH = ['سُبْحَانَ اللَّهِ','الْحَمْدُ لِلَّهِ','اللَّهُ أَكْبَرُ','لَا إِلَهَ إِلَّا اللَّهُ','أَسْتَغْفِرُ اللَّهَ','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ','لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ','اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ'];
let tsb = {i:0, n:0};
function renderTasbih(body){
  zkProgress();
  body.innerHTML = `<div class="tasbih"><select id="tsbPhrase">${TASBIH.map((t,i) => `<option value="${i}">${t}</option>`).join('')}</select>
    <div class="tasbih-phrase" id="tsbText">${TASBIH[tsb.i]}</div>
    <button class="tasbih-btn" id="tsbBtn" aria-label="سبّح"><b id="tsbN">${ar(tsb.n)}</b></button>
    <button class="btn" id="tsbReset">تصفير</button></div>`;
  $('#tsbPhrase').value = tsb.i;
  $('#tsbPhrase').onchange = e => { tsb = {i:+e.target.value, n:0}; renderTasbih(body); };
  $('#tsbBtn').onclick = () => { tsb.n++; $('#tsbN').textContent = ar(tsb.n); if (navigator.vibrate) navigator.vibrate(tsb.n % 33 === 0 ? 120 : 10); };
  $('#tsbReset').onclick = () => { tsb.n = 0; $('#tsbN').textContent = ar(0); };
}

/* ========== القرآن: في mushaf.js ========== */

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
let sTab = 'adhan';
const downloading = new Set();
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const STOP = '<svg viewBox="0 0 24 24"><path d="M7 7h10v10H7z" fill="currentColor"/></svg>';
let playing = null, webAudio = null;
function renderSounds(){
  const have = haveSounds();
  document.querySelectorAll('#sTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === sTab));
  const list = sTab === 'adhan' ? ADHANS : sTab === 'tones' ? TONES : MINE;
  const chosenKey = sTab === 'tones' ? 'alarmSound' : 'adhanSound';
  $('#sounds').innerHTML = list.map(x => {
    const ok = available(x.id, have), chosen = S[chosenKey] === x.id || (sTab !== 'tones' && S.fajrSound === x.id);
    const sub = sTab === 'mine' ? (have[x.id] ? esc(have[x.id]) : 'أذان أو نغمة من ملفات جوالك') : (ok ? esc(x.d || 'جاهز') : (downloading.has(x.id) ? 'جاري التحميل…' : esc(x.d || 'يحتاج تحميل مرة وحدة')));
    let act = '';
    if (ok){
      act += sTab === 'tones'
        ? `<button class="btn ${S.alarmSound===x.id?'primary':''}" data-use="alarmSound" data-id="${x.id}">${S.alarmSound===x.id?'نغمة المنبه':'اختر للمنبه'}</button>`
        : `<button class="btn ${S.adhanSound===x.id?'primary':''}" data-use="adhanSound" data-id="${x.id}">${S.adhanSound===x.id?'صوت الأذان':'للأذان'}</button>`
          + `<button class="btn ${S.fajrSound===x.id?'primary':''}" data-use="fajrSound" data-id="${x.id}">${S.fajrSound===x.id?'أذان الفجر':'للفجر'}</button>`;
      if (sTab === 'mine') act += `<button class="btn danger" data-del="${x.id}">حذف</button>`;
    } else if (sTab === 'mine'){
      act = `<button class="btn" data-pick="${x.id}">إضافة ملف</button>`;
    } else {
      act = `<button class="btn primary" data-dl="${x.id}" ${downloading.has(x.id)?'disabled':''}>${downloading.has(x.id)?'جاري…':'تحميل'}</button>`;
    }
    return `<li class="${chosen?'chosen':''}">${ok ? `<button class="play" data-play="${x.id}" aria-label="استماع">${playing===x.id?STOP:PLAY}</button>` : '<span class="play" aria-hidden="true" style="opacity:.35">'+PLAY+'</span>'}
      <span class="who"><b>${esc(x.n)}</b><small>${sub}</small></span><span class="act">${act}</span></li>`;
  }).join('');
  renderSoundSelects();
}
$('#sTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ sTab = b.dataset.t; renderSounds(); } });
function downloadSound(id){
  const x = ADHANS.find(a => a.id === id); if (!x || !N || downloading.has(id)) return;
  downloading.add(id); renderSounds(); N.downloadSound(id, x.url, x.n);
}
function stopPlaying(){ if (N) N.stopPreview(); if (webAudio){ webAudio.pause(); webAudio = null; } playing = null; }
$('#sounds').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.play){
    const id = b.dataset.play; const was = playing === id; stopPlaying();
    if (!was){
      playing = id;
      if (id.startsWith('tone_')){ webAudio = new Audio('tones/' + TONES.find(t => t.id === id).f + '.ogg'); webAudio.onended = () => { playing = null; renderSounds(); }; webAudio.play().catch(() => {}); }
      else if (N) N.previewSound(id);
    }
    renderSounds(); return;
  }
  if (b.dataset.use){ S[b.dataset.use] = b.dataset.id; save(); sync(); renderSounds(); toast(`تم: ${soundName(b.dataset.id)}`); return; }
  if (!N){ toast('تحميل الأصوات وإضافتها في تطبيق الأندرويد'); return; }
  if (b.dataset.dl) downloadSound(b.dataset.dl);
  else if (b.dataset.pick) N.pickSound(b.dataset.pick);
  else if (b.dataset.del){ if (b.dataset.sure !== '1'){ b.dataset.sure = '1'; b.textContent = 'تأكيد الحذف'; setTimeout(() => { if (b.isConnected){ b.dataset.sure = ''; b.textContent = 'حذف'; } }, 3000); return; } N.deleteSound(b.dataset.del); ['fajrSound','alarmSound','adhanSound'].forEach(k => { if (S[k] === b.dataset.del) S[k] = k === 'alarmSound' ? 'tone_sunrise' : ''; }); save(); renderSounds(); sync(); }
});
window.onSoundFailed = slot => { downloading.delete(slot); renderSounds(); toast('ما قدرت أحمّل الصوت. تأكد من النت وجرّب مرة ثانية'); };
window.onSoundPicked = (slot, name) => {
  downloading.delete(slot);
  if (!S.adhanSound && !slot.startsWith('tone')) S.adhanSound = slot;
  if (!S.fajrSound && slot === 'fajr_malek') S.fajrSound = slot;
  save(); renderSounds(); sync(); toast('جاهز: ' + soundName(slot));
};
window.onPreviewEnded = () => { playing = null; renderSounds(); };


/* ========== المظهر الليلي والنهاري ========== */
const SUN_ICO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>';
const MOON_ICO = '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>';
const THEME_NAMES = {sun:'تلقائي حسب الشمس', system:'حسب الجوال', light:'نهاري', dark:'ليلي'};
function isDayNow(){
  const now = new Date(), t = timesFor(0);
  return now >= t.sunrise && now < t.maghrib;
}
function effectiveLight(){
  const m = S.theme || 'sun';
  if (m === 'light') return true; if (m === 'dark') return false;
  if (m === 'sun') return isDayNow();
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
}
let _lastLight = null;
function applyTheme(){
  const light = effectiveLight();
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  const btn = document.getElementById('themeBtn'); if (btn) btn.innerHTML = light ? SUN_ICO : MOON_ICO;
  document.querySelectorAll('#themePick button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === (S.theme || 'sun')));
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = light ? '#edf3f0' : '#0d2a2c';
  if (light !== _lastLight){ _lastLight = light; if (N && N.setBars) try { N.setBars(light); } catch(e){} }
}
function setTheme(m){ S.theme = m; save(); applyTheme(); toast('المظهر: ' + THEME_NAMES[m]); }
document.getElementById('themeBtn').onclick = () => {
  // الزر يبدّل بسرعة بين النهاري والليلي؛ الخيارات التلقائية في الإعدادات
  setTheme(effectiveLight() ? 'dark' : 'light');
};
document.getElementById('themePick').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTheme(b.dataset.m); });
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', applyTheme);

/* ========== تشغيل ========== */
function boot(){
  if (typeof adhan === 'undefined'){ document.body.innerHTML = '<p style="padding:24px">تعذّر تحميل مكتبة المواقيت.</p>'; return; }
  applyTheme();
  initAlarmTab(); initPrefs(); renderChips(); renderHome(); tick();
  let timer = setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => {
    clearInterval(timer);
    if (!document.hidden){ renderHome(); renderPerms(); applyTheme(); tick(); timer = setInterval(tick, 1000); }
    else if (ringing || RING_MODE) timer = setInterval(tick, 1000);   // شاشة المنبه لازم تبقى شغالة
  });
  if (RING_MODE){ startRing(false); }
  else {
    sync();
    // أول تشغيل: نحمّل أذان المسجد النبوي وأذان الفجر عشان يطلع صوت الأذان مباشرة
    if (N){ const have = haveSounds(); let done = ''; try { done = localStorage.getItem('fajr.autoDl2') || ''; } catch(e){}
      if (!done){ try{ localStorage.setItem('fajr.autoDl2','1'); }catch(e){}
        if (!have.nabawi) downloadSound('nabawi'); else if (!S.adhanSound){ S.adhanSound = 'nabawi'; save(); }
        if (!have.fajr_malek) downloadSound('fajr_malek');
        toast('جاري تحميل أصوات الأذان…'); } }
  }
}
boot();
