// GET ?id=… : إعلان واحد · GET ?id=…&phone=1 : رقم التواصل (مع حد لعدد الطلبات ضد سحب الأرقام)
import { handler, send, fail, db, PUBLIC_FIELDS, UUID, limited, ipHash, eq, nowIso } from './_lib.js';

export default handler(['GET'], async (req, res) => {
  const id = String(req.query.id || '');
  if (!UUID.test(id)) fail(404, 'الإعلان غير متاح');
  const live = `id=${eq(id)}&status=eq.active&expires_at=gt.${encodeURIComponent(nowIso())}`;
  if (req.query.phone === '1') {
    if (await limited('phone:' + ipHash(req), 60, 3600)) fail(429, 'طلبات كثيرة، جرّب بعد ساعة');
    const a = await db.one('ads', 'select=phone&' + live);
    if (!a) fail(404, 'الإعلان غير متاح');
    return send(res, 200, { phone: a.phone });
  }
  const a = await db.one('ads', `select=${PUBLIC_FIELDS}&` + live);
  if (!a) fail(404, 'الإعلان غير متاح');
  send(res, 200, { ad: a });
});
