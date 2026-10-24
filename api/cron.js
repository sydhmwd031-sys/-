// التنظيف اليومي (يشغّله Vercel تلقائياً حسب vercel.json): يحذف الإعلانات المنتهية وصورها والبيانات القديمة
import { handler, send, db, storage, safeEqual, nowIso } from './_lib.js';

export default handler(['GET'], async (req, res) => {
  const secret = process.env.CRON_SECRET || '';
  if (secret.length < 16 || !safeEqual(req.headers.authorization || '', 'Bearer ' + secret)) return send(res, 401, { error: 'unauthorized' });
  const ago = d => encodeURIComponent(new Date(Date.now() - d * 864e5).toISOString());
  const out = { ads: 0 };
  for (let round = 0; round < 10; round++) { // دفعات عشان ما تطول الدالة
    const old = await db.select('ads', `select=id,image_paths&or=(expires_at.lt.${encodeURIComponent(nowIso())},status.neq.active)&limit=200`);
    if (!old.length) break;
    await storage.removeMany(old.flatMap(a => a.image_paths || [])).catch(e => console.error('[storage]', e.message));
    await db.remove('ads', `id=in.(${old.map(a => a.id).join(',')})`);
    out.ads += old.length;
  }
  out.payments = (await db.remove('payments', `status=eq.pending&created_at=lt.${ago(3)}`)).length;
  out.limits = (await db.remove('rate_limits', `at=lt.${ago(2)}`)).length;
  out.sessions = (await db.remove('sessions', `expires_at=lt.${encodeURIComponent(nowIso())}`)).length;
  out.reports = (await db.remove('reports', `created_at=lt.${ago(90)}`)).length;
  console.log('[cron]', JSON.stringify(out));
  send(res, 200, out);
});
