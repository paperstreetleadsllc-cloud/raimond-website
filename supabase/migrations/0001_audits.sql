-- RAimondAI Phase 2: public audit storage.
-- Additive only. Does not touch existing tables (including waitlist_leads).

create extension if not exists pgcrypto;

create table if not exists public.audits (
  id          uuid primary key default gen_random_uuid(),
  site_key    text not null,
  input_url   text not null,
  status      text not null check (status in ('queued', 'running', 'completed', 'failed')),
  progress    jsonb,
  result      jsonb,
  error       jsonb,
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists audits_site_key_created_idx on public.audits (site_key, created_at desc);
create index if not exists audits_ip_hash_created_idx on public.audits (ip_hash, created_at desc);
create index if not exists audits_created_idx on public.audits (created_at desc);

create table if not exists public.audit_leads (
  id          uuid primary key default gen_random_uuid(),
  audit_id    uuid not null references public.audits (id) on delete cascade,
  email       text not null,
  name        text,
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  unique (audit_id, email)
);

create index if not exists audit_leads_created_idx on public.audit_leads (created_at desc);

-- Row-level security on, with no policies: only the server (service role) can
-- read or write. The browser never talks to these tables directly.
alter table public.audits enable row level security;
alter table public.audit_leads enable row level security;
