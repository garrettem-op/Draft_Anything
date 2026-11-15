-- Applied to the separate Supabase project "draft-anything-gauntlet" (ref xijqendpphnclwthqtfy).
-- Votes are written only by the submit-votes edge function (service role). Nobody else can read or write.
-- The primary key is the vote id, so a resend of the SAME vote is ignored. Separate votes on the same
-- matchup (any session, any time) all have different ids and are all stored and counted.
create table public.gauntlet_votes (
  id text primary key,
  session text not null,
  pair_key text not null,
  a text not null,
  b text not null,
  left_id text not null,
  right_id text not null,
  outcome text not null,
  winner text,
  pools text[] not null,
  ts timestamptz not null,
  model text not null,
  confidence text,
  schema_version int not null default 1,
  received_at timestamptz not null default now(),
  constraint gv_id_len check (char_length(id) between 3 and 80),
  constraint gv_session check (session ~ '^[a-z0-9]{8,32}$'),
  constraint gv_ids check (
    a ~ '^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_.-]*(#[a-z0-9_.-]+)?$'
    and b ~ '^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_.-]*(#[a-z0-9_.-]+)?$'
    and left_id ~ '^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_.-]*(#[a-z0-9_.-]+)?$'
    and right_id ~ '^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_.-]*(#[a-z0-9_.-]+)?$'
  ),
  constraint gv_canonical check (a collate "C" < b collate "C" and pair_key = a || '|' || b),
  constraint gv_orientation check ((left_id = a and right_id = b) or (left_id = b and right_id = a)),
  constraint gv_outcome check (outcome in ('win','tie','skip')),
  constraint gv_winner check (
    (outcome = 'win' and winner in (a, b)) or (outcome <> 'win' and winner is null)
  ),
  constraint gv_confidence check (confidence is null or confidence in ('sure','lean')),
  constraint gv_model check (char_length(model) between 1 and 40),
  constraint gv_version check (schema_version = 1)
);

create index gauntlet_votes_session_received_idx on public.gauntlet_votes (session, received_at desc);
create index gauntlet_votes_pair_idx on public.gauntlet_votes (pair_key);

alter table public.gauntlet_votes enable row level security;
revoke all on public.gauntlet_votes from anon, authenticated;

-- Pair counts with every vote counted (repeats included); no session keys, no timestamps.
create view public.gauntlet_pair_counts with (security_invoker = true) as
select
  pair_key as key, a, b,
  count(*) filter (where outcome = 'win' and winner = a)::int as a_wins,
  count(*) filter (where outcome = 'win' and winner = b)::int as b_wins,
  count(*) filter (where outcome = 'tie')::int as ties,
  count(*) filter (where outcome = 'skip')::int as skips,
  count(*) filter (where outcome = 'win')::int as decisive,
  count(*) filter (where outcome = 'win' and left_id = a)::int as a_left_decisive,
  count(*) filter (where outcome = 'win' and winner = left_id)::int as left_wins
from public.gauntlet_votes
group by pair_key, a, b;
revoke all on public.gauntlet_pair_counts from anon, authenticated;
