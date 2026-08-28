-- AZ Multi initial production data model
-- Run in Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'AZ Multi',
  industry text,
  audience text,
  tone text,
  description text,
  goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('facebook','instagram','tiktok','x','google','youtube')),
  external_account_id text,
  account_name text,
  handle text,
  status text not null default 'disconnected',
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform, external_account_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  caption text,
  platforms text[] not null default '{}',
  media_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','scheduled','publishing','published','failed','cancelled')),
  scheduled_at timestamptz,
  published_at timestamptz,
  provider_results jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source_platform text,
  external_user_id text,
  lifecycle_status text not null default 'lead',
  tags text[] not null default '{}',
  notes text,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  platform text not null,
  external_thread_id text,
  unread_count integer not null default 0,
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text,
  external_message_id text,
  sent_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  objective text,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  platforms text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  objective text,
  platforms text[] not null default '{}',
  daily_budget numeric(12,2),
  currency text not null default 'USD',
  audience jsonb not null default '{}'::jsonb,
  keywords text[] not null default '{}',
  negative_keywords text[] not null default '{}',
  opportunity_score numeric(5,2),
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  provider_campaign_ids jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ad_campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  metric_date date not null,
  platform text not null,
  spend numeric(12,2) not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  conversions numeric(12,2) not null default 0,
  revenue numeric(12,2) not null default 0,
  ctr numeric(8,4),
  cpc numeric(12,4),
  cpa numeric(12,4),
  roas numeric(12,4),
  raw jsonb not null default '{}'::jsonb,
  unique(ad_campaign_id, metric_date, platform)
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('caption','image_prompt','video_concept','ad_copy','keyword_plan')),
  input text,
  output text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists posts_user_schedule_idx on public.posts(user_id, scheduled_at);
create index if not exists contacts_user_updated_idx on public.contacts(user_id, updated_at desc);
create index if not exists conversations_user_last_idx on public.conversations(user_id, last_message_at desc);
create index if not exists ad_metrics_campaign_date_idx on public.ad_metrics_daily(ad_campaign_id, metric_date desc);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.posts enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.campaigns enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_metrics_daily enable row level security;
alter table public.ai_generations enable row level security;

-- User-owned row policies
create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "brand_profiles own rows" on public.brand_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "social_accounts own rows" on public.social_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts own rows" on public.posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contacts own rows" on public.contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversations own rows" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages own rows" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "campaigns own rows" on public.campaigns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ad_campaigns own rows" on public.ad_campaigns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ad_metrics own rows" on public.ad_metrics_daily for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_generations own rows" on public.ai_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create profile automatically for new auth users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
