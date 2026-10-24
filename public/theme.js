// يطبّق النمط المحفوظ (ليلي/نهاري) قبل رسم الصفحة عشان ما تومض
(function () {
  document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar';
  try {
    var t = JSON.parse(localStorage.getItem('theme') || 'null');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var m = document.querySelector('meta[name="theme-color"]'); if (m && dark) m.setAttribute('content', '#151E1B');
  } catch (e) { }
})();
