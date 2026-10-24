// يعبّي بياناتك من info.js في صفحتي الشروط والخصوصية. أي بيان ناقص يظهر بلون برتقالي.
(function () {
  var I = window.SITE_INFO || {};
  var L = { siteName: 'اسم الموقع', ownerName: 'اسم المالك أو المنشأة', licenseType: 'نوع الترخيص', licenseNumber: 'رقم السجل أو الوثيقة', city: 'المدينة', email: 'البريد الإلكتروني', whatsapp: 'رقم الواتساب', effectiveDate: 'تاريخ السريان' };
  document.querySelectorAll('[data-info]').forEach(function (el) {
    var k = el.getAttribute('data-info');
    if (I[k]) el.textContent = I[k]; else { el.textContent = '[' + (L[k] || k) + ']'; el.className = 'missing'; }
  });
  document.querySelectorAll('[data-info-initial]').forEach(function (el) { el.textContent = String(I[el.getAttribute('data-info-initial')] || 'د').charAt(0); });
  if (!I.whatsapp) document.querySelectorAll('.if-wa').forEach(function (el) { el.hidden = true; });
  if (I.siteName) document.title = document.title + ' | ' + I.siteName;
})();
