/* الواجهة: حراج + وظائف. كل نص يدخل الصفحة يمر عبر esc() قبل العرض. */
(function () {
  'use strict';
  var I = window.SITE_INFO || {};
  var NAME = I.siteName || 'دكّة';

  /* ---------------- أيقونات (خطوط بسيطة) ---------------- */
  var P = {
    search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
    sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
    plus: 'M12 5v14M5 12h14',
    x: 'M6 6l12 12M18 6L6 18',
    star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
    pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
    clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
    phone: 'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
    chat: 'M4 5h16v11H9l-5 4z',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    image: 'M4 5h16v14H4zM4 15l4-4 5 5 3-3 4 4M15 9.5a1 1 0 1 1 0-.01',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
    brief: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
    user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM5 20a7 7 0 0 1 14 0',
    list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    menu: 'M4 7h16M4 12h16M4 17h16',
    coins: 'M8 7a5 2.5 0 1 0 10 0 5 2.5 0 1 0-10 0zM8 7v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7M6 12a5 2.5 0 0 0 0 0M3 12v5c0 1.4 2.2 2.5 5 2.5 1.4 0 2.6-.3 3.5-.7M3 12c0-1.4 2.2-2.5 5-2.5',
    shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
    doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    arrow: 'M15 6l-6 6 6 6',
    chev: 'M9 6l6 6-6 6',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
    refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
    // أقسام الحراج
    car: 'M5 16h14v-3l-2-4.5H7L5 13zM5 16v2.5M19 16v2.5M7.5 13h.01M16.5 13h.01M4 11h1.5M18.5 11H20',
    gear: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
    home: 'M4 11l8-6.5 8 6.5v9H4zM10 20v-5.5h4V20',
    mobile: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
    tv: 'M3 6h18v11H3zM8 21h8M12 17v4',
    sofa: 'M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11M3 11h18v6H3zM5 17v2M19 17v2',
    shirt: 'M8.5 4L12 6l3.5-2L20 7l-2 3.5-2-1V20H8V9.5l-2 1L4 7z',
    baby: 'M12 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM6.5 21v-3.5a5.5 5.5 0 0 1 11 0V21',
    ball: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM3.5 10h17M3.5 14h17M12 3c2.8 2.5 2.8 15.5 0 18',
    paw: 'M8 5a1.6 1.6 0 1 1 0 3.2A1.6 1.6 0 0 1 8 5zM16 5a1.6 1.6 0 1 1 0 3.2A1.6 1.6 0 0 1 16 5zM4.8 10a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM19.2 10a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM12 11.5c3 0 5.5 4.2 5.5 6.2 0 2-2.5 2.3-5.5 2.3s-5.5-.3-5.5-2.3c0-2 2.5-6.2 5.5-6.2z',
    tools: 'M14.5 5.5a4 4 0 0 0 4 5.6l-8.3 8.3a2 2 0 0 1-2.8-2.8l8.3-8.3a4 4 0 0 1-1.2-2.8zM4 4l4 4',
    hand: 'M3 12.5l4-4 4.5 3 3-3 6.5 5.5-4 4-3-2.5-3 2.5z',
    dots: 'M5 12h.01M12 12h.01M19 12h.01',
    // أقسام الوظائف
    leaf: 'M5 19C5 11 11 5 19 5c0 8-6 14-14 14zM5 19l7.5-7.5',
    cup: 'M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 9.5h1.5a2.25 2.25 0 0 1 0 4.5H17M8.5 3.5v2M12.5 3.5v2',
    pen: 'M4 20l4-1L19.5 7.5l-3-3L5 16zM14.5 6.5l3 3',
    calc: 'M6 3h12v18H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 18h.01M12 18h.01M15 18h.01',
    cart: 'M3 4h2.5l2 11h10.5l2-8H6.2M9 20h.01M17 20h.01',
    truck: 'M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM17 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',
    bolt: 'M13 3L5 13.5h6L10 21l8-10.5h-6z',
    crane: 'M4 21V8l8-5 8 5v13M9 21v-6h6v6',
    code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13',
    book: 'M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z',
    heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    scissors: 'M6 7.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zM6 21a2.25 2.25 0 1 1 0-4.5A2.25 2.25 0 0 1 6 21zM7.8 6.6L20 18M7.8 17.4L20 6',
    folder: 'M3 7h7l2 2h9v10H3z',
    mega: 'M4 10v4h3l8 4.5V5.5L7 10zM18 9.5a3 3 0 0 1 0 5'
  };
  function icon(n, cls) { return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (P[n] || P.dots) + '"/></svg>'; }

  /* ---------------- بيانات ثابتة ---------------- */
  var HARAJ_CATS = [['cars', 'سيارات', 'car'], ['parts', 'قطع غيار', 'gear'], ['realestate', 'عقار', 'home'], ['phones', 'جوالات', 'mobile'], ['electronics', 'أجهزة وإلكترونيات', 'tv'], ['furniture', 'أثاث ومنزل', 'sofa'], ['fashion', 'أزياء وساعات', 'shirt'], ['kids', 'مستلزمات أطفال', 'baby'], ['sports', 'رياضة ورحلات', 'ball'], ['animals', 'مواشي وحيوانات', 'paw'], ['equipment', 'معدات وعدد', 'tools'], ['services', 'خدمات', 'hand'], ['misc', 'أشياء ثانية', 'dots']];
  var JOB_CATS = [['veg', 'خضار وفواكه', 'leaf'], ['food', 'مطاعم وكافيهات', 'cup'], ['design', 'تصميم وجرافيك', 'pen'], ['acct', 'محاسبة ومالية', 'calc'], ['sales', 'مبيعات وكاشير', 'cart'], ['drive', 'سائقين وتوصيل', 'truck'], ['maint', 'صيانة وكهرباء وسباكة', 'bolt'], ['build', 'بناء ومقاولات', 'crane'], ['tech', 'تقنية وبرمجة', 'code'], ['edu', 'تعليم ودروس خصوصية', 'book'], ['health', 'صحة وتمريض', 'heart'], ['beauty', 'تجميل وحلاقة', 'scissors'], ['home', 'عمالة منزلية', 'home'], ['security', 'أمن وحراسة', 'shield'], ['office', 'إدارة وسكرتارية', 'folder'], ['market', 'تسويق وسوشيال ميديا', 'mega'], ['tailor', 'خياطة وأزياء', 'shirt'], ['other', 'مهن أخرى', 'dots']];
  var CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الطائف', 'تبوك', 'بريدة', 'عنيزة', 'حائل', 'أبها', 'خميس مشيط', 'جازان', 'نجران', 'الباحة', 'الجوف', 'ينبع', 'القطيف', 'الجبيل', 'حفر الباطن', 'عرعر'];
  var TYPES = { sell: 'للبيع', buy: 'مطلوب', hire: 'وظيفة شاغرة', seek: 'يبحث عن عمل' };
  var REASONS = [['fraud', 'احتيال أو نصب'], ['prohibited', 'سلعة أو وظيفة ممنوعة'], ['wrong', 'معلومات غلط أو مضللة'], ['sold', 'انباع أو انتهى'], ['duplicate', 'إعلان مكرر'], ['other', 'سبب ثاني']];
  var MAXPICS = 4;

  /* ---------------- الحالة ---------------- */
  var params = new URLSearchParams(location.search);
  var ADMIN = window.APP_MODE === 'admin';
  if (!ADMIN && params.has('admin')) { location.replace('/admin.html'); return; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k) || ''; if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return ''; } }
  var S = { section: params.get('s') === 'jobs' ? 'job' : 'haraj', cat: 'all', type: 'all', city: 'all', q: '', ads: [], loaded: false, err: false, plans: { week: 10, month: 30 }, days: 30, limit: 24, view: ADMIN ? 'admin' : 'home', mine: null, me: undefined, myIds: [] };
  var A = { pw: ss('dk-admin'), data: null, tab: 'reports', kind: 'all' };
  var layer = null; // الطبقة المفتوحة: {name, ...}
  var lastFocus = null;

  /* ---------------- أدوات ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeImg(u) { u = String(u || ''); return /^(https:\/\/[^\s"'<>]+|data:image\/jpeg;base64,[A-Za-z0-9+/=]+)$/.test(u) ? u : ''; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function cats(kind) { return kind === 'job' ? JOB_CATS : HARAJ_CATS; }
  function catOf(kind, id) { var l = cats(kind); for (var i = 0; i < l.length; i++) if (l[i][0] === id) return l[i]; return l[l.length - 1]; }
  function money(n) { return Number(n).toLocaleString('en-US'); }
  function ago(iso) {
    var m = Math.floor((Date.now() - Date.parse(iso)) / 6e4);
    if (m < 1) return 'الحين'; if (m < 60) return 'قبل ' + m + ' دقيقة';
    var h = Math.floor(m / 60); if (h < 24) return h === 1 ? 'قبل ساعة' : h === 2 ? 'قبل ساعتين' : 'قبل ' + h + ' ساعات';
    var d = Math.floor(h / 24); return d === 1 ? 'أمس' : d === 2 ? 'قبل يومين' : d <= 10 ? 'قبل ' + d + ' أيام' : 'قبل ' + d + ' يوم';
  }
  function dateAr(iso) { try { return new Date(iso).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long' }); } catch (e) { return iso.slice(0, 10); } }
  function norm(s) { return String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase(); }
  function isFeat(a) { return a.featured_until && Date.parse(a.featured_until) > Date.now(); }
  function toast(t) { if (window.Motion) return window.Motion.toast(t); var el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2800); }
  function haptic(k) { if (window.Motion) window.Motion.haptic(k); }
  function copy(text, okMsg) { try { navigator.clipboard.writeText(text).then(function () { toast(okMsg || 'تم النسخ'); }, function () { toast('ما قدرنا ننسخ، انسخه يدوياً'); }); } catch (e) { toast('ما قدرنا ننسخ، انسخه يدوياً'); } }
  function waLink(phone, text) { var p = String(phone || '').replace(/\D/g, ''); if (p.indexOf('05') === 0) p = '966' + p.slice(1); return 'https://wa.me/' + p + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function api(path, opts) {
    return fetch(path, opts).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { j.httpStatus = r.status; throw j; } return j; }); });
  }
  function post(path, body) { return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
  function isMine(id) { return S.myIds.indexOf(id) >= 0; }
  function loggedIn() { return !!(S.me && S.me.phone); }
  function loadMe() {
    return api('/api/auth?ads=1').then(function (j) {
      S.me = j.phone ? { phone: j.phone } : null;
      S.mine = j.phone ? (j.ads || []) : null; S.myIds = (S.mine || []).map(function (a) { return a.id; });
      renderPage(); if (layer && layer.name === 'detail') renderLayer();
    }).catch(function () { S.me = null; renderPage(); });
  }
  // أي إجراء يحتاج دخول: لو مو مسجّل، نفتح تسجيل الدخول ثم نكمل الإجراء بعده
  function requireLogin(then) { if (loggedIn()) return then(); openLayer({ name: 'login', step: 'phone', phone: '', channel: 'whatsapp', then: then }); }

  /* ---------------- النمط الليلي/النهاري ---------------- */
  function effectiveTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function toggleTheme(btn) {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    function apply() {
      document.documentElement.setAttribute('data-theme', next);
      store('theme', next);
      var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', next === 'dark' ? '#151E1B' : '#FFFFFF');
      renderPage(); if (layer && layer.name === 'more') renderLayer();
    }
    // النمط الجديد يتمدد كدائرة من الزر نفسه، بدل قفزة مفاجئة في السطوع
    if (window.Motion) window.Motion.themeSwitch(btn, apply); else apply();
  }

  /* ---------------- البيانات ---------------- */
  function loadAds(fresh) {
    return api('/api/ads' + (fresh ? '?t=' + Date.now() : ''), fresh ? { cache: 'no-store' } : undefined).then(function (j) {
      S.ads = Array.isArray(j.ads) ? j.ads : []; if (j.plans) S.plans = j.plans; if (j.days) S.days = j.days;
      S.loaded = true; S.err = false; renderPage();
    }).catch(function () { S.loaded = true; S.err = true; renderPage(); });
  }
  function findAd(id) { for (var i = 0; i < S.ads.length; i++) if (S.ads[i].id === id) return S.ads[i]; return null; }
  function getAd(id) {
    var a = findAd(id) || (S.mine && S.mine.filter(function (x) { return x.id === id; })[0]);
    if (a) return Promise.resolve(a);
    return api('/api/ad?id=' + encodeURIComponent(id)).then(function (j) { return j.ad; });
  }
  function visible() {
    var q = norm(S.q.trim());
    return S.ads.filter(function (a) {
      if (a.kind !== S.section) return false;
      if (S.cat !== 'all' && a.cat !== S.cat) return false;
      if (S.type !== 'all' && a.type !== S.type) return false;
      if (S.city !== 'all' && a.city !== S.city) return false;
      if (q && norm(a.title + ' ' + a.details + ' ' + catOf(a.kind, a.cat)[1] + ' ' + a.city).indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) {
      var fa = isFeat(a) ? 1 : 0, fb = isFeat(b) ? 1 : 0;
      if (fa !== fb) return fb - fa; // المميز يتصدر قائمته (مدينته في الحراج، قسمه في الوظائف)
      return String(b.created_at).localeCompare(String(a.created_at));
    });
  }

  /* ---------------- عناصر العرض ---------------- */
  function priceHtml(a) {
    if (a.kind === 'job') return a.salary ? '<span class="salary">' + esc(a.salary) + '</span>' : '';
    if (a.type === 'buy') return '<span class="price"><small>مطلوب</small></span>';
    return a.price != null ? '<span class="price num">' + money(a.price) + ' <small>ر.س</small></span>' : '<span class="price"><small>على السوم</small></span>';
  }
  function hcard(a) {
    var c = catOf('haraj', a.cat), img = safeImg((a.images || [])[0]), n = (a.images || []).length;
    return '<button class="card' + (isFeat(a) ? ' is-featured' : '') + '" data-act="open" data-id="' + esc(a.id) + '" aria-label="' + esc(a.title) + '">' +
      '<div class="thumb-wrap">' + (img ? '<span class="ph">' + icon(c[2]) + '</span><img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : '<div class="noimg">' + icon(c[2]) + '</div>') +
      (isFeat(a) ? '<span class="badge b-gold">' + icon('star') + 'مميز</span>' : a.type === 'buy' ? '<span class="badge b-soft">مطلوب</span>' : '') +
      (n > 1 ? '<span class="count">' + icon('image') + n + '</span>' : '') + '</div>' +
      '<div class="card-body"><h3>' + esc(a.title) + '</h3>' + priceHtml(a) +
      '<div class="meta"><span>' + icon('pin') + esc(a.city) + '</span><span>' + icon('clock') + ago(a.created_at) + '</span></div></div></button>';
  }
  function jcard(a) {
    var c = catOf('job', a.cat), img = safeImg((a.images || [])[0]);
    return '<button class="jcard' + (isFeat(a) ? ' is-featured' : '') + '" data-act="open" data-id="' + esc(a.id) + '">' +
      '<div class="avatar">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : icon(c[2])) + '</div>' +
      '<div class="jmain"><div class="row1">' + (isFeat(a) ? '<span class="badge b-gold">' + icon('star') + 'مميز</span>' : '') +
      '<span class="badge ' + (a.type === 'hire' ? 'b-primary">وظيفة شاغرة' : 'b-soft">يبحث عن عمل') + '</span><span class="badge b-soft">' + esc(c[1]) + '</span></div>' +
      '<h3>' + esc(a.title) + '</h3><p>' + esc(a.details) + '</p>' +
      '<div class="meta">' + priceHtml(a) + '<span>' + icon('pin') + esc(a.city) + '</span><span>' + icon('clock') + ago(a.created_at) + '</span></div></div></button>';
  }
  function skeletons() {
    var h = S.section === 'haraj' ? '<div class="grid">' : '<div class="list">';
    for (var i = 0; i < 8; i++) h += '<div class="skeleton" style="height:' + (S.section === 'haraj' ? 230 : 120) + 'px"></div>';
    return h + '</div>';
  }

  function header() {
    var dark = effectiveTheme() === 'dark';
    if (ADMIN) return '<header class="top' + (window.scrollY > 4 ? ' scrolled' : '') + '"><div class="wrap">' +
      '<a class="brand" href="/admin.html"><span class="mark" aria-hidden="true">' + esc(NAME.charAt(0)) + '</span><span><b>' + esc(NAME) + '</b><small>لوحة الإدارة</small></span></a>' +
      '<button class="icon-btn" data-act="theme" aria-label="' + (dark ? 'تفعيل النمط النهاري' : 'تفعيل النمط الليلي') + '">' + icon(dark ? 'sun' : 'moon') + '</button>' +
      '<a class="btn btn-line btn-sm" href="/" target="_blank" rel="noopener">' + icon('link') + 'فتح الموقع</a></div></header>';
    function nav(v, sec, label, ic) {
      var cur = sec ? (S.view === 'home' && S.section === sec) : S.view === v;
      return '<button data-act="nav" data-view="' + v + '"' + (sec ? ' data-sec="' + sec + '"' : '') + (cur ? ' aria-current="page"' : '') + '>' + icon(ic) + label + '</button>';
    }
    return '<header class="top' + (window.scrollY > 4 ? ' scrolled' : '') + '"><div class="wrap">' +
      '<a class="brand" href="./" data-act="home"><span class="mark" aria-hidden="true">' + esc(NAME.charAt(0)) + '</span><span><b>' + esc(NAME) + '</b><small>حراج ووظائف في السعودية</small></span></a>' +
      '<nav class="topnav" aria-label="الأقسام">' + nav('home', 'haraj', 'الحراج', 'bag') + nav('home', 'job', 'الوظائف', 'brief') + nav('mine', null, 'إعلاناتي', 'list') + '<button data-act="commission">' + icon('coins') + 'دفع العمولة</button></nav>' +
      '<button class="icon-btn" data-act="theme" aria-label="' + (dark ? 'تفعيل النمط النهاري' : 'تفعيل النمط الليلي') + '" title="' + (dark ? 'النمط النهاري' : 'النمط الليلي') + '">' + icon(dark ? 'sun' : 'moon') + '</button>' +
      '<button class="icon-btn" data-act="account" aria-label="' + (loggedIn() ? 'حسابي' : 'تسجيل الدخول') + '" title="' + (loggedIn() ? 'حسابي' : 'تسجيل الدخول') + '">' + icon('user') + '</button>' +
      '<button class="btn btn-gold post-btn" data-act="post">' + icon('plus') + 'أضف إعلان</button>' +
      '</div></header>';
  }
  function bottombar() {
    function b(v, sec, label, ic) {
      var cur = sec ? (S.view === 'home' && S.section === sec) : S.view === v;
      return '<button data-act="nav" data-view="' + v + '"' + (sec ? ' data-sec="' + sec + '"' : '') + (cur ? ' aria-current="page"' : '') + '>' + icon(ic) + label + '</button>';
    }
    return '<nav class="bottombar" aria-label="التنقل">' + b('home', 'haraj', 'الحراج', 'bag') + b('home', 'job', 'الوظائف', 'brief') +
      '<button class="fab" data-act="post"><span class="circle">' + icon('plus') + '</span>أضف إعلان</button>' +
      b('mine', null, 'إعلاناتي', 'list') + '<button data-act="more">' + icon('menu') + 'المزيد</button></nav>';
  }
  function footer() {
    return '<footer class="site wrap"><nav><a href="terms.html">شروط الخدمة</a><a href="privacy.html">سياسة الخصوصية</a><button data-act="commission">دفع العمولة</button>' + (I.email ? '<a href="mailto:' + esc(I.email) + '">تواصل معنا</a>' : '') + '</nav>' +
      '<span>' + esc(NAME) + ' © ' + new Date().getFullYear() + (I.ownerName ? ' · ' + esc(I.ownerName) : '') + (I.licenseNumber ? ' · ' + esc(I.licenseType || '') + ' ' + esc(I.licenseNumber) : '') + '</span>' +
      '<span>الموقع وسيط إعلاني فقط. لا تحوّل فلوس قبل ما تشوف السلعة أو تتأكد من صاحب العمل.</span></footer>';
  }

  function homeView() {
    var isH = S.section === 'haraj', list = visible(), counts = {}, total = 0;
    S.ads.forEach(function (a) { if (a.kind === S.section && (S.type === 'all' || a.type === S.type) && (S.city === 'all' || a.city === S.city)) { counts[a.cat] = (counts[a.cat] || 0) + 1; total++; } });
    var h = '<section class="hero"><h1>' + (isH ? 'بع واشترِ <em>كل شيء</em> في مدينتك' : 'وظيفتك أو موظفك <em>بإعلان واحد</em>') + '</h1>' +
      '<p>' + (isH ? 'النشر مجاني. العمولة 1% على البائع بعد البيع فقط، وتمييز إعلانك يرفعه لأول إعلانات مدينته.' : 'النشر مجاني للجميع، وتمييز إعلانك يرفعه لأول قسمه أسبوع أو شهر.') + '</p>' +
      '<div class="switch" role="group" aria-label="القسم" data-sel="' + (S.prevSection === 'job' ? 1 : 0) + '"><button data-act="section" data-id="haraj" aria-pressed="' + isH + '">' + icon('bag') + 'الحراج</button><button data-act="section" data-id="job" aria-pressed="' + !isH + '">' + icon('brief') + 'الوظائف</button></div>' +
      '<div class="searchbar"><label class="field-ico">' + icon('search') + '<span class="vh">بحث</span><input class="input" id="q" type="search" enterkeyhint="search" placeholder="' + (isH ? 'ابحث: كامري، آيفون، كنب...' : 'ابحث: محاسب، كاشير، مصمم...') + '" value="' + esc(S.q) + '"></label>' +
      '<label class="vh" for="city">المدينة</label><select class="select" id="city"><option value="all">كل المدن</option>' + CITIES.map(function (c) { return '<option' + (S.city === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
      '<div class="chips" role="group" aria-label="النوع">' + chip('all', 'الكل') + (isH ? chip('sell', 'للبيع') + chip('buy', 'مطلوب') : chip('hire', 'وظائف شاغرة') + chip('seek', 'باحثون عن عمل')) + '</div></section>';
    h += '<div class="sec-head"><h2>' + (isH ? 'الأقسام' : 'المهن') + '</h2><span class="num">' + cats(S.section).length + ' قسم</span></div><div class="rail" role="group" aria-label="الأقسام">' +
      '<button class="cat" data-act="cat" data-id="all" aria-pressed="' + (S.cat === 'all') + '"><span class="bubble">' + icon('grid') + '</span><b>الكل</b><small class="num">' + total + '</small></button>' +
      cats(S.section).map(function (c) { return '<button class="cat" data-act="cat" data-id="' + c[0] + '" aria-pressed="' + (S.cat === c[0]) + '"><span class="bubble">' + icon(c[2]) + '</span><b>' + c[1] + '</b><small class="num">' + (counts[c[0]] || 0) + '</small></button>'; }).join('') + '</div>';
    h += '<div class="sec-head"><h2>' + (S.cat === 'all' ? (isH ? 'أحدث المعروضات' : 'أحدث الإعلانات') : esc(catOf(S.section, S.cat)[1])) + (S.city !== 'all' ? ' في ' + esc(S.city) : '') + '</h2><span class="num">' + (S.loaded ? list.length + ' إعلان' : '') + '</span></div>';
    if (!S.loaded) h += skeletons();
    else if (S.err) h += '<div class="empty" role="alert">' + icon('refresh') + '<h3>تعذر تحميل الإعلانات</h3><p>تأكد من اتصالك بالإنترنت.</p><button class="btn btn-primary" data-act="reload">حاول مرة ثانية</button></div>';
    else if (!list.length) h += '<div class="empty">' + icon(isH ? 'bag' : 'brief') + '<h3>ما فيه إعلانات هنا للحين</h3><p>' + (S.q || S.cat !== 'all' || S.city !== 'all' || S.type !== 'all' ? 'جرّب تغيّر البحث أو الفلاتر، أو' : '') + ' كن أول من ينشر. النشر مجاني.</p><button class="btn btn-gold" data-act="post">' + icon('plus') + 'أضف إعلانك مجاناً</button></div>';
    else {
      h += (isH ? '<div class="grid">' : '<div class="list">') + list.slice(0, S.limit).map(isH ? hcard : jcard).join('') + '</div>';
      if (list.length > S.limit) h += '<div class="more"><button class="btn btn-line" data-act="more-ads">عرض المزيد (' + (list.length - S.limit) + ')</button></div>';
    }
    h += '<div class="perks">' +
      perk('check', 'النشر مجاني', 'انشر في الحراج أو الوظائف بدون أي رسوم.') +
      perk('star', 'تمييز يتصدر', S.plans.week + ' ر.س للأسبوع أو ' + S.plans.month + ' ر.س للشهر، ويطلع إعلانك أول القائمة.') +
      perk('lock', 'دفع آمن', 'التمييز والعمولة عبر مدى وApple Pay والبطاقات من بوابة ميسر.') +
      perk('flag', 'بلّغ عن المخالف', 'كل إعلان فيه زر بلاغ، ونراجع البلاغات يومياً.') + '</div>';
    return h;
  }
  function chip(v, t) { return '<button class="chip" data-act="type" data-id="' + v + '" aria-pressed="' + (S.type === v) + '">' + t + '</button>'; }
  function perk(ic, t, d) { return '<div class="perk"><span class="bubble">' + icon(ic) + '</span><div><b>' + t + '</b><span>' + d + '</span></div></div>'; }

  function mineView() {
    var h = '<section class="hero"><h1>إعلاناتي</h1><p>' + (loggedIn() ? 'إعلاناتك النشطة على الرقم <span dir="ltr" class="num">' + esc(S.me.phone) + '</span>. تقدر تميّزها أو تدفع عمولة البيع.' : 'سجّل دخولك برقم جوالك عشان تشوف إعلاناتك وتنشر إعلان جديد.') + '</p></section>';
    if (S.me === undefined) return h + skeletons();
    if (!loggedIn()) return h + '<div class="empty">' + icon('lock') + '<h3>سجّل دخولك أول</h3><p>نرسل لك كود على واتساب أو رسالة نصية.</p><button class="btn btn-primary" data-act="login">' + icon('phone') + 'تسجيل الدخول</button></div>';
    if (!S.mine) { loadMe(); return h + skeletons(); }
    if (!S.mine.length) return h + '<div class="empty">' + icon('list') + '<h3>ما عندك إعلانات نشطة</h3><p>أول إعلان لك مجاني وما ياخذ دقيقتين.</p><button class="btn btn-gold" data-act="post">' + icon('plus') + 'أضف إعلان</button></div>';
    h += '<div class="list">';
    S.mine.forEach(function (a) {
      h += '<div style="display:flex;flex-direction:column;gap:8px">' + (a.kind === 'haraj' ? jcardHaraj(a) : jcard(a)) +
        '<div class="actions">' + (isFeat(a) ? '<span class="badge b-gold">' + icon('star') + 'مميز حتى ' + dateAr(a.featured_until) + '</span>' : '') +
        '<button class="btn btn-gold btn-sm" data-act="feature" data-id="' + esc(a.id) + '">' + icon('star') + (isFeat(a) ? 'مدّد التمييز' : 'ميّز الإعلان') + '</button>' +
        (a.kind === 'haraj' && a.type === 'sell' ? '<button class="btn btn-line btn-sm" data-act="commission" data-id="' + esc(a.id) + '">' + icon('coins') + 'انباع؟ ادفع العمولة</button>' : '') +
        '<button class="btn btn-soft btn-sm" data-act="share" data-id="' + esc(a.id) + '">' + icon('link') + 'نسخ الرابط</button></div></div>';
    });
    h += '</div><div class="note" style="margin-top:14px">' + icon('shield') + '<span>ما تقدر تحذف الإعلان بنفسك. إذا انباع أو تبي تحذفه، تواصل مع الإدارة' + (I.email ? ' على <span dir="ltr">' + esc(I.email) + '</span>' : '') + ' مع رقم الإعلان.</span></div>';
    return h;
  }
  function jcardHaraj(a) { // بطاقة أفقية لإعلان حراج داخل «إعلاناتي»
    var img = safeImg((a.images || [])[0]), c = catOf('haraj', a.cat);
    return '<button class="jcard' + (isFeat(a) ? ' is-featured' : '') + '" data-act="open" data-id="' + esc(a.id) + '"><div class="avatar">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : icon(c[2])) + '</div>' +
      '<div class="jmain"><div class="row1"><span class="badge b-soft">' + esc(c[1]) + '</span><span class="badge b-soft">' + TYPES[a.type] + '</span></div><h3>' + esc(a.title) + '</h3><div class="meta">' + priceHtml(a) + '<span>' + icon('pin') + esc(a.city) + '</span><span>' + icon('clock') + ago(a.created_at) + '</span></div></div></button>';
  }

  function renderPage() {
    var main = S.view === 'admin' ? adminView() : S.view === 'mine' ? mineView() : homeView();
    var html = header() + '<main class="wrap" id="main">' + main + '</main>' + (S.view === 'admin' ? '' : footer() + bottombar());
    var page = document.getElementById('page');
    var f = document.activeElement && document.activeElement.id, pos = null;
    try { pos = document.activeElement.selectionStart; } catch (e) { }
    page.innerHTML = html;
    // مؤشر القسم ينزلق من مكانه السابق للجديد
    var sw = page.querySelector('.switch');
    if (sw && S.prevSection !== S.section) requestAnimationFrame(function () { sw.setAttribute('data-sel', S.section === 'job' ? 1 : 0); });
    S.prevSection = S.section;
    if (f && !layer) { var el = document.getElementById(f); if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (e) { } } }
  }

  /* ---------------- الطبقات (تفاصيل، نشر، تمييز، عمولة...) ---------------- */
  function openLayer(l) { if (!layer) lastFocus = document.activeElement; layer = l; renderLayer(true); }
  function closeLayer(velocity) {
    var root = document.getElementById('layer'), ov = root.querySelector('.overlay');
    layer = null; document.body.style.overflow = '';
    if (ov && window.Motion) {
      // النافذة الخارجة تنتقل لطبقة مؤقتة وتنزل من نفس طريق دخولها، والطبقة الأصلية تصير جاهزة فوراً
      var ghost = document.createElement('div'); ghost.className = 'layer-ghost'; ghost.setAttribute('aria-hidden', 'true');
      ghost.appendChild(ov); document.body.appendChild(ghost); root.innerHTML = '';
      window.Motion.leave(ov, velocity).then(function () { ghost.remove(); });
    } else root.innerHTML = '';
    if (lastFocus && document.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch (e) { }
  }
  var animNext = false, noAnimOnce = false; // noAnimOnce: الرجوع من عارض الصور ما يعيد حركة دخول النافذة
  function sheet(title, body, opts) {
    opts = opts || {}; opts.anim = animNext;
    return '<div class="overlay' + (opts.anim ? ' anim' : '') + '" data-act="scrim"><div class="sheet' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="sh-title"><div class="grip"></div>' +
      '<div class="sheet-head"><h2 id="sh-title">' + title + '</h2><button class="icon-btn" data-act="close" aria-label="إغلاق">' + icon('x') + '</button></div>' + body + '</div></div>';
  }
  function renderLayer(focus) {
    var root = document.getElementById('layer');
    if (!layer) { root.innerHTML = ''; return; }
    var fn = { detail: detailSheet, post: postSheet, login: loginSheet, account: accountSheet, feature: featureSheet, commission: commissionSheet, result: resultSheet, report: reportSheet, more: moreSheet, viewer: viewerLayer }[layer.name];
    var keep = root.querySelector('.sheet'), top = keep ? keep.scrollTop : 0;
    animNext = !keep && !noAnimOnce; noAnimOnce = false;
    root.innerHTML = fn();
    document.body.style.overflow = 'hidden';
    if (window.Motion) {
      if (animNext && layer.name !== 'viewer') window.Motion.enter(root.querySelector('.overlay'));
      if (layer.name === 'viewer') window.Motion.viewerEnter(root.querySelector('.viewer img'), layer.from || 0);
    }
    var sh = root.querySelector('.sheet'); if (sh && !focus) sh.scrollTop = top;
    if (focus) { var first = root.querySelector('.sheet [data-autofocus]') || root.querySelector('.sheet-head .icon-btn') || root.querySelector('.viewer .x'); if (first) try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
  }

  function detailSheet() {
    var a = layer.ad;
    if (!a) return sheet('الإعلان', layer.error ? '<div class="empty">' + icon('clock') + '<h3>الإعلان غير متاح</h3><p>ممكن انتهت مدته أو انحذف.</p></div>' : '<div class="skeleton" style="height:260px"></div><div class="skeleton" style="height:90px"></div>');
    var c = catOf(a.kind, a.cat), imgs = (a.images || []).map(safeImg).filter(Boolean), mine = isMine(a.id);
    var h = '';
    if (imgs.length) {
      h += '<div class="gallery" id="gal">' + imgs.map(function (u, i) { return '<button data-act="viewer" data-i="' + i + '" aria-label="تكبير الصورة ' + (i + 1) + '"><img src="' + esc(u) + '" alt="صورة ' + (i + 1) + ' من ' + imgs.length + '"></button>'; }).join('') + '</div>';
      if (imgs.length > 1) h += '<div class="dots" aria-hidden="true">' + imgs.map(function (_, i) { return '<i class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    }
    h += '<div style="display:flex;flex-direction:column;gap:8px"><div class="actions">' + (isFeat(a) ? '<span class="badge b-gold">' + icon('star') + 'مميز</span>' : '') + '<span class="badge ' + (a.type === 'hire' || a.type === 'sell' ? 'b-primary' : 'b-soft') + '">' + TYPES[a.type] + '</span><span class="badge b-soft">' + esc(c[1]) + '</span>' + (a.condition ? '<span class="badge b-soft">' + (a.condition === 'new' ? 'جديد' : 'مستعمل') + '</span>' : '') + '</div>' +
      '<h3 class="d-title">' + esc(a.title) + '</h3>' + (a.kind === 'haraj' ? (a.type === 'buy' ? '' : '<div class="d-price num">' + (a.price != null ? money(a.price) + ' <small style="font-size:14px">ر.س</small>' : '<small style="font-size:16px;color:var(--muted)">السعر على السوم</small>') + '</div>') : (a.salary ? '<div class="salary" style="font-size:16px">الراتب: ' + esc(a.salary) + '</div>' : '')) + '</div>';
    h += '<p class="d-details">' + esc(a.details) + '</p>';
    h += '<div class="facts"><div class="fact"><small>المدينة</small><b>' + esc(a.city) + '</b></div><div class="fact"><small>نُشر</small><b>' + ago(a.created_at) + '</b></div><div class="fact"><small>القسم</small><b>' + esc(c[1]) + '</b></div><div class="fact"><small>رقم الإعلان</small><b dir="ltr" class="num">' + esc(a.id.slice(0, 8)) + '</b></div></div>';
    h += '<div class="seller"><span class="av" aria-hidden="true">' + esc((a.name || '؟').charAt(0)) + '</span><div class="who"><b>' + esc(a.name) + '</b><small>' + (a.kind === 'job' ? (a.type === 'hire' ? 'صاحب العمل' : 'الباحث عن عمل') : 'المعلن') + '</small></div></div>';
    h += layer.showPhone ? '<div class="phone-box"><span class="n num">' + esc(a.phone) + '</span><div class="actions"><button class="btn btn-soft btn-sm" data-act="copy-phone">نسخ</button><a class="btn btn-primary btn-sm" href="' + esc(waLink(a.phone, 'السلام عليكم، بخصوص إعلانك في ' + NAME + ': ' + a.title)) + '" target="_blank" rel="noopener">' + icon('chat') + 'واتساب</a></div></div>' :
      '<button class="btn btn-primary btn-block" data-act="show-phone">' + icon('phone') + 'إظهار رقم التواصل</button>';
    h += '<div class="note">' + icon('shield') + '<span>' + (a.kind === 'haraj' ? 'قابل البائع في مكان عام، وشيّك على السلعة قبل ما تحوّل أي مبلغ.' : 'التوظيف النظامي ما يطلب منك أي رسوم. لا ترسل فلوس أو صور هويتك قبل عقد واضح.') + '</span></div>';
    h += '<div class="actions">' + (mine ? '<button class="btn btn-gold" data-act="feature" data-id="' + esc(a.id) + '">' + icon('star') + 'ميّز إعلانك</button>' : '') +
      (mine && a.kind === 'haraj' && a.type === 'sell' ? '<button class="btn btn-line" data-act="commission" data-id="' + esc(a.id) + '">' + icon('coins') + 'انباع؟ ادفع العمولة</button>' : '') +
      '<button class="btn btn-soft" data-act="share" data-id="' + esc(a.id) + '">' + icon('link') + 'نسخ الرابط</button>' +
      '<button class="linkish" data-act="report" data-id="' + esc(a.id) + '" style="margin-inline-start:auto">' + icon('flag') + 'إبلاغ</button></div>';
    return sheet(a.kind === 'haraj' ? 'تفاصيل الإعلان' : 'تفاصيل الوظيفة', h, { wide: true });
  }

  function viewerLayer() {
    var v = layer, n = v.imgs.length;
    return '<div class="viewer" role="dialog" aria-modal="true" aria-label="عرض الصور" data-act="viewer-close"><button class="x" data-act="viewer-close" aria-label="إغلاق">' + icon('x') + '</button><img src="' + esc(v.imgs[v.i]) + '" alt="صورة ' + (v.i + 1) + ' من ' + n + '">' +
      (n > 1 ? '<div class="nav"><button data-act="viewer-next">التالية</button><span class="num">' + (v.i + 1) + ' / ' + n + '</span><button data-act="viewer-prev">السابقة</button></div>' : '') + '</div>';
  }

  /* ---------- نشر إعلان: 3 خطوات ---------- */
  function newDraft(kind) {
    var saved = store('poster') || {};
    return { kind: kind || S.section, type: (kind || S.section) === 'job' ? 'hire' : 'sell', cat: S.cat !== 'all' ? S.cat : '', city: saved.city || (S.city !== 'all' ? S.city : ''), title: '', details: '', price: '', condition: '', salary: '', name: saved.name || '', phone: (S.me && S.me.phone) || '', images: [], plan: 'free', pledge: false, agree: false };
  }
  function postSheet() {
    var d = layer.d, st = layer.step, isH = d.kind === 'haraj';
    var h = '<div class="steps" aria-label="الخطوة ' + st + ' من 3"><span class="on"></span><span class="' + (st > 1 ? 'on' : '') + '"></span><span class="' + (st > 2 ? 'on' : '') + '"></span></div>';
    if (st === 1) {
      h += '<div class="kinds" role="group" aria-label="نوع الإعلان"><button class="kind" data-act="d-kind" data-id="haraj" aria-pressed="' + isH + '" data-autofocus><span class="bubble">' + icon('bag') + '</span><b>حراج</b><small>بيع أو اطلب أي شيء: سيارة، جوال، أثاث، عقار...</small></button>' +
        '<button class="kind" data-act="d-kind" data-id="job" aria-pressed="' + !isH + '"><span class="bubble">' + icon('brief') + '</span><b>وظائف</b><small>عندك وظيفة شاغرة، أو تدوّر شغل</small></button></div>';
      h += '<div class="f">' + (isH ? 'وش تبي؟' : 'أنت...') + '<div class="seg" role="group">' + (isH ? segB('sell', 'أبيع') + segB('buy', 'أبحث عن (مطلوب)') : segB('hire', 'أبحث عن موظف') + segB('seek', 'أبحث عن وظيفة')) + '</div></div>';
      h += '<button class="btn btn-primary btn-block" data-act="d-next">التالي: التفاصيل</button>';
    } else if (st === 2) {
      h += '<div class="form">';
      h += '<div class="two"><label class="f">القسم<select class="select" id="d-cat"><option value="">اختر القسم</option>' + cats(d.kind).map(function (c) { return '<option value="' + c[0] + '"' + (d.cat === c[0] ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('') + '</select></label>' +
        '<label class="f">المدينة<select class="select" id="d-city"><option value="">اختر المدينة</option>' + CITIES.map(function (c) { return '<option' + (d.city === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label></div>';
      h += '<label class="f">عنوان الإعلان<input class="input" id="d-title" maxlength="80" value="' + esc(d.title) + '" placeholder="' + (isH ? (d.type === 'buy' ? 'مثال: مطلوب ثلاجة مستعملة نظيفة' : 'مثال: كامري 2019 فل كامل') : (d.type === 'hire' ? 'مثال: مطلوب كاشير لسوبرماركت' : 'مثال: محاسب بخبرة 5 سنوات')) + '"></label>';
      h += '<label class="f">التفاصيل<small>' + (isH ? 'الحالة، المواصفات، سبب البيع...' : 'الخبرة، الدوام، المتطلبات...') + '</small><textarea class="input" id="d-details" maxlength="1200">' + esc(d.details) + '</textarea></label>';
      if (isH) h += '<div class="two">' + (d.type === 'sell' ? '<label class="f">السعر بالريال <small>(اتركه فاضي = على السوم)</small><input class="input num" id="d-price" inputmode="numeric" maxlength="12" value="' + esc(d.price) + '" placeholder="مثال: 45000"></label>' : '') +
        '<label class="f">الحالة<select class="select" id="d-condition"><option value="">غير محدد</option><option value="new"' + (d.condition === 'new' ? ' selected' : '') + '>جديد</option><option value="used"' + (d.condition === 'used' ? ' selected' : '') + '>مستعمل</option></select></label></div>';
      else h += '<label class="f">الراتب <small>(اختياري)</small><input class="input" id="d-salary" maxlength="30" value="' + esc(d.salary) + '" placeholder="مثال: 4,000 ر.س"></label>';
      h += '<div class="two"><label class="f">' + (isH ? 'اسمك' : 'الاسم أو اسم المنشأة') + '<input class="input" id="d-name" maxlength="40" autocomplete="name" value="' + esc(d.name) + '"></label>' +
        '<div class="f">رقم التواصل<div class="input num" style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--surface-2)"><span dir="ltr">' + esc(d.phone) + '</span><span class="badge b-primary">' + icon('check') + 'موثّق</span></div></div></div>';
      h += '<div class="f">الصور <small>(اختياري، حتى ' + MAXPICS + ' صور. الصورة الأولى هي الغلاف)</small><div class="pics">' +
        d.images.map(function (src, i) { return '<div class="pic"><img src="' + esc(src) + '" alt="صورة ' + (i + 1) + '"><button type="button" data-act="d-rmpic" data-i="' + i + '" aria-label="حذف الصورة ' + (i + 1) + '">' + icon('x') + '</button></div>'; }).join('') +
        (d.images.length < MAXPICS ? '<label class="addpic">' + icon('camera') + (layer.picBusy ? 'جاري التجهيز' : 'أضف صورة') + '<input class="vh" type="file" id="d-pics" accept="image/*" multiple' + (layer.picBusy ? ' disabled' : '') + '></label>' : '') +
        '</div><small>لا ترفع صور أشخاص بدون إذنهم، ولا صور هويات أو وثائق.</small></div>';
      h += '<div class="err" id="d-err" role="alert"></div><div class="actions"><button class="btn btn-line" data-act="d-back">رجوع</button><button class="btn btn-primary grow" data-act="d-next"' + (layer.picBusy ? ' disabled' : '') + '>التالي: النشر</button></div></div>';
    } else {
      h += '<div class="f">طريقة النشر<div class="plans" role="radiogroup">' +
        planOpt('free', 'نشر عادي', 'يظهر ' + S.days + ' يوم حسب وقت النشر', 'مجاناً') +
        planOpt('week', 'مميز لمدة أسبوع', isH ? 'يتصدر إعلانات ' + esc(d.city || 'مدينتك') + ' مع شارة «مميز»' : 'يتصدر قسم ' + esc(catOf('job', d.cat)[1]) + ' مع شارة «مميز»', S.plans.week + ' <small>ر.س</small>', true) +
        planOpt('month', 'مميز لمدة شهر', 'أفضل قيمة: 30 يوم في الصدارة', S.plans.month + ' <small>ر.س</small>', true) + '</div></div>';
      if (isH) h += '<label class="check pledge"><input type="checkbox" id="d-pledge"' + (d.pledge ? ' checked' : '') + '><span><b>تعهد العمولة:</b> أتعهد بدفع عمولة الموقع وقدرها <b>1% من قيمة البيع</b> خلال 10 أيام من استلام المبلغ، إذا تم البيع عن طريق الموقع أو بسببه، وهي أمانة في ذمتي. وأعرف إني ما أقدر أحذف الإعلان بنفسي.</span></label>';
      h += '<label class="check"><input type="checkbox" id="d-agree"' + (d.agree ? ' checked' : '') + '><span>أوافق على <a href="terms.html" target="_blank" rel="noopener">شروط الخدمة</a> و<a href="privacy.html" target="_blank" rel="noopener">سياسة الخصوصية</a>، وعلى ظهور اسمي ورقم جوالي وصور الإعلان للزوار.</span></label>';
      h += '<label class="vh" aria-hidden="true">لا تعبّي هذا الحقل<input id="d-website" tabindex="-1" autocomplete="off"></label>';
      h += '<div class="err" id="d-err" role="alert"></div><div class="actions"><button class="btn btn-line" data-act="d-back"' + (layer.busy ? ' disabled' : '') + '>رجوع</button><button class="btn ' + (d.plan === 'free' ? 'btn-primary' : 'btn-gold') + ' grow" data-act="d-submit"' + (layer.busy ? ' disabled' : '') + '>' +
        (layer.busy ? 'جاري النشر...' : d.plan === 'free' ? 'انشر مجاناً' : 'انشر وادفع ' + S.plans[d.plan] + ' ر.س') + '</button></div>';
    }
    return sheet(st === 1 ? 'إعلان جديد' : st === 2 ? (isH ? 'تفاصيل السلعة' : 'تفاصيل الإعلان') : 'النشر', h);
  }
  function segB(v, t) { return '<button data-act="d-type" data-id="' + v + '" aria-pressed="' + (layer.d.type === v) + '">' + t + '</button>'; }
  function planOpt(v, t, s, amt, gold) {
    return '<label class="plan' + (gold ? ' featured-plan' : '') + '"><input type="radio" name="plan" value="' + v + '"' + (layer.d.plan === v ? ' checked' : '') + '><span><b>' + (gold ? icon('star', '') + ' ' : '') + t + '</b><small>' + s + '</small></span><span class="amt num">' + amt + '</span></label>';
  }
  function readDraft() {
    var d = layer && layer.d; if (!d) return;
    ['cat', 'city', 'title', 'details', 'price', 'condition', 'salary', 'name', 'phone'].forEach(function (k) { var el = document.getElementById('d-' + k); if (el) d[k] = el.value.trim(); });
    var p = document.getElementById('d-pledge'); if (p) d.pledge = p.checked;
    var g = document.getElementById('d-agree'); if (g) d.agree = g.checked;
    var r = document.querySelector('input[name="plan"]:checked'); if (r) d.plan = r.value;
  }
  function validateStep2(d) {
    if (!d.cat) return 'اختر القسم'; if (!d.city) return 'اختر المدينة';
    if (d.title.length < 4) return 'اكتب عنوان واضح للإعلان'; if (d.details.length < 10) return 'اكتب تفاصيل أكثر (10 أحرف على الأقل)';
    if (d.kind === 'haraj' && d.type === 'sell' && d.price && !/^\d{1,9}$/.test(d.price.replace(/[,٬\s]/g, ''))) return 'السعر لازم يكون رقم بالريال، بدون كسور';
    if (!d.name) return 'اكتب الاسم';
    return '';
  }
  function setErr(t) { var el = document.getElementById('d-err'); if (el) el.textContent = t; }
  function submitAd() {
    readDraft(); var d = layer.d;
    if (d.kind === 'haraj' && !d.pledge) return setErr('لازم توافق على تعهد العمولة');
    if (!d.agree) return setErr('لازم توافق على الشروط وسياسة الخصوصية');
    var hp = document.getElementById('d-website');
    var body = { kind: d.kind, type: d.type, cat: d.cat, city: d.city, title: d.title, details: d.details, price: d.kind === 'haraj' && d.type === 'sell' ? d.price.replace(/[,٬\s]/g, '') : '', condition: d.condition, salary: d.salary, name: d.name, images: d.images, pledge: d.kind === 'haraj' ? d.pledge : undefined, agree: d.agree, website: hp ? hp.value : '' };
    layer.busy = true; renderLayer();
    store('poster', { name: d.name, city: d.city });
    post('/api/ads', body).then(function (j) {
      S.myIds.unshift(j.id); S.mine = null; loadAds(true); loadMe();
      if (d.plan !== 'free') return startFeature(j.id, d.plan, true);
      layer = { name: 'result', kind: 'posted', ad_id: j.id }; renderLayer(true); haptic('success');
    }).catch(function (j) {
      if (j && j.login) { S.me = null; var keep = layer; openLayer({ name: 'login', step: 'phone', phone: '', channel: 'whatsapp', then: function () { layer = keep; keep.busy = false; keep.d.phone = S.me.phone; renderLayer(true); } }); return; }
      layer.busy = false; renderLayer(); setErr((j && j.error) || 'تعذر النشر، تأكد من الإنترنت وحاول مرة ثانية');
    });
  }
  function startFeature(adId, plan, justPosted) {
    return post('/api/feature', { ad_id: adId, plan: plan }).then(function (j) { location.href = j.url; })
      .catch(function (j) {
        if (justPosted) { layer = { name: 'result', kind: 'posted', ad_id: adId, note: 'انتشر إعلانك مجاناً، بس ' + ((j && j.error) || 'تعذر فتح صفحة الدفع') + '. تقدر تميّزه بعدين من «إعلاناتي».' }; renderLayer(true); }
        else { layer.busy = false; renderLayer(); setErr((j && j.error) || 'تعذر فتح صفحة الدفع'); }
      });
  }

  /* ---------- تمييز إعلان ---------- */
  function featureSheet() {
    var l = layer, a = l.ad;
    var where = a ? (a.kind === 'haraj' ? 'أول إعلانات ' + esc(a.city) : 'أول قسم ' + esc(catOf('job', a.cat)[1])) : 'أول قائمته';
    var h = (a ? '<div class="note">' + icon('star') + '<span>«' + esc(a.title) + '»</span></div>' : '') +
      '<p style="color:var(--ink-2)">إعلانك يطلع في ' + where + ' مع شارة «مميز» ذهبية. لو كان مميز من قبل، المدة تنضاف على المدة الحالية.</p>' +
      '<div class="plans" role="radiogroup">' +
      '<label class="plan featured-plan"><input type="radio" name="fplan" value="week"' + (l.plan === 'week' ? ' checked' : '') + '><span><b>أسبوع</b><small>7 أيام في الصدارة</small></span><span class="amt num">' + S.plans.week + ' <small>ر.س</small></span></label>' +
      '<label class="plan featured-plan"><input type="radio" name="fplan" value="month"' + (l.plan === 'month' ? ' checked' : '') + '><span><b>شهر</b><small>30 يوم في الصدارة</small></span><span class="amt num">' + S.plans.month + ' <small>ر.س</small></span></label></div>' +
      '<div class="err" id="d-err" role="alert"></div><button class="btn btn-gold btn-block" data-act="f-pay"' + (l.busy ? ' disabled' : '') + ' data-autofocus>' + icon('lock') + (l.busy ? 'جاري فتح صفحة الدفع...' : 'ادفع بأمان عبر ميسر') + '</button>' +
      '<div class="note">' + icon('shield') + '<span>الدفع بمدى أو Apple Pay أو البطاقة. التمييز يبدأ أول ما ينجح الدفع.</span></div>';
    return sheet('ميّز إعلانك', h);
  }

  /* ---------- العمولة ---------- */
  function commissionSheet() {
    var l = layer, a = l.ad;
    var h = '<p style="color:var(--ink-2)">النشر في الحراج مجاني، وعمولة الموقع <b>1% من قيمة البيع</b> يدفعها البائع بعد البيع. العمولة أمانة في ذمة المعلن، وتساعدنا نخلي الموقع مجاني للجميع.</p>' +
      (a ? '<div class="note">' + icon('bag') + '<span>عن إعلان: «' + esc(a.title) + '»</span></div>' : '') +
      '<label class="f">قيمة البيع بالريال<input class="input num" id="c-sale" inputmode="numeric" maxlength="12" placeholder="مثال: 45000" value="' + esc(l.sale || '') + '" data-autofocus></label>' +
      (a ? '' : '<label class="f">رقم الإعلان <small>(اختياري، أول 8 خانات تكفي من صفحة الإعلان)</small><input class="input" id="c-ad" dir="ltr" maxlength="36" value="' + esc(l.adRef || '') + '"></label>') +
      '<div class="calc"><span>العمولة المستحقة</span><span class="amt num" id="c-amt">' + commissionText(l.sale) + '</span></div>' +
      '<div class="err" id="d-err" role="alert"></div><button class="btn btn-gold btn-block" data-act="c-pay"' + (l.busy ? ' disabled' : '') + '>' + icon('lock') + (l.busy ? 'جاري فتح صفحة الدفع...' : 'ادفع العمولة بأمان') + '</button>';
    return sheet('دفع العمولة', h);
  }
  function commissionText(v) {
    var n = Number(String(v || '').replace(/[,٬\s]/g, ''));
    if (!n || n < 1 || !Number.isFinite(n)) return '0 ر.س';
    var c = Math.max(1, Math.round(n * 0.01 * 100) / 100);
    return c.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ر.س';
  }
  function payCommission() {
    var sale = (document.getElementById('c-sale').value || '').replace(/[,٬\s]/g, '');
    if (!/^\d{1,9}$/.test(sale) || Number(sale) < 1) return setErr('اكتب قيمة البيع بالريال، رقم صحيح بدون كسور');
    var adId = layer.ad ? layer.ad.id : '';
    var ref = document.getElementById('c-ad');
    if (!adId && ref && ref.value.trim()) {
      var v = ref.value.trim().toLowerCase();
      var hit = S.ads.filter(function (a) { return a.id.indexOf(v) === 0; })[0] || (S.myIds.filter(function (x) { return x.indexOf(v) === 0; }).map(function (x) { return { id: x }; })[0]);
      if (!hit && !/^[0-9a-f-]{36}$/.test(v)) return setErr('ما لقينا إعلان بهذا الرقم. تأكد منه أو اتركه فاضي');
      adId = hit ? hit.id : v;
    }
    layer.sale = sale; layer.busy = true; renderLayer();
    post('/api/commission', { sale_amount: Number(sale), ad_id: adId || undefined }).then(function (j) { location.href = j.url; })
      .catch(function (j) { layer.busy = false; renderLayer(); setErr((j && j.error) || 'تعذر فتح صفحة الدفع'); });
  }

  /* ---------- البلاغ ---------- */
  function reportSheet() {
    var l = layer;
    if (l.done) return sheet('شكراً لك', '<div class="big-ok"><span class="ring">' + icon('check') + '</span><h3>وصلنا بلاغك</h3><p>نراجع البلاغات يومياً ونحذف أي إعلان مخالف.</p></div><button class="btn btn-primary btn-block" data-act="close" data-autofocus>تم</button>');
    var h = '<div class="plans" role="radiogroup" aria-label="سبب البلاغ">' + REASONS.map(function (r, i) { return '<label class="plan" style="grid-template-columns:auto 1fr"><input type="radio" name="reason" value="' + r[0] + '"' + (i === 0 ? ' data-autofocus' : '') + '><span><b>' + r[1] + '</b></span></label>'; }).join('') + '</div>' +
      '<label class="f">ملاحظة <small>(اختياري)</small><textarea class="input" id="r-note" maxlength="300" style="min-height:80px"></textarea></label>' +
      '<div class="err" id="d-err" role="alert"></div><button class="btn btn-danger btn-block" data-act="r-send"' + (l.busy ? ' disabled' : '') + '>' + icon('flag') + 'أرسل البلاغ</button>';
    return sheet('إبلاغ عن إعلان', h);
  }

  /* ---------- نتيجة الدفع / النشر ---------- */
  function resultSheet() {
    var r = layer, h;
    if (r.kind === 'checking') h = '<div class="big-ok"><span class="ring">' + icon('clock') + '</span><h3>نتأكد من الدفع...</h3><p>ثواني بس.</p></div>';
    else if (r.kind === 'posted') h = '<div class="big-ok"><span class="ring">' + icon('check') + '</span><h3>انتشر إعلانك</h3><p>' + esc(r.note || 'إعلانك ظاهر الحين للجميع لمدة ' + S.days + ' يوم. تقدر تلقاه في «إعلاناتي».') + '</p></div>' +
      '<div class="actions"><button class="btn btn-primary grow" data-act="open" data-id="' + esc(r.ad_id) + '" data-autofocus>شوف إعلانك</button><button class="btn btn-gold grow" data-act="feature" data-id="' + esc(r.ad_id) + '">' + icon('star') + 'ميّزه</button></div>';
    else if (r.kind === 'feature-ok') h = '<div class="big-ok"><span class="ring">' + icon('star') + '</span><h3>تم تمييز إعلانك</h3><p>إعلانك في الصدارة' + (r.until ? ' حتى ' + dateAr(r.until) : '') + '. الله يرزقك.</p></div><button class="btn btn-primary btn-block" data-act="open" data-id="' + esc(r.ad_id || '') + '" data-autofocus>شوف إعلانك</button>';
    else if (r.kind === 'commission-ok') h = '<div class="big-ok"><span class="ring">' + icon('check') + '</span><h3>وصلت العمولة، شكراً لأمانتك</h3><p>الله يبارك لك في رزقك.</p></div><button class="btn btn-primary btn-block" data-act="close" data-autofocus>تم</button>';
    else if (r.kind === 'pending') h = '<div class="big-ok"><span class="ring">' + icon('clock') + '</span><h3>ما وصلنا تأكيد الدفع للحين</h3><p>' + (r.cancel ? 'يبدو إنك رجعت قبل ما يكتمل الدفع، وما انخصم شيء.' : 'لو دفعت، انتظر دقيقة وتحقق مرة ثانية.') + '</p></div><div class="actions"><button class="btn btn-primary grow" data-act="recheck" data-autofocus>تحقق مرة ثانية</button><button class="btn btn-line grow" data-act="close">إغلاق</button></div>';
    else h = '<div class="big-ok"><span class="ring">' + icon('refresh') + '</span><h3>ما قدرنا نتأكد من الدفع</h3><p>حاول بعد شوي. لو انخصم المبلغ ولا تفعّل شيء، تواصل معنا.</p></div><button class="btn btn-primary btn-block" data-act="recheck" data-autofocus>تحقق مرة ثانية</button>';
    return sheet('', h);
  }
  function checkPay(pid, cancel) {
    layer = { name: 'result', kind: 'checking', pid: pid, cancel: cancel }; lastFocus = null; renderLayer(true);
    api('/api/confirm?p=' + encodeURIComponent(pid)).then(function (j) {
      if (j.status === 'paid') {
        layer = j.kind === 'feature' ? { name: 'result', kind: 'feature-ok', until: j.featured_until, ad_id: j.ad_id, pid: pid } : { name: 'result', kind: 'commission-ok', pid: pid };
        loadAds(true); S.mine = null; if (loggedIn()) loadMe();
      } else layer = { name: 'result', kind: j.status === 'pending' ? 'pending' : 'error', pid: pid, cancel: cancel };
      renderLayer(true); if (j.status === 'paid') haptic('success');
    }).catch(function () { layer = { name: 'result', kind: 'error', pid: pid }; renderLayer(true); });
  }

  /* ---------- تسجيل الدخول برقم الجوال ---------- */
  function loginSheet() {
    var l = layer, h;
    if (l.step === 'phone') {
      h = '<p style="color:var(--ink-2)">التصفح مجاني للجميع. عشان تنشر إعلان، سجّل دخولك برقم جوالك ونرسل لك كود تحقق.</p>' +
        '<label class="f">رقم الجوال<input class="input num" id="l-phone" inputmode="tel" autocomplete="tel" dir="ltr" style="text-align:right;font-size:18px" maxlength="14" placeholder="05xxxxxxxx" value="' + esc(l.phone) + '" data-autofocus></label>' +
        '<div class="f">وين نرسل الكود؟<div class="seg" role="group">' +
        '<button data-act="l-channel" data-id="whatsapp" aria-pressed="' + (l.channel === 'whatsapp') + '">' + icon('chat') + ' واتساب</button>' +
        '<button data-act="l-channel" data-id="sms" aria-pressed="' + (l.channel === 'sms') + '">' + icon('phone') + ' رسالة نصية</button></div></div>' +
        '<div class="err" id="d-err" role="alert"></div><button class="btn btn-primary btn-block" data-act="l-send"' + (l.busy ? ' disabled' : '') + '>' + (l.busy ? 'جاري الإرسال...' : 'أرسل الكود') + '</button>' +
        '<div class="note">' + icon('lock') + '<span>نستخدم رقمك للدخول وللتواصل في إعلاناتك فقط. بالمتابعة توافق على <a href="terms.html" target="_blank" rel="noopener">الشروط</a> و<a href="privacy.html" target="_blank" rel="noopener">الخصوصية</a>.</span></div>';
      return sheet('تسجيل الدخول', h);
    }
    var wait = Math.max(0, Math.ceil((l.resendAt - Date.now()) / 1000));
    h = '<p style="color:var(--ink-2)">أرسلنا كود التحقق ' + (l.channel === 'sms' ? 'برسالة نصية' : 'على واتساب') + ' للرقم <b dir="ltr" class="num">' + esc(l.phone) + '</b></p>' +
      '<label class="f">كود التحقق<input class="input num" id="l-code" inputmode="numeric" autocomplete="one-time-code" dir="ltr" maxlength="8" style="text-align:center;font-size:24px;letter-spacing:8px" placeholder="••••••" data-autofocus></label>' +
      '<div class="err" id="d-err" role="alert"></div><button class="btn btn-primary btn-block" data-act="l-verify"' + (l.busy ? ' disabled' : '') + '>' + (l.busy ? 'جاري التحقق...' : 'تأكيد') + '</button>' +
      '<div class="actions" style="justify-content:space-between"><button class="linkish" data-act="l-edit">تغيير الرقم</button>' +
      (wait > 0 ? '<span class="linkish" id="l-wait">إعادة الإرسال بعد <span class="num">' + wait + '</span> ث</span>' :
        '<span class="actions"><button class="btn btn-soft btn-sm" data-act="l-resend" data-id="' + l.channel + '">أعد الإرسال</button><button class="btn btn-soft btn-sm" data-act="l-resend" data-id="' + (l.channel === 'sms' ? 'whatsapp' : 'sms') + '">' + (l.channel === 'sms' ? 'على واتساب' : 'برسالة نصية') + '</button></span>') + '</div>';
    return sheet('أدخل الكود', h);
  }
  var waitTimer = null;
  function tickWait() {
    clearInterval(waitTimer);
    waitTimer = setInterval(function () {
      if (!layer || layer.name !== 'login' || layer.step !== 'code') return clearInterval(waitTimer);
      var w = Math.ceil((layer.resendAt - Date.now()) / 1000), el = document.querySelector('#l-wait .num');
      if (w <= 0) { clearInterval(waitTimer); var code = (document.getElementById('l-code') || {}).value || ''; renderLayer(); var c = document.getElementById('l-code'); if (c) { c.value = code; } }
      else if (el) el.textContent = w;
    }, 1000);
  }
  function sendCode(channel) {
    var l = layer, input = document.getElementById('l-phone');
    if (input) l.phone = input.value.trim();
    var phone = l.phone.replace(/[\s-]/g, '').replace(/^\+?966/, '0').replace(/^5/, '05');
    if (!/^05\d{8}$/.test(phone)) return setErr('اكتب رقم جوال سعودي صحيح، مثال: 0512345678');
    l.phone = phone; l.channel = channel || l.channel; l.busy = true; renderLayer();
    post('/api/auth', { action: 'send', phone: phone, channel: l.channel }).then(function () {
      l.busy = false; l.step = 'code'; l.resendAt = Date.now() + 60e3; renderLayer(true); tickWait();
    }).catch(function (j) { l.busy = false; renderLayer(); setErr((j && j.error) || 'تعذر الإرسال، حاول مرة ثانية'); });
  }
  function verifyCode() {
    var l = layer, code = ((document.getElementById('l-code') || {}).value || '').replace(/\D/g, '');
    if (code.length < 4) return setErr('اكتب الكود اللي وصلك');
    l.busy = true; renderLayer();
    post('/api/auth', { action: 'verify', phone: l.phone, code: code }).then(function (j) {
      S.me = { phone: j.phone }; S.mine = null; haptic('success'); toast('أهلاً فيك، تم تسجيل دخولك');
      var then = l.then; closeLayer(); loadMe(); renderPage();
      if (typeof then === 'function') then();
    }).catch(function (j) { l.busy = false; renderLayer(); haptic('error'); setErr((j && j.error) || 'تعذر التحقق، حاول مرة ثانية'); var c = document.getElementById('l-code'); if (c) { c.focus(); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); } });
  }
  function accountSheet() {
    return sheet('حسابي', '<div class="seller"><span class="av" aria-hidden="true">' + icon('user') + '</span><div class="who"><b dir="ltr" class="num" style="text-align:right">' + esc(S.me.phone) + '</b><small>رقمك الموثّق</small></div></div>' +
      '<div class="menu"><button data-act="nav" data-view="mine" data-autofocus>' + icon('list') + 'إعلاناتي</button><button data-act="post">' + icon('plus') + 'أضف إعلان</button><button data-act="commission">' + icon('coins') + 'دفع عمولة البيع</button><button data-act="logout">' + icon('arrow') + 'تسجيل الخروج</button></div>');
  }

  function moreSheet() {
    var dark = effectiveTheme() === 'dark';
    return sheet('المزيد', '<div class="menu">' + (loggedIn() ? '<button data-act="account" data-autofocus>' + icon('user') + 'حسابي <span dir="ltr" class="num" style="color:var(--muted)">' + esc(S.me.phone) + '</span></button>' : '<button data-act="login" data-autofocus>' + icon('user') + 'تسجيل الدخول</button>') + '<button data-act="commission">' + icon('coins') + 'دفع عمولة البيع</button><button data-act="theme">' + icon(dark ? 'sun' : 'moon') + (dark ? 'النمط النهاري' : 'النمط الليلي') + '</button>' +
      '<a href="terms.html">' + icon('doc') + 'شروط الخدمة</a><a href="privacy.html">' + icon('lock') + 'سياسة الخصوصية</a>' +
      (I.email ? '<a href="mailto:' + esc(I.email) + '">' + icon('chat') + 'تواصل معنا: <span dir="ltr">' + esc(I.email) + '</span></a>' : '') +
      (I.whatsapp ? '<a href="' + esc(waLink(I.whatsapp)) + '" target="_blank" rel="noopener">' + icon('phone') + 'واتساب الدعم</a>' : '') + '</div>');
  }

  /* ---------------- لوحة الإدارة (/?admin) ---------------- */
  function adminView() {
    if (!A.data) return '<section class="hero" style="max-width:420px;margin:30px auto"><h1>لوحة الإدارة</h1><p>للمالك فقط. كلمة المرور هي قيمة ADMIN_PASSWORD في Vercel.</p><div class="form" style="margin-top:16px"><label class="f">كلمة المرور<input class="input" id="a-pw" type="password" autocomplete="current-password" dir="ltr"></label><div class="err" id="a-err" role="alert"></div><button class="btn btn-primary" data-act="a-login">دخول</button></div></section>';
    var d = A.data, rep = {}, now = Date.now();
    d.reports.forEach(function (r) { (rep[r.ad_id] = rep[r.ad_id] || []).push(r); });
    var paid = d.payments.filter(function (p) { return p.status === 'paid'; });
    var sum = function (k) { return paid.filter(function (p) { return p.kind === k; }).reduce(function (s, p) { return s + p.amount; }, 0) / 100; };
    var h = '<section class="hero"><h1>لوحة الإدارة</h1></section><div class="stats">' +
      stat('إعلانات نشطة', d.ads.length) + stat('عليها بلاغات', Object.keys(rep).length) + stat('مميزة الحين', d.ads.filter(isFeat).length) +
      stat('دخل التمييز', money(sum('feature')) + ' ر.س') + stat('دخل العمولات', money(sum('commission')) + ' ر.س') +
      (typeof d.authentica_balance === 'number' ? stat('رصيد Authentica', money(d.authentica_balance)) : '') + '</div>' +
      (typeof d.authentica_balance === 'number' && d.authentica_balance < 200 ? '<div class="note" role="alert" style="margin-top:12px">' + icon('phone') + '<span>رصيد Authentica قليل. اشحنه من portal.authentica.sa قبل ما توقف أكواد الدخول.</span></div>' : '');
    h += '<div class="tabs" style="margin:18px 0 12px">' + atab('reports', 'البلاغات') + atab('ads', 'كل الإعلانات') + atab('payments', 'المدفوعات') + '<button class="btn btn-soft btn-sm" data-act="a-refresh">' + icon('refresh') + 'تحديث</button><button class="btn btn-line btn-sm" data-act="a-logout" style="margin-inline-start:auto">' + icon('arrow') + 'خروج</button></div>';
    if (A.tab === 'payments') {
      h += '<div class="table-wrap"><table><thead><tr><th>النوع</th><th>المبلغ</th><th>الحالة</th><th>التفاصيل</th><th>التاريخ</th><th></th></tr></thead><tbody>' +
        d.payments.map(function (p) {
          return '<tr><td>' + (p.kind === 'feature' ? 'تمييز ' + (p.plan === 'month' ? 'شهر' : 'أسبوع') : 'عمولة') + '</td><td class="num">' + money(p.amount / 100) + ' ر.س</td><td>' + (p.status === 'paid' ? '<span class="badge b-primary">مدفوع</span>' : '<span class="badge b-soft">لم يكتمل</span>') + '</td>' +
            '<td>' + (p.sale_amount ? 'بيع بـ ' + money(p.sale_amount) + ' ر.س' : '') + (p.ad_id ? ' <span dir="ltr" class="num">' + esc(p.ad_id.slice(0, 8)) + '</span>' : '') + '</td><td>' + ago(p.created_at) + '</td>' +
            '<td>' + (p.status === 'pending' ? '<button class="btn btn-soft btn-sm" data-act="a-recheck" data-id="' + esc(p.id) + '">تحقق</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      if (!d.payments.length) h += '<div class="empty"><p>ما فيه مدفوعات للحين.</p></div>';
      return h;
    }
    var list = d.ads.filter(function (a) { return A.tab === 'ads' ? (A.kind === 'all' || a.kind === A.kind) : rep[a.id]; });
    if (A.tab === 'reports') list.sort(function (a, b) { return rep[b.id].length - rep[a.id].length; });
    if (A.tab === 'ads') h += '<div class="chips" style="margin-bottom:12px">' + akind('all', 'الكل') + akind('haraj', 'الحراج') + akind('job', 'الوظائف') + '</div>';
    if (!list.length) return h + '<div class="empty">' + icon('check') + '<h3>' + (A.tab === 'reports' ? 'ما فيه بلاغات' : 'ما فيه إعلانات') + '</h3></div>';
    h += '<div class="list">' + list.map(function (a) {
      var rs = rep[a.id] || [], img = safeImg((a.images || [])[0]);
      return '<div class="admin-row' + (rs.length ? ' flagged' : '') + '"><div class="avatar">' + (img ? '<img src="' + esc(img) + '" alt="">' : icon(catOf(a.kind, a.cat)[2])) + '</div><div style="min-width:0;display:flex;flex-direction:column;gap:6px">' +
        '<div class="actions"><span class="badge b-soft">' + (a.kind === 'haraj' ? 'حراج' : 'وظائف') + ' · ' + esc(catOf(a.kind, a.cat)[1]) + '</span>' + (isFeat(a) ? '<span class="badge b-gold">مميز</span>' : '') + (rs.length ? '<span class="badge b-danger">' + rs.length + ' بلاغ</span>' : '') + '</div>' +
        '<b>' + esc(a.title) + '</b><span style="color:var(--muted);font-size:13px">' + esc(a.city) + ' · ' + esc(a.name) + ' · <span dir="ltr">' + esc(a.phone) + '</span> · ' + ago(a.created_at) + '</span>' +
        (rs.length ? '<span style="font-size:13px;color:var(--danger)">' + rs.slice(0, 3).map(function (r) { return esc((REASONS.filter(function (x) { return x[0] === r.reason; })[0] || [0, r.reason])[1]) + (r.note ? ': ' + esc(r.note) : ''); }).join(' · ') + '</span>' : '') +
        '<div class="actions"><button class="btn btn-soft btn-sm" data-act="a-view" data-id="' + esc(a.id) + '">عرض</button>' + (rs.length ? '<button class="btn btn-line btn-sm" data-act="a-dismiss" data-id="' + esc(a.id) + '">تجاهل البلاغات</button>' : '') + '<button class="btn btn-danger btn-sm" data-act="a-remove" data-id="' + esc(a.id) + '">' + icon('trash') + 'حذف</button></div></div></div>';
    }).join('') + '</div>';
    return h;
  }
  function stat(t, v) { return '<div class="stat"><small>' + t + '</small><b class="num">' + v + '</b></div>'; }
  function atab(v, t) { return '<button class="chip" data-act="a-tab" data-id="' + v + '" aria-pressed="' + (A.tab === v) + '">' + t + '</button>'; }
  function akind(v, t) { return '<button class="chip" data-act="a-kind" data-id="' + v + '" aria-pressed="' + (A.kind === v) + '">' + t + '</button>'; }
  function adminCall(body) { body.password = A.pw; return post('/api/admin', body).catch(function (j) { if (j && j.httpStatus === 401 && A.data) { A.data = null; ss('dk-admin', null); renderPage(); toast('انتهت الجلسة، ادخل كلمة المرور مرة ثانية'); } throw j; }); }
  function adminRefresh() { return adminCall({ action: 'list' }).then(function (j) { A.data = j; renderPage(); }); }

  /* ---------------- ضغط الصور قبل الرفع ---------------- */
  function compress(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var max = 1400, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
        var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        var q = 0.82, d = c.toDataURL('image/jpeg', q); while (d.length > 760000 && q > 0.4) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
        if (d.indexOf('data:image/jpeg') !== 0 || d.length > 1000000) return rej('big'); res(d);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej('decode'); };
      img.src = url;
    });
  }
  function addPics(files) {
    readDraft();
    var d = layer.d, room = MAXPICS - d.images.length, list = Array.prototype.slice.call(files, 0, Math.max(0, room)), failed = 0;
    if (!list.length) return;
    layer.picBusy = true; renderLayer();
    list.reduce(function (p, f) { return p.then(function () { return compress(f).then(function (x) { d.images.push(x); }, function () { failed++; }); }); }, Promise.resolve())
      .then(function () { if (!layer || layer.name !== 'post') return; layer.picBusy = false; renderLayer(); if (failed) toast('ما قدرنا نقرأ ' + failed + ' صورة. جرّب صيغة JPG أو PNG'); else if (files.length > room) toast('الحد الأقصى ' + MAXPICS + ' صور'); });
  }

  /* ---------------- الأحداث ---------------- */
  function openAd(id) {
    var a = findAd(id) || (S.mine && S.mine.filter(function (x) { return x.id === id && x.ok; })[0]) || null;
    openLayer({ name: 'detail', ad: a, showPhone: false });
    if (!a) getAd(id).then(function (x) { if (layer && layer.name === 'detail') { layer.ad = x; renderLayer(); } }, function () { if (layer && layer.name === 'detail') { layer.error = true; renderLayer(); } });
  }
  function adFor(id) { return findAd(id) || (S.mine && S.mine.filter(function (x) { return x.id === id && x.ok; })[0]) || (layer && layer.ad && layer.ad.id === id ? layer.ad : null); }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]'); if (!t) return;
    var act = t.getAttribute('data-act'), id = t.getAttribute('data-id');
    if ((act === 'scrim' || act === 'viewer-close') && e.target !== t && !t.classList.contains('x')) return;
    if (t.tagName === 'A' && act === 'home') e.preventDefault();
    switch (act) {
      case 'home': S.view = 'home'; S.cat = 'all'; S.type = 'all'; S.q = ''; renderPage(); window.scrollTo(0, 0); break;
      case 'nav': if (layer) closeLayer(); S.view = t.getAttribute('data-view'); if (t.getAttribute('data-sec') && S.section !== t.getAttribute('data-sec')) { S.section = t.getAttribute('data-sec'); S.cat = 'all'; S.type = 'all'; S.limit = 24; } if (S.view === 'mine') S.mine = null; renderPage(); window.scrollTo(0, 0); break;
      case 'section': S.section = id; S.cat = 'all'; S.type = 'all'; S.limit = 24; renderPage(); break;
      case 'cat': S.cat = id; S.limit = 24; renderPage(); break;
      case 'type': S.type = id; S.limit = 24; renderPage(); break;
      case 'more-ads': S.limit += 24; renderPage(); break;
      case 'reload': S.loaded = false; renderPage(); loadAds(true); break;
      case 'theme': toggleTheme(t); break;
      case 'open': openAd(id); break;
      case 'close': closeLayer(); break;
      case 'scrim': if (!(layer && layer.busy)) closeLayer(); break;
      case 'show-phone':
        if (layer.ad.phone) { layer.showPhone = true; renderLayer(); break; }
        t.disabled = true;
        api('/api/ad?id=' + encodeURIComponent(layer.ad.id) + '&phone=1').then(function (j) {
          if (!layer || layer.name !== 'detail') return;
          layer.ad = Object.assign({}, layer.ad, { phone: j.phone }); layer.showPhone = true; renderLayer();
        }).catch(function (j) { t.disabled = false; toast((j && j.error) || 'تعذر إظهار الرقم، حاول مرة ثانية'); });
        break;
      case 'copy-phone': copy(layer.ad.phone, 'تم نسخ الرقم'); break;
      case 'share': copy(location.origin + '/?ad=' + encodeURIComponent(id), 'تم نسخ رابط الإعلان'); break;
      case 'viewer': lastFocus = t; layer = { name: 'viewer', imgs: (layer.ad.images || []).map(safeImg).filter(Boolean), i: Number(t.getAttribute('data-i')) || 0, back: layer }; renderLayer(true); break;
      case 'viewer-close': var back = layer.back; layer = back; noAnimOnce = true; renderLayer(); break;
      case 'viewer-next': case 'viewer-prev': var n = layer.imgs.length, dir = act === 'viewer-next' ? 1 : -1; layer.i = (layer.i + dir + n) % n; layer.from = dir === 1 ? -1 : 1; renderLayer(); layer.from = 0; break;
      case 'report': openLayer({ name: 'report', ad_id: id }); break;
      case 'r-send':
        var rr = document.querySelector('input[name="reason"]:checked'); if (!rr) return setErr('اختر سبب البلاغ');
        layer.busy = true; renderLayer();
        post('/api/report', { ad_id: layer.ad_id, reason: rr.value, note: (document.getElementById('r-note') || {}).value || '' }).then(function () { layer.done = true; renderLayer(true); })
          .catch(function (j) { layer.busy = false; renderLayer(); setErr((j && j.error) || 'تعذر الإرسال'); });
        break;
      case 'more': openLayer({ name: 'more' }); break;
      case 'post': if (layer) closeLayer(); requireLogin(function () { openLayer({ name: 'post', step: 1, d: newDraft() }); }); break;
      case 'login': if (layer) closeLayer(); requireLogin(function () { renderPage(); }); break;
      case 'account': if (layer) closeLayer(); if (loggedIn()) openLayer({ name: 'account' }); else requireLogin(function () { renderPage(); }); break;
      case 'logout': post('/api/auth', { action: 'logout' }).finally(function () { S.me = null; S.mine = null; S.myIds = []; closeLayer(); toast('تم تسجيل الخروج'); renderPage(); }); break;
      case 'l-channel': var pi = document.getElementById('l-phone'); if (pi) layer.phone = pi.value; layer.channel = id; renderLayer(); break;
      case 'l-send': sendCode(); break;
      case 'l-resend': sendCode(id); break;
      case 'l-edit': layer.step = 'phone'; renderLayer(true); break;
      case 'l-verify': verifyCode(); break;
      case 'd-kind': layer.d = newDraft(id); renderLayer(); break;
      case 'd-type': layer.d.type = id; renderLayer(); break;
      case 'd-rmpic': readDraft(); layer.d.images.splice(Number(t.getAttribute('data-i')), 1); renderLayer(); break;
      case 'd-back': readDraft(); layer.step--; renderLayer(true); break;
      case 'd-next':
        readDraft();
        if (layer.step === 2) { var er = validateStep2(layer.d); if (er) return setErr(er); }
        layer.step++; renderLayer(true); break;
      case 'd-submit': submitAd(); break;
      case 'feature': var fa = adFor(id); openLayer({ name: 'feature', ad: fa, ad_id: id, plan: 'week' }); break;
      case 'f-pay':
        var fp = document.querySelector('input[name="fplan"]:checked'); layer.plan = fp ? fp.value : 'week'; layer.busy = true; renderLayer();
        startFeature(layer.ad_id, layer.plan, false); break;
      case 'commission': openLayer({ name: 'commission', ad: id ? adFor(id) : null }); break;
      case 'c-pay': payCommission(); break;
      case 'recheck': checkPay(layer.pid, false); break;
      case 'a-login':
        A.pw = document.getElementById('a-pw').value;
        t.disabled = true;
        adminRefresh().then(function () { ss('dk-admin', A.pw); }).catch(function (j) { t.disabled = false; var el = document.getElementById('a-err'); if (el) el.textContent = (j && j.error) || 'تعذر الدخول'; });
        break;
      case 'a-logout': A.pw = ''; A.data = null; ss('dk-admin', null); renderPage(); break;
      case 'a-tab': A.tab = id; renderPage(); break;
      case 'a-kind': A.kind = id; renderPage(); break;
      case 'a-refresh': adminRefresh().then(function () { toast('تم التحديث'); }); break;
      case 'a-view': var av = A.data.ads.filter(function (x) { return x.id === id; })[0]; openLayer({ name: 'detail', ad: av, showPhone: true }); break;
      case 'a-remove':
        if (t.getAttribute('data-sure') !== '1') { t.setAttribute('data-sure', '1'); t.textContent = 'متأكد؟ اضغط مرة ثانية'; return; }
        adminCall({ action: 'remove', id: id }).then(function () { toast('انحذف الإعلان'); return adminRefresh(); }).catch(function (j) { toast((j && j.error) || 'تعذر الحذف'); }); break;
      case 'a-dismiss': adminCall({ action: 'dismiss_reports', id: id }).then(function () { toast('تم تجاهل البلاغات'); return adminRefresh(); }); break;
      case 'a-recheck': adminCall({ action: 'recheck_payment', id: id }).then(function (j) { toast(j.status === 'paid' ? 'مدفوع وتم تطبيقه' : 'ما اندفع'); return adminRefresh(); }); break;
    }
  });
  var qTimer;
  document.addEventListener('input', function (e) {
    var id = e.target.id;
    if (id === 'q') { clearTimeout(qTimer); var v = e.target.value; qTimer = setTimeout(function () { S.q = v; S.limit = 24; renderPage(); }, 220); }
    else if (id === 'c-sale') { var el = document.getElementById('c-amt'); if (el) el.textContent = commissionText(e.target.value); }
    else if (id === 'l-code' && e.target.value.replace(/\D/g, '').length === 6 && layer && !layer.busy) verifyCode();
  });
  document.addEventListener('change', function (e) {
    var id = e.target.id;
    if (id === 'city') { S.city = e.target.value; S.limit = 24; renderPage(); }
    else if (id === 'd-pics' && e.target.files && e.target.files.length) addPics(e.target.files);
    else if (e.target.name === 'plan' && layer && layer.d) { readDraft(); renderLayer(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && layer && !layer.busy) { if (layer.name === 'viewer') { layer = layer.back; noAnimOnce = true; renderLayer(); } else closeLayer(); }
    if (e.key === 'Enter' && e.target.id === 'a-pw') { var b = document.querySelector('[data-act="a-login"]'); if (b) b.click(); }
    if (e.key === 'Enter' && e.target.id === 'l-phone') { e.preventDefault(); sendCode(); }
    if (e.key === 'Enter' && e.target.id === 'l-code') { e.preventDefault(); verifyCode(); }
    if (layer && layer.name === 'viewer' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { var n = layer.imgs.length; layer.i = (layer.i + (e.key === 'ArrowLeft' ? 1 : -1) + n) % n; renderLayer(); }
    if (e.key === 'Tab' && layer) { // إبقاء التركيز داخل النافذة المفتوحة
      var box = document.querySelector('#layer .sheet, #layer .viewer'); if (!box) return;
      var f = box.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]):not([tabindex="-1"]),select,textarea'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') e.target.classList.add('broken'); }, true); // صورة ما حمّلت: نخفيها ويظهر الرمز البديل
  document.addEventListener('scroll', function (e) { // نقاط معرض الصور
    if (!e.target || e.target.id !== 'gal') return;
    var g = e.target, i = Math.round(Math.abs(g.scrollLeft) / g.clientWidth), dots = document.querySelectorAll('.dots i');
    dots.forEach(function (d, k) { d.className = k === i ? 'on' : ''; });
  }, true);

  // حافة التمرير: خط الشريط العلوي يظهر فقط لما المحتوى يمر تحته
  var scrolledFlag = false;
  window.addEventListener('scroll', function () {
    var on = window.scrollY > 4; if (on === scrolledFlag) return; scrolledFlag = on;
    var top = document.querySelector('.top'); if (top) top.classList.toggle('scrolled', on);
  }, { passive: true });

  /* ---------------- البداية ---------------- */
  document.title = NAME + ' | حراج ووظائف في السعودية';
  renderPage();
  if (ADMIN) { document.title = 'لوحة الإدارة | ' + NAME; if (A.pw) adminRefresh().catch(function () { A.pw = ''; ss('dk-admin', null); renderPage(); }); }
  else { loadAds(); loadMe(); }
  var pay = params.get('pay'), adParam = params.get('ad');
  if ((pay || adParam) && history.replaceState) history.replaceState(null, '', location.pathname);
  if (ADMIN) { /* لوحة الإدارة ما تعالج روابط الدفع */ }
  else if (pay) checkPay(pay, params.get('cancel') === '1');
  else if (adParam) openAd(adParam);
  window.__app = {
    checkPay: checkPay,
    dismiss: function (v) { if (layer && !layer.busy) closeLayer(v); else renderLayer(); },
    viewerClose: function () { if (layer && layer.name === 'viewer') { layer = layer.back; noAnimOnce = true; renderLayer(); } },
    viewerStep: function (step, from) { if (!layer || layer.name !== 'viewer') return; var n = layer.imgs.length; layer.i = (layer.i + step + n) % n; layer.from = from; renderLayer(); layer.from = 0; },
  };
})();
