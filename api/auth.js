// تسجيل الدخول برقم الجوال وكود تحقق عبر Authentica (واتساب أو رسالة نصية)
import { handler, send, fail, body, db, PUBLIC_FIELDS, normPhone, intlPhone, limited, hit, ipHash, getSession, startSession, endSession, eq, nowIso, safeEqual } from './_lib.js';

const AUTH_URL = 'https://api.authentica.sa/api/v2';
async function authentica(path, payload) {
  const key = process.env.AUTHENTICA_API_KEY;
  if (!key) fail(500, 'خدمة الرسائل غير مفعّلة (AUTHENTICA_API_KEY ناقص)');
  const r = await fetch(AUTH_URL + path, { method: 'POST', headers: { 'X-Authorization': key, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { console.error('[authentica] 401 unauthorized'); fail(500, 'مفتاح Authentica غلط أو ملغي (AUTHENTICA_API_KEY)'); }
  return { ok: r.ok, status: r.status, j };
}
// رقم تجريبي ثابت (لمراجعة ميسر أو للتجربة قبل تفعيل Authentica). اتركه فاضي في التشغيل الحقيقي إذا ما تحتاجه
function testLogin(phone, code) {
  const tp = normPhone(process.env.OTP_TEST_PHONE), tc = String(process.env.OTP_TEST_CODE || '');
  if (!tp || tc.length < 6 || phone !== tp) return null;
  return code === undefined ? true : safeEqual(code, tc);
}

export default handler(['GET', 'POST'], async (req, res) => {
  if (req.method === 'GET') {
    const me = await getSession(req);
    if (!me) return send(res, 200, { phone: null });
    const ads = await db.select('ads', `select=${PUBLIC_FIELDS}&phone=${eq(me.phone)}&status=eq.active&expires_at=gt.${encodeURIComponent(nowIso())}&order=created_at.desc&limit=200`);
    return send(res, 200, { phone: me.phone, ads });
  }
  const b = body(req);
  if (b.action === 'logout') { await endSession(req, res); return send(res, 200, { ok: true }); }

  const phone = normPhone(b.phone);
  if (!phone) fail(400, 'اكتب رقم جوال سعودي صحيح، مثال: 0512345678');

  if (b.action === 'send') {
    const channel = b.channel === 'sms' ? 'sms' : 'whatsapp';
    if (await limited('otp:' + phone, 3, 600)) fail(429, 'أرسلنا أكواد كثيرة لهذا الرقم. انتظر 10 دقائق');
    if (await limited('otpday:' + phone, 8, 86400)) fail(429, 'وصلت للحد اليومي لأكواد التحقق');
    if (await limited('otpip:' + ipHash(req), 15, 3600)) fail(429, 'محاولات كثيرة، جرّب بعد ساعة');
    if (testLogin(phone)) return send(res, 200, { ok: true, channel });
    const payload = { method: channel, phone: intlPhone(phone) };
    if (process.env.AUTHENTICA_TEMPLATE_ID) payload.template_id = Number(process.env.AUTHENTICA_TEMPLATE_ID);
    const r = await authentica('/send-otp', payload);
    if (!r.ok || r.j.success === false) { console.error('[authentica] send', r.status, JSON.stringify(r.j).slice(0, 300)); fail(502, channel === 'whatsapp' ? 'تعذر الإرسال على واتساب. جرّب «رسالة نصية»' : 'تعذر إرسال الرسالة، حاول بعد شوي'); }
    return send(res, 200, { ok: true, channel });
  }

  if (b.action === 'verify') {
    const code = String(b.code || '').replace(/\D/g, '');
    if (code.length < 4 || code.length > 8) fail(400, 'اكتب الكود اللي وصلك');
    if (await limited('verify:' + phone, 6, 600, false)) fail(429, 'محاولات كثيرة. اطلب كود جديد بعد 10 دقائق');
    let ok = testLogin(phone, code);
    if (ok === null) {
      const r = await authentica('/verify-otp', { phone: intlPhone(phone), otp: code });
      ok = r.ok && r.j.status === true;
      if (!r.ok && r.status >= 500) { console.error('[authentica] verify', r.status); fail(502, 'تعذر التحقق الحين، حاول بعد شوي'); }
    }
    if (!ok) { await hit('verify:' + phone); fail(400, 'الكود غير صحيح أو انتهت صلاحيته'); }
    await startSession(req, res, phone);
    return send(res, 200, { phone });
  }
  fail(400, 'طلب غير معروف');
});
