// أدوات مشتركة لكل دوال الخادم. الملفات اللي تبدأ بـ _ ما تصير روابط في Vercel.
import crypto from 'node:crypto';

/* ---------------- الإعدادات ---------------- */
export const CFG = {
  get supaUrl() { return (process.env.SUPABASE_URL || '').replace(/\/+$/, ''); },
  get supaKey() { return process.env.SUPABASE_SERVICE_KEY || ''; },
  get site() { return (process.env.SITE_URL || '').replace(/\/+$/, ''); },
  get days() { return clampInt(process.env.AD_DAYS, 30, 1, 365); },
  get weekHalalas() { return clampInt(process.env.FEATURE_WEEK_HALALAS, 1000, 100, 1e7); },
  get monthHalalas() { return clampInt(process.env.FEATURE_MONTH_HALALAS, 3000, 100, 1e7); },
  get maxAdsPerDay() { return clampInt(process.env.MAX_ADS_PER_DAY, 5, 1, 100); },
  get salt() { return process.env.IP_SALT || ''; },
};
function clampInt(v, def, min, max) { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; }

export const HARAJ_CATS = ['cars', 'parts', 'realestate', 'phones', 'electronics', 'furniture', 'fashion', 'kids', 'sports', 'animals', 'equipment', 'services', 'misc'];
export const JOB_CATS = ['veg', 'food', 'design', 'acct', 'sales', 'drive', 'maint', 'build', 'tech', 'edu', 'health', 'beauty', 'home', 'security', 'office', 'market', 'tailor', 'other'];
export const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الطائف', 'تبوك', 'بريدة', 'عنيزة', 'حائل', 'أبها', 'خميس مشيط', 'جازان', 'نجران', 'الباحة', 'الجوف', 'ينبع', 'القطيف', 'الجبيل', 'حفر الباطن', 'عرعر'];
export const REASONS = ['fraud', 'prohibited', 'wrong', 'sold', 'duplicate', 'other'];
export const PUBLIC_FIELDS = 'id,kind,type,cat,title,city,details,price,salary,condition,name,images,featured_until,created_at';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BUCKET = 'ad-images';

/* ---------------- الردود ---------------- */
export function send(res, status, body, extraHeaders) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!extraHeaders || !extraHeaders['Cache-Control']) res.setHeader('Cache-Control', 'no-store');
  if (extraHeaders) for (const k in extraHeaders) res.setHeader(k, extraHeaders[k]);
  res.end(JSON.stringify(body));
}
export class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }
export const fail = (status, msg, extra) => { throw new HttpError(status, msg, extra); };

// يغلّف كل دالة: يحدد الطرق المسموحة، ويحوّل الأخطاء لرسائل عربية واضحة بدون كشف التفاصيل الداخلية
export function handler(methods, fn) {
  return async function (req, res) {
    try {
      if (!methods.includes(req.method)) { res.setHeader('Allow', methods.join(', ')); return send(res, 405, { error: 'طريقة غير مسموحة' }); }
      if (req.method === 'POST' && !sameOrigin(req)) return send(res, 403, { error: 'طلب غير مسموح' });
      if (!CFG.supaUrl || !CFG.supaKey) return send(res, 500, { error: 'إعدادات قاعدة البيانات ناقصة (SUPABASE_URL أو SUPABASE_SERVICE_KEY)' });
      await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, Object.assign({ error: e.message }, e.extra || {}));
      console.error('[dukka]', req.method, req.url, e && (e.stack || e));
      send(res, 500, { error: 'صار خطأ في الخادم، حاول بعد شوي' });
    }
  };
}
// حماية بسيطة من الطلبات القادمة من مواقع ثانية (CSRF)
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true; // طلبات الخوادم (مثل إشعار ميسر) ما ترسل Origin
  if (CFG.site && o === CFG.site) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return new URL(o).host === host; } catch (e) { return false; }
}
export function body(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string') { try { return JSON.parse(b); } catch (e) { return {}; } }
  return {};
}
export function str(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max); }

/* ---------------- الهوية والبصمات ---------------- */
export function ipOf(req) { return String(req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || '').trim(); }
export function sha(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }
export function ipHash(req) { return sha(CFG.salt + '|' + ipOf(req)).slice(0, 32); }
export function safeEqual(a, b) { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); }
// يقبل 05xxxxxxxx أو 5xxxxxxxx أو +9665xxxxxxxx ويرجّع 05xxxxxxxx
export function normPhone(p) {
  p = String(p || '').replace(/[\s\-()]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  p = p.replace(/^(\+|00)966/, '0').replace(/^5/, '05');
  return /^05\d{8}$/.test(p) ? p : '';
}
export const intlPhone = p => '+966' + p.slice(1);

/* ---------------- Supabase (REST مباشر بدون مكتبات) ---------------- */
function supaHeaders(extra) {
  const k = CFG.supaKey, h = { apikey: k };
  if (/^eyJ/.test(k)) h.Authorization = 'Bearer ' + k; // المفتاح القديم service_role
  return Object.assign(h, extra || {});
}
async function supa(path, opts = {}) {
  const r = await fetch(CFG.supaUrl + path, { method: opts.method || 'GET', headers: supaHeaders(opts.headers), body: opts.body });
  if (!r.ok) { const t = await r.text().catch(() => ''); throw new Error('Supabase ' + r.status + ' ' + path.split('?')[0] + ' ' + t.slice(0, 300)); }
  return r;
}
const q = v => encodeURIComponent(v);
export const db = {
  async select(table, query) { return (await supa(`/rest/v1/${table}?${query}`)).json(); },
  async one(table, query) { const r = await db.select(table, query + '&limit=1'); return r[0] || null; },
  async insert(table, row) { return (await supa(`/rest/v1/${table}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(row) })).json(); },
  async update(table, query, patch) { return (await supa(`/rest/v1/${table}?${query}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(patch) })).json(); },
  async remove(table, query) { return (await supa(`/rest/v1/${table}?${query}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } })).json(); },
  async count(table, query) {
    const r = await supa(`/rest/v1/${table}?select=id&${query}`, { method: 'HEAD', headers: { Prefer: 'count=exact', Range: '0-0' } });
    const m = /\/(\d+)$/.exec(r.headers.get('content-range') || ''); return m ? +m[1] : 0;
  },
};
export const eq = v => 'eq.' + q(v);
export const nowIso = () => new Date().toISOString();

export const storage = {
  publicUrl: path => `${CFG.supaUrl}/storage/v1/object/public/${BUCKET}/${path}`,
  async upload(path, buf) { await supa(`/storage/v1/object/${BUCKET}/${path}`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': '31536000', 'x-upsert': 'false' }, body: buf }); },
  async removeMany(paths) { if (!paths || !paths.length) return; await supa(`/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: paths }) }); },
};

/* ---------------- الحد من الإساءة ---------------- */
// يسجّل محاولة ويرجّع true لو تجاوزت الحد خلال النافذة الزمنية
export async function limited(key, max, windowSec, record = true) {
  const since = new Date(Date.now() - windowSec * 1000).toISOString();
  const n = await db.count('rate_limits', `key=${eq(key)}&at=gte.${q(since)}`);
  if (n >= max) return true;
  if (record) await db.insert('rate_limits', { key });
  return false;
}
export async function hit(key) { await db.insert('rate_limits', { key }); }

/* ---------------- جلسات الدخول (كوكي sid) ---------------- */
const SESSION_DAYS = 60;
function cookies(req) { const o = {}; String(req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return o; }
function cookieAttrs(req) { const secure = CFG.site.startsWith('https://') || req.headers['x-forwarded-proto'] === 'https'; return '; Path=/; HttpOnly; SameSite=Lax' + (secure ? '; Secure' : ''); }
export async function getSession(req) {
  const t = cookies(req).sid; if (!t || t.length < 30 || t.length > 100) return null;
  const s = await db.one('sessions', `select=phone,expires_at&token_hash=${eq(sha(t))}&expires_at=gt.${q(nowIso())}`);
  return s ? { phone: s.phone } : null;
}
export async function startSession(req, res, phone) {
  const t = crypto.randomBytes(32).toString('base64url');
  await db.insert('sessions', { token_hash: sha(t), phone, expires_at: new Date(Date.now() + SESSION_DAYS * 864e5).toISOString() });
  res.setHeader('Set-Cookie', `sid=${t}; Max-Age=${SESSION_DAYS * 86400}` + cookieAttrs(req));
}
export async function endSession(req, res) {
  const t = cookies(req).sid; if (t) await db.remove('sessions', `token_hash=${eq(sha(t))}`).catch(() => { });
  res.setHeader('Set-Cookie', 'sid=; Max-Age=0' + cookieAttrs(req));
}

/* ---------------- ميسر ---------------- */
function moyasarAuth() {
  const k = process.env.MOYASAR_SECRET_KEY || '';
  if (!/^sk_(test|live)_/.test(k)) fail(500, 'مفتاح ميسر ناقص أو غلط (MOYASAR_SECRET_KEY)');
  return 'Basic ' + Buffer.from(k + ':').toString('base64');
}
export async function createInvoice(payment, description) {
  if (!CFG.site) fail(500, 'SITE_URL ناقص في إعدادات Vercel');
  const r = await fetch('https://api.moyasar.com/v1/invoices', {
    method: 'POST', headers: { Authorization: moyasarAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: payment.amount, currency: 'SAR', description,
      success_url: `${CFG.site}/?pay=${payment.id}`,
      back_url: `${CFG.site}/?pay=${payment.id}&cancel=1`,
      callback_url: `${CFG.site}/api/webhook`,
      expired_at: new Date(Date.now() + 2 * 36e5).toISOString(),
      metadata: { payment_id: payment.id },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url || !j.id) { console.error('[moyasar] create', r.status, JSON.stringify(j).slice(0, 400)); fail(502, 'تعذر فتح صفحة الدفع، حاول بعد شوي'); }
  await db.update('payments', `id=${eq(payment.id)}`, { invoice_id: j.id });
  return j.url;
}
export async function fetchInvoice(id) {
  const r = await fetch('https://api.moyasar.com/v1/invoices/' + encodeURIComponent(id), { headers: { Authorization: moyasarAuth() } });
  if (!r.ok) return null;
  return r.json();
}
// يتأكد من الدفع عند ميسر نفسها (ما نعتمد على كلام المتصفح)، ثم يطبّق التمييز مرة وحدة فقط
export async function syncPayment(p) {
  if (!p || p.status !== 'pending' || !p.invoice_id) return p;
  const inv = await fetchInvoice(p.invoice_id);
  if (!inv || inv.status !== 'paid' || Number(inv.amount) !== Number(p.amount) || String(inv.currency).toUpperCase() !== 'SAR') return p;
  const done = await db.update('payments', `id=${eq(p.id)}&status=eq.pending`, { status: 'paid', paid_at: nowIso() });
  if (!done.length) return await db.one('payments', `select=*&id=${eq(p.id)}`); // انطبق من طلب ثاني
  let paid = done[0];
  if (paid.kind === 'feature' && paid.ad_id) {
    const ad = await db.one('ads', `select=id,featured_until,expires_at&id=${eq(paid.ad_id)}`);
    if (ad) {
      const d = paid.plan === 'month' ? 30 : 7;
      const base = Math.max(Date.now(), ad.featured_until ? Date.parse(ad.featured_until) : 0);
      const until = new Date(base + d * 864e5).toISOString();
      const patch = { featured_until: until };
      if (Date.parse(ad.expires_at) < Date.parse(until)) patch.expires_at = until;
      await db.update('ads', `id=${eq(ad.id)}`, patch);
      paid = (await db.update('payments', `id=${eq(paid.id)}`, { featured_until: until }))[0] || paid;
    }
  }
  return paid;
}
