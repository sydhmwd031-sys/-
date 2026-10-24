// لوحة الإدارة: كل طلب يحمل كلمة المرور ADMIN_PASSWORD. المحاولات الغلط محدودة
import { handler, send, fail, body, db, storage, UUID, limited, hit, ipHash, safeEqual, syncPayment, eq, nowIso } from './_lib.js';

// رصيد Authentica (عدد الرسائل المتبقية تقريباً) يظهر في لوحة الإدارة
async function authenticaBalance() {
  const key = process.env.AUTHENTICA_API_KEY; if (!key) return null;
  try {
    const r = await fetch('https://api.authentica.sa/api/v2/balance', { headers: { 'X-Authorization': key, Accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    const j = await r.json(); const b = j && j.data && j.data.balance;
    return typeof b === 'number' ? b : null;
  } catch (e) { return null; }
}

export default handler(['POST'], async (req, res) => {
  const pw = process.env.ADMIN_PASSWORD || '';
  if (pw.length < 16) fail(500, 'ADMIN_PASSWORD لازم يكون 16 حرف أو أكثر في إعدادات Vercel');
  const b = body(req), key = 'adminfail:' + ipHash(req);
  if (await limited(key, 8, 900, false)) fail(429, 'محاولات دخول كثيرة. انتظر 15 دقيقة');
  if (!safeEqual(String(b.password || ''), pw)) { await hit(key); fail(401, 'كلمة المرور غير صحيحة'); }

  const id = String(b.id || '');
  switch (b.action) {
    case 'list': {
      const now = encodeURIComponent(nowIso());
      const [ads, reports, payments] = await Promise.all([
        db.select('ads', `select=*&status=eq.active&expires_at=gt.${now}&order=created_at.desc&limit=2000`),
        db.select('reports', 'select=id,ad_id,reason,note,created_at&order=created_at.desc&limit=1000'),
        db.select('payments', 'select=*&order=created_at.desc&limit=500'),
      ]);
      ads.forEach(a => { delete a.ip_hash; delete a.image_paths; });
      return send(res, 200, { ads, reports, payments, authentica_balance: await authenticaBalance() });
    }
    case 'remove': {
      if (!UUID.test(id)) fail(400, 'رقم غير صحيح');
      const a = await db.one('ads', `select=id,image_paths&id=${eq(id)}`);
      if (a) { await storage.removeMany(a.image_paths || []).catch(e => console.error('[storage]', e.message)); await db.remove('ads', `id=${eq(id)}`); }
      return send(res, 200, { ok: true });
    }
    case 'dismiss_reports':
      if (!UUID.test(id)) fail(400, 'رقم غير صحيح');
      await db.remove('reports', `ad_id=${eq(id)}`);
      return send(res, 200, { ok: true });
    case 'recheck_payment': {
      if (!UUID.test(id)) fail(400, 'رقم غير صحيح');
      const p = await syncPayment(await db.one('payments', `select=*&id=${eq(id)}`));
      return send(res, 200, { status: p ? p.status : 'missing' });
    }
  }
  fail(400, 'طلب غير معروف');
});
