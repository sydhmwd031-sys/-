// تمييز إعلان: ينشئ فاتورة في ميسر ويرجّع رابط صفحة الدفع. صاحب الإعلان فقط يقدر يميّزه
import { handler, send, fail, body, db, CFG, UUID, getSession, createInvoice, eq, nowIso } from './_lib.js';

export default handler(['POST'], async (req, res) => {
  const me = await getSession(req);
  if (!me) fail(401, 'سجّل دخولك أول', { login: true });
  const b = body(req), adId = String(b.ad_id || ''), plan = b.plan === 'month' ? 'month' : 'week';
  if (!UUID.test(adId)) fail(400, 'الإعلان غير موجود');
  const ad = await db.one('ads', `select=id,title,phone&id=${eq(adId)}&status=eq.active&expires_at=gt.${encodeURIComponent(nowIso())}`);
  if (!ad) fail(404, 'الإعلان غير متاح');
  if (ad.phone !== me.phone) fail(403, 'تقدر تميّز إعلاناتك فقط');
  const amount = plan === 'month' ? CFG.monthHalalas : CFG.weekHalalas;
  const [p] = await db.insert('payments', { kind: 'feature', ad_id: ad.id, plan, amount, status: 'pending' });
  const url = await createInvoice(p, `تمييز إعلان «${ad.title.slice(0, 40)}» لمدة ${plan === 'month' ? 'شهر' : 'أسبوع'}`);
  send(res, 200, { url, payment_id: p.id });
});
