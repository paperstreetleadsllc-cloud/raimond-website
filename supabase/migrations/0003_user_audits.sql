-- RAimondAI: saved audits. Links a signed-in user to audits they ran.
-- Additive only. A join table is used because one audit record can be shared:
-- repeat requests for the same site within 24 hours reuse the same audit.

create table if not exists public.user_audits (
  user_id     uuid not null references auth.users (id) on delete cascade,
  audit_id    uuid not null references public.audits (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, audit_id)
);

create index if not exists user_audits_user_created_idx on public.user_audits (user_id, created_at desc);

-- Server-only, like audits: RLS on with no policies and no grants. The server
-- reads with the service role, filtered by the user id it verified itself.
alter table public.user_audits enable row level security;
revoke all on public.user_audits from anon, authenticated;
