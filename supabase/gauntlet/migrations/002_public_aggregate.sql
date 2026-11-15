-- Applied to the separate Supabase project "draft-anything-gauntlet" (ref xijqendpphnclwthqtfy).
-- A read-only summary the scheduled publishing job can fetch with the public (publishable) key, so no
-- secret is needed in GitHub. It returns pair counts only: no vote ids, no session codes, no timestamps.
-- Every vote is counted, repeats included.
create or replace function public.gauntlet_public_aggregate()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'sessions', (select count(distinct session) from public.gauntlet_votes),
    'pairs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', key, 'a', a, 'b', b,
        'aWins', a_wins, 'bWins', b_wins, 'ties', ties, 'skips', skips,
        'decisive', decisive, 'aLeftDecisive', a_left_decisive, 'leftWins', left_wins
      ) order by key)
      from public.gauntlet_pair_counts
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.gauntlet_public_aggregate() from public;
grant execute on function public.gauntlet_public_aggregate() to anon, authenticated;
