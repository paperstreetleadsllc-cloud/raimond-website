-- RAimondAI: link Stripe billing to Supabase Auth users.
-- Additive only. No existing table or row is changed or removed.

-- One row per authenticated user who has a Stripe customer.
create table if not exists public.billing_customers (
  user_id                 uuid primary key references auth.users (id) on delete restrict,
  stripe_customer_id      text not null unique check (stripe_customer_id ~ '^cus_[A-Za-z0-9_]+$'),
  stripe_subscription_id  text unique check (stripe_subscription_id is null or stripe_subscription_id ~ '^sub_[A-Za-z0-9_]+$'),
  subscription_status     text not null default 'none' check (subscription_status in (
                            'none', 'incomplete', 'incomplete_expired', 'trialing', 'active',
                            'past_due', 'canceled', 'unpaid', 'paused')),
  plan                    text check (plan is null or plan in ('monitor', 'growth', 'authority')),
  price_id                text,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  livemode                boolean not null default false,
  synced_at               timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.billing_customers is
  'Maps a Supabase auth user to a Stripe customer and its subscription state. Written only by trusted server code.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
  before update on public.billing_customers
  for each row execute function public.set_updated_at();

-- Stripe webhook deliveries, keyed by Stripe's event id, for idempotency.
create table if not exists public.stripe_webhook_events (
  event_id        text primary key,
  type            text not null,
  livemode        boolean not null default false,
  stripe_created  timestamptz,
  received_at     timestamptz not null default now(),
  processed_at    timestamptz,
  attempts        integer not null default 1,
  last_error      text
);

create index if not exists stripe_webhook_events_received_idx
  on public.stripe_webhook_events (received_at desc);

-- Access control ------------------------------------------------------------
alter table public.billing_customers enable row level security;
alter table public.stripe_webhook_events enable row level security;

-- Supabase grants broad table privileges to API roles by default. Remove them,
-- then give signed-in users read access only. With no INSERT, UPDATE or DELETE
-- privilege and no write policy, a customer cannot change a Stripe id or a
-- subscription status even with a valid session.
revoke all on table public.billing_customers from anon, authenticated;
revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select on table public.billing_customers to authenticated;

drop policy if exists "Users can read their own billing record" on public.billing_customers;
create policy "Users can read their own billing record"
  on public.billing_customers
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- stripe_webhook_events has no policies: only the service role can touch it.
