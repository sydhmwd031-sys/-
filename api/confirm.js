// بعد الرجوع من ميسر: يتأكد من حالة الدفع من ميسر نفسها
import { handler, send, db, UUID, syncPayment, eq } from './_lib.js';

export default handler(['GET'], async (req, res) => {
  const id = String(req.query.p || '');
  if (!UUID.test(id)) return send(res, 200, { status: 'missing' });
  let p = await db.one('payments', `select=*&id=${eq(id)}`);
  if (!p) return send(res, 200, { status: 'missing' });
  p = await syncPayment(p);
  send(res, 200, { status: p.status, kind: p.kind, ad_id: p.ad_id, featured_until: p.featured_until || null });
});
