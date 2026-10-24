// الإبلاغ عن إعلان مخالف
import { handler, send, fail, body, str, db, UUID, REASONS, limited, ipHash, eq } from './_lib.js';

export default handler(['POST'], async (req, res) => {
  const b = body(req), adId = String(b.ad_id || '');
  if (!UUID.test(adId)) fail(400, 'الإعلان غير موجود');
  if (!REASONS.includes(b.reason)) fail(400, 'اختر سبب البلاغ');
  const ip = ipHash(req);
  if (await limited('report:' + ip, 10, 3600)) fail(429, 'بلاغات كثيرة، جرّب بعد ساعة');
  if (!(await db.one('ads', `select=id&id=${eq(adId)}`))) fail(404, 'الإعلان غير متاح');
  const dup = await db.one('reports', `select=id&ad_id=${eq(adId)}&ip_hash=${eq(ip)}`);
  if (!dup) await db.insert('reports', { ad_id: adId, reason: b.reason, note: str(b.note, 300), ip_hash: ip });
  send(res, 200, { ok: true });
});
