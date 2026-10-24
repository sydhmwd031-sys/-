// GET: كل الإعلانات النشطة (بدون أرقام الجوال) · POST: نشر إعلان جديد (يحتاج تسجيل دخول)
import crypto from 'node:crypto';
import { handler, send, fail, body, str, db, storage, CFG, PUBLIC_FIELDS, HARAJ_CATS, JOB_CATS, CITIES, getSession, limited, ipHash, nowIso } from './_lib.js';

export default handler(['GET', 'POST'], async (req, res) => {
  if (req.method === 'GET') {
    const ads = await db.select('ads', `select=${PUBLIC_FIELDS}&status=eq.active&expires_at=gt.${encodeURIComponent(nowIso())}&order=created_at.desc&limit=2000`);
    return send(res, 200, { ads, plans: { week: CFG.weekHalalas / 100, month: CFG.monthHalalas / 100 }, days: CFG.days },
      { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' });
  }

  const me = await getSession(req);
  if (!me) fail(401, 'سجّل دخولك برقم جوالك عشان تنشر', { login: true });
  const b = body(req);
  if (b.website) fail(400, 'تعذر النشر'); // حقل مخفي: لو تعبّى فهذا روبوت

  const kind = b.kind === 'job' ? 'job' : b.kind === 'haraj' ? 'haraj' : '';
  if (!kind) fail(400, 'نوع الإعلان غير صحيح');
  const type = str(b.type, 10);
  if (!(kind === 'haraj' ? ['sell', 'buy'] : ['hire', 'seek']).includes(type)) fail(400, 'نوع الإعلان غير صحيح');
  const cat = str(b.cat, 20);
  if (!(kind === 'haraj' ? HARAJ_CATS : JOB_CATS).includes(cat)) fail(400, 'اختر القسم');
  const city = str(b.city, 30);
  if (!CITIES.includes(city)) fail(400, 'اختر المدينة');
  const title = str(b.title, 80), details = str(b.details, 1200), name = str(b.name, 40);
  if (title.length < 4) fail(400, 'اكتب عنوان واضح للإعلان');
  if (details.length < 10) fail(400, 'اكتب تفاصيل أكثر (10 أحرف على الأقل)');
  if (!name) fail(400, 'اكتب الاسم');
  let price = null;
  if (kind === 'haraj' && type === 'sell' && String(b.price || '').trim() !== '') {
    const p = String(b.price).replace(/[,٬\s]/g, '');
    if (!/^\d{1,9}$/.test(p)) fail(400, 'السعر لازم يكون رقم بالريال، بدون كسور');
    price = Number(p);
  }
  const condition = kind === 'haraj' && ['new', 'used'].includes(b.condition) ? b.condition : '';
  const salary = kind === 'job' ? str(b.salary, 30) : '';
  if (b.agree !== true) fail(400, 'لازم توافق على الشروط وسياسة الخصوصية');
  if (kind === 'haraj' && b.pledge !== true) fail(400, 'لازم تتعهد بدفع عمولة الموقع');

  const imgs = Array.isArray(b.images) ? b.images.slice(0, 4) : [];
  const bufs = imgs.map(s => {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(s || ''));
    if (!m) fail(400, 'صيغة صورة غير مدعومة');
    const buf = Buffer.from(m[1], 'base64');
    if (buf.length > 1_000_000 || buf[0] !== 0xFF || buf[1] !== 0xD8) fail(400, 'صورة غير صالحة أو حجمها كبير');
    return buf;
  });

  if (await limited('post:' + me.phone, CFG.maxAdsPerDay, 86400)) fail(429, `وصلت للحد اليومي (${CFG.maxAdsPerDay} إعلانات). جرّب بكرة`);
  if (await limited('postip:' + ipHash(req), 20, 86400)) fail(429, 'محاولات كثيرة، جرّب بعدين');

  const id = crypto.randomUUID(), paths = [];
  try {
    for (let i = 0; i < bufs.length; i++) { const p = `${id}/${i}-${crypto.randomBytes(6).toString('hex')}.jpg`; await storage.upload(p, bufs[i]); paths.push(p); }
    const now = new Date();
    await db.insert('ads', {
      id, kind, type, cat, city, title, details, price, salary, condition, name, phone: me.phone,
      images: paths.map(storage.publicUrl), image_paths: paths, status: 'active',
      created_at: now.toISOString(), expires_at: new Date(now.getTime() + CFG.days * 864e5).toISOString(),
      agreed_at: now.toISOString(), pledged_at: kind === 'haraj' ? now.toISOString() : null, ip_hash: ipHash(req),
    });
  } catch (e) { await storage.removeMany(paths).catch(() => { }); throw e; }
  send(res, 200, { id });
});
