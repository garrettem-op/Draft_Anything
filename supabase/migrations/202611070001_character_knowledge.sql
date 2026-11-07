-- AI Character Knowledge Engine. Only server-side service-role code can write.
-- Anonymous clients NEVER gain rights to promote an LLM ruling globally.
create extension if not exists pgcrypto;

create table if not exists public.character_knowledge (
  pool text not null,
  name text not null,
  tag text not null,
  feat text not null,
  kind text not null default 'verified_ability',
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'approved' check (status in ('approved','revoked')),
  source_dispute_id uuid,
  approved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (pool, name, tag)
);
create index if not exists character_knowledge_status_idx on public.character_knowledge(status);
alter table public.character_knowledge enable row level security;
revoke all on public.character_knowledge from anon, authenticated;
-- Public reads are served only by the rate-controlled Edge Function.

create table if not exists public.character_disputes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  pool text not null,
  name text not null,
  tag text not null,
  claim text not null default '',
  source_url text not null default '',
  status text not null check (status in ('accepted_provisional','rejected','inconclusive','approved','revoked')),
  confidence numeric(4,3) not null default 0,
  specific_feat text not null default '',
  rationale text not null default '',
  continuity text not null default '',
  sources jsonb not null default '[]'::jsonb,
  model text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_note text not null default ''
);
create index if not exists character_disputes_owner_idx on public.character_disputes(owner_id,created_at desc);
create index if not exists character_disputes_status_idx on public.character_disputes(status,created_at desc);
alter table public.character_disputes enable row level security;
revoke all on public.character_disputes from anon,authenticated;

create table if not exists public.character_knowledge_reviews (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid,
  pool text not null,
  name text not null,
  tag text not null,
  action text not null check (action in ('approve','reject','revoke')),
  before_value jsonb,
  after_value jsonb,
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.character_knowledge_reviews enable row level security;
revoke all on public.character_knowledge_reviews from anon,authenticated;

create table if not exists public.character_research_rate_limits (
  subject_hash text not null,
  bucket date not null default (now() at time zone 'UTC')::date,
  attempts integer not null default 0,
  primary key(subject_hash,bucket)
);
alter table public.character_research_rate_limits enable row level security;
revoke all on public.character_research_rate_limits from anon,authenticated;

-- One atomic check works under concurrent requests and cannot be invoked by public roles.
create or replace function public.charge_character_research_quota(p_hash text, p_max integer default 8)
returns boolean
language sql security definer set search_path = public
as $$
 with claim as (
   insert into public.character_research_rate_limits(subject_hash,bucket,attempts)
   values (left(p_hash,128),(now() at time zone 'UTC')::date,1)
   on conflict (subject_hash,bucket) do update
     set attempts=public.character_research_rate_limits.attempts+1
     where public.character_research_rate_limits.attempts < least(greatest(p_max,1),15)
   returning 1
 )
 select exists(select 1 from claim);
$$;
revoke all on function public.charge_character_research_quota(text,integer) from public,anon,authenticated;
grant execute on function public.charge_character_research_quota(text,integer) to service_role;
