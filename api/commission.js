// دفع عمولة 1% من قيمة البيع (أقل عمولة ريال). ما يحتاج تسجيل دخول
import { handler, send, fail, body, db, UUID, createInvoice, limited, ipHash, eq } from './_lib.js';

export default handler(['POST'], async (req, res) => {
  const b = body(req), sale = Number(b.sale_amount);
  if (!Number.isInteger(sale) || sale < 1 || sale > 999999999) fail(400, 'اكتب قيمة البيع بالريال (رقم صحيح)');
  if (await limited('comm:' + ipHash(req), 20, 3600)) fail(429, 'محاولات كثيرة، جرّب بعد ساعة');
  let adId = null;
  if (b.ad_id && UUID.test(String(b.ad_id))) { const a = await db.one('ads', `select=id&id=${eq(b.ad_id)}`); if (a) adId = a.id; }
  const amount = Math.max(100, Math.round(sale)); // 1% من الريالات = نفس الرقم بالهللات
  const [p] = await db.insert('payments', { kind: 'commission', ad_id: adId, amount, sale_amount: sale, status: 'pending' });
  const url = await createInvoice(p, `عمولة الموقع 1% على بيع بقيمة ${sale.toLocaleString('en-US')} ر.س`);
  send(res, 200, { url, payment_id: p.id });
});
