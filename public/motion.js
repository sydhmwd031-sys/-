/* الحركة: نوابض قابلة للمقاطعة، سحب 1:1، إسقاط الزخم، ومقاومة عند الحواف.
   المبادئ (Apple · Designing Fluid Interfaces):
   - كل حركة تبدأ من القيمة الظاهرة الحالية وترث سرعة الإصبع.
   - التخميد 1.0 (بدون ارتداد) هو الأصل، والارتداد الخفيف 0.8 فقط بعد حركة فيها زخم.
   - الدخول والخروج على نفس المسار. */
(function () {
  'use strict';
  var mq = function (q) { return window.matchMedia ? matchMedia(q) : { matches: false }; };
  var RM = mq('(prefers-reduced-motion: reduce)');
  var PHONE = mq('(max-width: 699px)');

  // نابض: damping = نسبة التخميد، response = سرعة الوصول بالثواني (مو مدة ثابتة)
  function spring(o) {
    var x = o.from, v = o.velocity || 0, to = o.to;
    var z = o.damping == null ? 1 : o.damping, r = o.response || 0.35;
    var k = Math.pow(2 * Math.PI / r, 2), c = 4 * Math.PI * z / r;
    var restX = o.restX == null ? 0.4 : o.restX, restV = o.restV == null ? 4 : o.restV;
    var raf = 0, last = performance.now(), done = false;
    function step(now) {
      if (done) return;
      var dt = Math.min(0.064, (now - last) / 1000); last = now;
      var n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
      for (var i = 0; i < n; i++) { var a = -k * (x - to) - c * v; v += a * h; x += v * h; }
      if (Math.abs(v) < restV && Math.abs(x - to) < restX) { x = to; v = 0; done = true; o.onUpdate(x); if (o.onDone) o.onDone(); return; }
      o.onUpdate(x); raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return { stop: function () { done = true; cancelAnimationFrame(raf); }, get value() { return x; }, get velocity() { return v; } };
  }
  // أين ستستقر الحركة لو تركناها تتباطأ (نفس معادلة التمرير في iOS)
  function project(v, d) { d = d || 0.998; return (v / 1000) * d / (1 - d); }
  // مقاومة متزايدة بعد الحد بدل التوقف المفاجئ
  function rubberband(over, dim, c) { c = c || 0.55; return (over * dim * c) / (dim + c * Math.abs(over)); }

  // سرعة الإصبع من آخر 100ms من الحركة
  function tracker() {
    var pts = [];
    return {
      add: function (x, y) { var t = performance.now(); pts.push({ x: x, y: y, t: t }); while (pts.length > 2 && t - pts[0].t > 100) pts.shift(); },
      velocity: function () {
        if (pts.length < 2) return { x: 0, y: 0 };
        var a = pts[0], b = pts[pts.length - 1], dt = (b.t - a.t) / 1000;
        if (dt <= 0 || performance.now() - b.t > 80) return { x: 0, y: 0 }; // الإصبع وقف قبل ما يرفع
        return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
      }
    };
  }

  /* ---------------- النوافذ السفلية ---------------- */
  function parts(overlay) { return { ov: overlay, sh: overlay && overlay.querySelector('.sheet') }; }
  function setY(p, y) {
    var h = p.sh.offsetHeight || 1;
    p.sh._y = y;
    p.sh.style.transform = y ? 'translate3d(0,' + y + 'px,0)' : '';
    p.ov.style.setProperty('--p', Math.max(0, Math.min(1, 1 - y / h)).toFixed(3));
  }
  function setP(p, t) { // سطح المكتب: النافذة تظهر في مكانها بتكبير خفيف وشفافية
    p.sh._p = t;
    p.sh.style.opacity = t.toFixed(3);
    p.sh.style.transform = t >= 1 ? '' : 'scale(' + (0.96 + 0.04 * t).toFixed(4) + ')';
    p.ov.style.setProperty('--p', t.toFixed(3));
  }
  function stop(sh) { if (sh && sh._anim) { sh._anim.stop(); sh._anim = null; } }

  function enter(overlay) {
    var p = parts(overlay); if (!p.sh) return;
    if (RM.matches) { overlay.classList.add('rm-in'); return; }
    stop(p.sh);
    if (PHONE.matches) {
      var h = p.sh.offsetHeight; setY(p, h);
      p.sh._anim = spring({ from: h, to: 0, damping: 1, response: 0.38, onUpdate: function (y) { setY(p, y); }, onDone: function () { p.sh._anim = null; } });
    } else {
      setP(p, 0);
      p.sh._anim = spring({ from: 0, to: 1, damping: 1, response: 0.3, restX: 0.002, restV: 0.02, onUpdate: function (t) { setP(p, t); }, onDone: function () { p.sh._anim = null; } });
    }
  }
  // يخرج من نفس المسار اللي دخل منه، ويكمل بسرعة الإصبع لو كان مسحوب
  function leave(overlay, velocity) {
    return new Promise(function (resolve) {
      var p = parts(overlay); if (!p.sh) return resolve();
      overlay.style.pointerEvents = 'none';
      if (RM.matches) { overlay.classList.add('rm-out'); return setTimeout(resolve, 180); }
      stop(p.sh);
      if (PHONE.matches) {
        var h = p.sh.offsetHeight;
        p.sh._anim = spring({ from: p.sh._y || 0, to: h + 24, velocity: Math.max(0, velocity || 0), damping: 1, response: 0.32, restX: 2, onUpdate: function (y) { setY(p, y); }, onDone: resolve });
      } else {
        p.sh._anim = spring({ from: p.sh._p == null ? 1 : p.sh._p, to: 0, damping: 1, response: 0.22, restX: 0.01, restV: 0.05, onUpdate: function (t) { setP(p, Math.max(0, t)); }, onDone: resolve });
      }
    });
  }

  // سحب النافذة من المقبض أو العنوان: يتبع الإصبع 1:1، ومقاومة لفوق، وعند الإفلات نحسب أين كانت بتوقف
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    if (!PHONE.matches || e.button > 0) return;
    var zone = e.target.closest && e.target.closest('#layer .grip, #layer .sheet-head');
    if (!zone || e.target.closest('button,a,input,select,textarea')) return;
    var sh = zone.closest('.sheet'), ov = sh && sh.closest('.overlay');
    if (!sh || ov.style.pointerEvents === 'none') return;
    stop(sh); // مقاطعة أي حركة جارية: نمسكها من مكانها الحالي
    drag = { p: parts(ov), y0: sh._y || 0, startY: e.clientY, id: e.pointerId, t: tracker(), live: false, el: zone };
    drag.t.add(0, e.clientY);
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dy = e.clientY - drag.startY;
    if (!drag.live) { if (Math.abs(dy) < 6) return; drag.live = true; try { drag.el.setPointerCapture(e.pointerId); } catch (x) { } }
    drag.t.add(0, e.clientY);
    var y = drag.y0 + dy, h = drag.p.sh.offsetHeight;
    setY(drag.p, y < 0 ? rubberband(y, h) : y);
    e.preventDefault();
  }, { passive: false });
  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.live) return;
    var v = d.t.velocity().y, y = d.p.sh._y || 0, h = d.p.sh.offsetHeight;
    var landing = y + project(v);
    if (landing > h * 0.45 && v > -50) { if (window.__app && window.__app.dismiss) window.__app.dismiss(v); return; }
    d.p.sh._anim = spring({ from: y, to: 0, velocity: v, damping: Math.abs(v) > 300 ? 0.8 : 1, response: 0.3, onUpdate: function (x) { setY(d.p, x); }, onDone: function () { d.p.sh._anim = null; } });
  }
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);

  /* ---------------- عارض الصور: سحب لتحت للإغلاق، وسحب جانبي للتنقل ---------------- */
  var vd = null;
  function viewerEnter(img, from) {
    if (!img || RM.matches) return;
    var w = window.innerWidth;
    if (from) { // الصورة الجديدة تدخل من الجهة اللي بيتجه لها السحب
      var a = spring({ from: from * w * 0.35, to: 0, damping: 1, response: 0.34, onUpdate: function (x) { img.style.transform = 'translate3d(' + x + 'px,0,0)'; img.style.opacity = String(1 - Math.min(1, Math.abs(x) / (w * 0.35)) * 0.6); } });
      img._anim = a; return;
    }
    img._anim = spring({ from: 0, to: 1, damping: 1, response: 0.3, restX: 0.002, restV: 0.02, onUpdate: function (t) { img.style.transform = 'scale(' + (0.92 + 0.08 * t) + ')'; img.style.opacity = String(t); } });
  }
  document.addEventListener('pointerdown', function (e) {
    var img = e.target.closest && e.target.closest('#layer .viewer img'); if (!img || e.button > 0) return;
    if (img._anim) img._anim.stop();
    vd = { img: img, v: img.closest('.viewer'), x0: e.clientX, y0: e.clientY, id: e.pointerId, t: tracker(), axis: null };
    vd.t.add(e.clientX, e.clientY);
  });
  document.addEventListener('pointermove', function (e) {
    if (!vd || e.pointerId !== vd.id) return;
    var dx = e.clientX - vd.x0, dy = e.clientY - vd.y0;
    if (!vd.axis) { if (Math.hypot(dx, dy) < 10) return; vd.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; try { vd.img.setPointerCapture(e.pointerId); } catch (x) { } }
    vd.t.add(e.clientX, e.clientY);
    var multi = vd.v.querySelector('.nav');
    if (vd.axis === 'y') { vd.img.style.transform = 'translate3d(' + dx * 0.3 + 'px,' + dy + 'px,0) scale(' + (1 - Math.min(0.2, Math.abs(dy) / 1600)) + ')'; vd.v.style.setProperty('--p', String(1 - Math.min(0.85, Math.abs(dy) / 420))); }
    else vd.img.style.transform = 'translate3d(' + (multi ? dx : rubberband(dx, window.innerWidth)) + 'px,0,0)';
    e.preventDefault();
  }, { passive: false });
  function viewerRelease(e) {
    if (!vd || e.pointerId !== vd.id) return;
    var d = vd; vd = null; if (!d.axis) return;
    var vel = d.t.velocity(), img = d.img, w = window.innerWidth;
    var m = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(img.style.transform || '') || [0, 0, 0];
    var cx = +m[1], cy = +m[2];
    if (d.axis === 'y') {
      if (Math.abs(cy + project(vel.y)) > 220) { // إغلاق باتجاه السحب نفسه
        var dir = (cy + project(vel.y)) > 0 ? 1 : -1;
        spring({ from: cy, to: dir * window.innerHeight, velocity: vel.y, damping: 1, response: 0.3, restX: 4, onUpdate: function (y) { img.style.transform = 'translate3d(' + cx + 'px,' + y + 'px,0) scale(.9)'; d.v.style.setProperty('--p', String(Math.max(0, 1 - Math.abs(y) / 420))); }, onDone: function () { if (window.__app) window.__app.viewerClose(); } });
      } else {
        img._anim = spring({ from: cy, to: 0, velocity: vel.y, damping: 0.8, response: 0.3, onUpdate: function (y) { img.style.transform = 'translate3d(' + (cx * y / (cy || 1)) + 'px,' + y + 'px,0)'; d.v.style.setProperty('--p', String(1 - Math.min(0.85, Math.abs(y) / 420))); } });
      }
      return;
    }
    var land = cx + project(vel.x), multi = d.v.querySelector('.nav');
    if (multi && Math.abs(land) > w * 0.28) { // في العربي: السحب لليسار = الصورة التالية
      var step = land < 0 ? 1 : -1;
      spring({ from: cx, to: (land < 0 ? -1 : 1) * w, velocity: vel.x, damping: 1, response: 0.26, restX: 6, onUpdate: function (x) { img.style.transform = 'translate3d(' + x + 'px,0,0)'; }, onDone: function () { if (window.__app) window.__app.viewerStep(step, land < 0 ? 1 : -1); } });
    } else {
      img._anim = spring({ from: cx, to: 0, velocity: vel.x, damping: Math.abs(vel.x) > 300 ? 0.8 : 1, response: 0.3, onUpdate: function (x) { img.style.transform = 'translate3d(' + x + 'px,0,0)'; } });
    }
  }
  document.addEventListener('pointerup', viewerRelease);
  document.addEventListener('pointercancel', viewerRelease);

  /* ---------------- التنبيهات: تنزل من فوق وترجع لنفس المكان ---------------- */
  function toast(text) {
    var el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = text;
    document.body.appendChild(el);
    if (RM.matches) { setTimeout(function () { el.remove(); }, 3000); return el; }
    var fromBelow = getComputedStyle(el).top === 'auto' || el.style.top === 'auto';
    var show = function (t) { el.style.transform = 'translate3d(-50%,' + ((1 - t) * (fromBelow ? 24 : -24)) + 'px,0) scale(' + (0.96 + 0.04 * t) + ')'; el.style.opacity = String(Math.max(0, t)); };
    show(0);
    spring({ from: 0, to: 1, damping: 1, response: 0.32, restX: 0.002, restV: 0.02, onUpdate: show });
    setTimeout(function () { spring({ from: 1, to: 0, damping: 1, response: 0.28, restX: 0.01, restV: 0.05, onUpdate: show, onDone: function () { el.remove(); } }); }, 2800);
    return el;
  }

  /* ---------------- لمسة اهتزاز للحظات المهمة فقط (أندرويد) ---------------- */
  function haptic(kind) {
    if (RM.matches || !navigator.vibrate) return;
    try { navigator.vibrate(kind === 'success' ? [10, 60, 14] : kind === 'error' ? [24, 40, 24] : 8); } catch (e) { }
  }

  /* ---------------- تبديل النمط: دائرة تنفتح من زر الشمس/القمر ---------------- */
  function themeSwitch(button, apply) {
    if (RM.matches || !document.startViewTransition || !button) { apply(); return; }
    var r = button.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var root = document.documentElement;
    root.style.setProperty('--vt-x', x + 'px'); root.style.setProperty('--vt-y', y + 'px');
    root.style.setProperty('--vt-r', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
    document.startViewTransition(apply);
  }

  window.Motion = { spring: spring, project: project, rubberband: rubberband, enter: enter, leave: leave, viewerEnter: viewerEnter, toast: toast, haptic: haptic, themeSwitch: themeSwitch, reduced: function () { return RM.matches; } };
})();
