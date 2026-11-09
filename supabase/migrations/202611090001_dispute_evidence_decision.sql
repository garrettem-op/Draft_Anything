-- Preserve the model's original answer separately from the decision policy.
-- This lets the server explain a rejected/uncertain result and safely re-evaluate
-- a cached finding if the provisional threshold changes without a second AI call.
alter table public.character_disputes
  add column if not exists research_verdict text
    check (research_verdict in ('supports','does_not_support','inconclusive')),
  add column if not exists decision_reason text not null default '';
create index if not exists character_disputes_verdict_idx
  on public.character_disputes(research_verdict,status);
