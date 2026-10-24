-- دكّة: جداول قاعدة البيانات ومخزن الصور
-- انسخ الملف كامل والصقه في Supabase ← SQL Editor ← Run. آمن لو شغّلته أكثر من مرة.

create extension if not exists pgcrypto;

create table if not exists public.ads (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('haraj','job')),
  type          text not null check (type in ('sell','buy','hire','seek')),
  cat           text not null,
  city          text not null,
  title         text not null check (char_length(title) between 4 and 80),
  details       text not null check (char_length(details) <= 1200),
  price         bigint check (price is null or price >= 0),
  salary        text not null default '',
  condition     text not null default '',
  name          text not null,
  phone         text not null,
  images        text[] not null default '{}',
  image_paths   text[] not null default '{}',
  status        text not null default 'active',
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  featured_until timestamptz,
  agreed_at     timestamptz,
  pledged_at    timestamptz,
  ip_hash       text
);
create index if not exists ads_live_idx  on public.ads (status, expires_at);
create index if not exists ads_phone_idx on public.ads (phone);

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null check (kind in ('feature','commission')),
  ad_id          uuid references public.ads(id) on delete set null,
  plan           text,
  amount         integer not null check (amount >= 100),   -- بالهللة
  sale_amount    bigint,
  status         text not null default 'pending',          -- pending / paid
  invoice_id     text unique,
  featured_until timestamptz,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);
create index if not exists payments_status_idx on public.payments (status, created_at);

create table if not exists public.reports (
  id         bigint generated always as identity primary key,
  ad_id      uuid not null references public.ads(id) on delete cascade,
  reason     text not null,
  note       text not null default '',
  ip_hash    text,
  created_at timestamptz not null default now()
);
create index if not exists reports_ad_idx on public.reports (ad_id);

create table if not exists public.rate_limits (
  id  bigint generated always as identity primary key,
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists rate_limits_key_idx on public.rate_limits (key, at);

create table if not exists public.sessions (
  token_hash text primary key,
  phone      text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- قفل كل الجداول: ما أحد يوصل لها إلا خادم الموقع بالمفتاح السري
alter table public.ads         enable row level security;
alter table public.payments    enable row level security;
alter table public.reports     enable row level security;
alter table public.rate_limits enable row level security;
alter table public.sessions    enable row level security;

-- مخزن الصور: عام للقراءة فقط، والرفع من الخادم
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ad-images', 'ad-images', true, 1048576, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];
