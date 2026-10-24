// إشعار ميسر بعد الدفع (احتياط لو المعلن سكّر الصفحة قبل ما يرجع للموقع)
import { handler, send, body, db, syncPayment, eq, safeEqual } from './_lib.js';

export default handler(['POST'], async (req, res) => {
  const secret = process.env.MOYASAR_WEBHOOK_SECRET || '';
  const b = body(req);
  if (secret.length < 16 || !safeEqual(String(b.secret_token || ''), secret)) return send(res, 401, { error: 'unauthorized' });
  const d = b.data || {};
  const invoiceId = d.invoice_id || (d.object === 'invoice' ? d.id : '');
  if (invoiceId) {
    const p = await db.one('payments', `select=*&invoice_id=${eq(invoiceId)}`);
    if (p) await syncPayment(p); // نتأكد من ميسر مباشرة، ما نصدّق محتوى الإشعار وحده
  }
  send(res, 200, { ok: true });
});
