# دكّة: حراج ووظائف في السعودية

موقع إعلانات فيه **تطبيقين**:

| التطبيق | الرابط | لمين |
|---|---|---|
| واجهة العملاء | `موقعك/` | الزوار والمعلنين: تصفح، نشر، تمييز، عمولة، بلاغ |
| لوحة الإدارة | `موقعك/admin.html` | أنت فقط (بكلمة المرور `ADMIN_PASSWORD`) |

## الخدمات المستخدمة

| الخدمة | دورها |
|---|---|
| GitHub | حفظ ملفات المشروع |
| Vercel | تشغيل الموقع ودوال الخادم والتنظيف اليومي |
| Supabase | قاعدة البيانات ومخزن الصور |
| ميسر Moyasar | الدفع (تمييز 10 أو 30 ريال، وعمولة 1%) |
| Authentica | كود التحقق على واتساب أو رسالة نصية |

## هيكل الملفات

```
api/            دوال الخادم (كل ملف = رابط /api/اسمه)
  _lib.js       أدوات مشتركة (لا تعدّلها إلا لو تعرف)
  ads.js        قائمة الإعلانات + نشر إعلان
  ad.js         إعلان واحد + إظهار الرقم
  auth.js       الدخول بكود التحقق
  feature.js    تمييز إعلان (ميسر)
  commission.js دفع العمولة (ميسر)
  confirm.js    التأكد من الدفع بعد الرجوع
  webhook.js    إشعار ميسر
  report.js     البلاغات
  admin.js      لوحة الإدارة
  cron.js       التنظيف اليومي
public/         الواجهة
  index.html    تطبيق العملاء
  admin.html    تطبيق الإدارة
  info.js       ← بياناتك (اسمك، سجلك، بريدك...) عدّلها هنا
  styles.css, app.js, motion.js, theme.js, legal.js
  terms.html, privacy.html
supabase/schema.sql   ← انسخه في Supabase SQL Editor
vercel.json           التنظيف اليومي وترويسات الأمان
.env.example          أسماء المتغيرات المطلوبة
```

## متغيرات Vercel (Settings ← Environment Variables)

| الاسم | القيمة |
|---|---|
| `SUPABASE_URL` | من Supabase ← Project Settings ← Data API |
| `SUPABASE_SERVICE_KEY` | المفتاح السري `sb_secret_...` |
| `MOYASAR_SECRET_KEY` | `sk_test_...` للتجربة، ثم `sk_live_...` |
| `MOYASAR_WEBHOOK_SECRET` | نص عشوائي 32 حرف (نفسه تكتبه في Webhooks بلوحة ميسر) |
| `AUTHENTICA_API_KEY` | من لوحة Authentica |
| `AUTHENTICA_TEMPLATE_ID` | اختياري: رقم قالب الرسالة |
| `SITE_URL` | رابط موقعك بدون `/` بالنهاية |
| `ADMIN_PASSWORD` | 16 حرف أو أكثر |
| `CRON_SECRET` | نص عشوائي 32 حرف |
| `IP_SALT` | نص عشوائي 32 حرف |
| `OTP_TEST_PHONE` + `OTP_TEST_CODE` | اختياري: رقم وكود ثابت للتجربة قبل تفعيل Authentica |
| `AD_DAYS`, `FEATURE_WEEK_HALALAS`, `FEATURE_MONTH_HALALAS`, `MAX_ADS_PER_DAY` | اختياري لتغيير المدة والأسعار والحد اليومي |

**قاعدة:** أي تغيير في المتغيرات ما يشتغل إلا بعد **Redeploy**.

## ويب هوك ميسر
في لوحة ميسر ← Webhooks: الرابط `موقعك/api/webhook`، والحدث `payment_paid`، وSecret Token نفس `MOYASAR_WEBHOOK_SECRET`.

## الأمان
- قاعدة البيانات مقفلة (RLS) ولا يوصل لها إلا الخادم.
- الجلسات في كوكي HttpOnly، ونخزن بصمة الرمز فقط.
- الدفع يتأكد من ميسر مباشرة، والتمييز ينطبق مرة وحدة فقط.
- حدود لعدد الأكواد ومحاولات الدخول والنشر والبلاغات.
- لا ترفع أبداً ملف فيه المفاتيح السرية على GitHub.
