-- NidhiGo Tamil database. Apply in Supabase SQL Editor or via Supabase migrations.
-- Demo products use no real financial claims and contain no affiliate URLs.
create extension if not exists pgcrypto;
create table if not exists public.categories (
  slug text primary key check (slug in ('loan','bank-account','credit-card','demat-account','insurance','investment')),
  title text not null,
  description text not null default '',
  icon_url text,
  emoji text not null default '💼',
  accent text not null default 'from-emerald-50 to-teal-50',
  sort_order int not null default 0
);
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check(length(slug) between 3 and 150),
  category text not null references public.categories(slug),
  title text not null check(length(title) between 3 and 180),
  provider_name text not null default '',
  description text not null default '',
  logo_url text,
  highlight text not null default '',
  benefits text[] not null default '{}'::text[],
  documents text[] not null default '{}'::text[],
  steps text[] not null default '{}'::text[],
  tutorial_url text,
  affiliate_url text,
  is_demo boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists offers_category_published_idx on public.offers(category,published,created_at desc);
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check(length(full_name) between 2 and 120),
  email text not null check(length(email) between 3 and 254),
  phone text not null check(length(phone) between 10 and 15),
  category text not null references public.categories(slug),
  offer_id uuid references public.offers(id) on delete set null,
  offer_title text,
  purpose text not null default '',
  message text not null default '',
  status text not null default 'new' check(status in ('new','contacted','closed')),
  consent_at timestamptz not null,
  admin_notes text not null default ''
);
create index if not exists applications_created_category_idx on public.applications(created_at desc,category);
create index if not exists applications_phone_created_idx on public.applications(phone,created_at desc);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  id int primary key default 1 check(id=1),
  logo_url text not null default '',banner_url text not null default '',
  headline text not null default 'Simple Banking, Brighter Futures',
  subheadline text not null default 'All Financial Solutions in One Place',
  youtube_url text not null default '',instagram_url text not null default '',
  telegram_url text not null default '',x_url text not null default ''
);
insert into public.site_settings(id) values(1) on conflict(id) do nothing;
insert into public.categories(slug,title,description,emoji,sort_order) values
('loan','Loans','Personal, Home & Business','💰',1),
('bank-account','Bank Accounts','Savings, Current & Digital','🏦',2),
('credit-card','Credit Cards','Cashback, Rewards & More','💳',3),
('demat-account','Demat Account','Investing & Trading','📈',4),
('insurance','Insurance','Life, Health & Vehicle','🛡️',5),
('investment','Investment','Mutual Funds & SIP','🌱',6)
on conflict(slug) do nothing;
-- Bundled icons are placeholders from the user reference and can be replaced in Admin.
update public.categories set icon_url='/assets/loan.png' where slug='loan' and icon_url is null;
update public.categories set icon_url='/assets/bank-account.png' where slug='bank-account' and icon_url is null;
update public.categories set icon_url='/assets/credit-card.png' where slug='credit-card' and icon_url is null;
update public.categories set icon_url='/assets/demat-account.png' where slug='demat-account' and icon_url is null;
update public.categories set icon_url='/assets/insurance.png' where slug='insurance' and icon_url is null;
update public.categories set icon_url='/assets/investment.png' where slug='investment' and icon_url is null;
-- Demo cards are clearly marked and have no affiliate link or financial promise.
insert into public.offers(slug,category,title,provider_name,description,highlight,benefits,documents,steps,is_demo,published)
values
('personal-loan-demo','loan','Personal Loan — Demo','Sample Lender','General personal loan information.','Terms vary',ARRAY['Review provider eligibility','Compare interest and fees'],ARRAY['Identity proof as requested','Income proof if required'],ARRAY['Review the information','Confirm terms with lender','Use a verified affiliate link'],true,true),
('home-loan-demo','loan','Home Loan — Demo','Sample Lender','General housing finance information.','Terms vary',ARRAY['Check processing fee','Compare repayment periods'],ARRAY['Identity proof as requested','Property documents if applicable'],ARRAY['Check eligibility','Read the provider documents','Follow the official process'],true,true),
('digital-savings-demo','bank-account','Digital Savings Account — Demo','Sample Bank','Digital savings account preview.','Bank KYC applies',ARRAY['Review minimum balance','Digital onboarding may be available'],ARRAY['Identity proof','PAN where required'],ARRAY['Check features and fees','Follow bank KYC','Complete via affiliate link'],true,true),
('current-account-demo','bank-account','Current Account — Demo','Sample Bank','Business account preview.','Bank charges vary',ARRAY['Business banking','Confirm eligibility'],ARRAY['Business documents','Identity proof'],ARRAY['Review tariff','Prepare documents','Apply with provider'],true,true),
('cashback-card-demo','credit-card','Cashback Credit Card — Demo','Sample Bank','Cashback card example.','Rewards subject to terms',ARRAY['Check joining and annual fees','Review cashback caps'],ARRAY['PAN if requested','Income proof if required'],ARRAY['Compare benefits','Check eligibility','Apply via partner link'],true,true),
('travel-card-demo','credit-card','Travel Credit Card — Demo','Sample Bank','Travel rewards card example.','Fees may apply',ARRAY['Review lounge eligibility','Check rewards expiry'],ARRAY['KYC documents','Income documents if required'],ARRAY['Compare fee schedule','Read terms','Apply via partner link'],true,true),
('starter-demat-demo','demat-account','Starter Demat Account — Demo','Sample Broker','Demat account introduction.','Brokerage varies',ARRAY['Check AMC','Review transaction charges'],ARRAY['PAN','Identity & address proof'],ARRAY['Compare plans','Understand market risks','Open account with provider'],true,true),
('trading-demat-demo','demat-account','Trading + Demat — Demo','Sample Broker','Trading and demat example.','Market risks apply',ARRAY['Charts & reports','Brokerage plan'],ARRAY['PAN','Bank information'],ARRAY['Check broker credentials','Read charges','Apply with provider'],true,true),
('health-cover-demo','insurance','Health Insurance — Demo','Sample Insurer','General health cover information.','Policy exclusions apply',ARRAY['Check waiting periods','Review sum insured'],ARRAY['KYC documents','Medical disclosures as applicable'],ARRAY['Read policy exclusions','Check premium','Apply with insurer'],true,true),
('term-cover-demo','insurance','Term Insurance — Demo','Sample Insurer','Term cover introduction.','Underwriting applies',ARRAY['Compare term plans','Understand disclosures'],ARRAY['Identity proof','Income details as required'],ARRAY['Review exclusions','Check eligibility','Apply with insurer'],true,true),
('sip-investment-demo','investment','SIP Investment — Demo','Sample Platform','Understand systematic investing.','Returns not guaranteed',ARRAY['Read scheme documents','Understand risks'],ARRAY['PAN','KYC details'],ARRAY['Assess risk','Read disclosures','Use a regulated provider'],true,true),
('mutual-fund-demo','investment','Mutual Funds — Demo','Sample Platform','Mutual fund introduction.','Market risks apply',ARRAY['Check expense ratio','Review risk rating'],ARRAY['PAN','KYC details'],ARRAY['Compare fund documents','Check objectives','Invest via approved platform'],true,true)
on conflict(slug) do nothing;
-- Public has read-only access to explicitly published offers and public site information.
alter table public.categories enable row level security;
alter table public.offers enable row level security;
alter table public.applications enable row level security;
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
drop policy if exists categories_public_select on public.categories;
create policy categories_public_select on public.categories for select to anon,authenticated using(true);
drop policy if exists offers_public_select on public.offers;
create policy offers_public_select on public.offers for select to anon,authenticated using(published=true);
drop policy if exists site_settings_public_select on public.site_settings;
create policy site_settings_public_select on public.site_settings for select to anon,authenticated using(true);
-- No public read access or public write policy for personal applications.
-- Only service role (after server-side validation) can access leads or edit products.
-- Storage bucket: public read assets; writes restricted to server-side admin API.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('nidhigo-public','nidhigo-public',true,5242880,ARRAY['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
