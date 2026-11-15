import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Runs the real migration files in a real Postgres engine (in-process) and
 * checks the access rules the way Supabase applies them: by database role.
 */
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const migration = (name: string) =>
  readFileSync(path.join(__dirname, "..", "supabase", "migrations", name), "utf8").replace(/create extension[^;]*;/gi, "");

let db: PGlite;

async function as<T>(role: "anon" | "authenticated" | "service_role", userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ""]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}

const denied = (p: Promise<unknown>) => expect(p).rejects.toThrow(/permission denied|row-level security/);

beforeAll(async () => {
  db = new PGlite();
  // Minimal stand-in for what Supabase provides: the auth schema, API roles, and its default grants.
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    create table public.waitlist_leads (id serial primary key, email text);
    insert into public.waitlist_leads (email) values ('existing@example.com');
    insert into auth.users (id) values ('${A}'), ('${B}');
  `);
  await db.exec(migration("0001_audits.sql"));
  await db.exec(migration("0002_billing.sql"));
  await as("service_role", null, async () => {
    await db.query(`insert into public.billing_customers (user_id, stripe_customer_id, subscription_status, plan) values ($1, 'cus_A', 'active', 'growth'), ($2, 'cus_B', 'none', null)`, [A, B]);
    await db.query(`insert into public.stripe_webhook_events (event_id, type) values ('evt_1', 'invoice.paid')`);
  });
}, 60_000);

describe("billing table access rules (real Postgres)", () => {
  it("lets a signed-in user read only their own billing record", async () => {
    const rows = await as("authenticated", A, () => db.query<{ stripe_customer_id: string }>("select stripe_customer_id from public.billing_customers"));
    expect(rows.rows).toEqual([{ stripe_customer_id: "cus_A" }]);
    const other = await as("authenticated", A, () => db.query("select * from public.billing_customers where user_id = $1", [B]));
    expect(other.rows).toEqual([]);
  });

  it("shows nothing to a session with no user id", async () => {
    const rows = await as("authenticated", null, () => db.query("select * from public.billing_customers"));
    expect(rows.rows).toEqual([]);
  });

  it("blocks anonymous visitors entirely", async () => {
    await denied(as("anon", null, () => db.query("select * from public.billing_customers")));
  });

  it("stops a customer changing their own subscription status, plan, or Stripe ids", async () => {
    await denied(as("authenticated", B, () => db.query("update public.billing_customers set subscription_status = 'active', plan = 'authority' where user_id = $1", [B])));
    await denied(as("authenticated", B, () => db.query("update public.billing_customers set stripe_customer_id = 'cus_A' where user_id = $1", [B])));
    await denied(as("authenticated", B, () => db.query("update public.billing_customers set stripe_subscription_id = 'sub_free' where user_id = $1", [B])));
    const row = await db.query<{ subscription_status: string }>("select subscription_status from public.billing_customers where user_id = $1", [B]);
    expect(row.rows[0].subscription_status).toBe("none");
  });

  it("stops a customer inserting or deleting billing records", async () => {
    await db.query("insert into auth.users (id) values ('33333333-3333-4333-8333-333333333333')");
    await denied(as("authenticated", "33333333-3333-4333-8333-333333333333", () => db.query("insert into public.billing_customers (user_id, stripe_customer_id, subscription_status) values ('33333333-3333-4333-8333-333333333333', 'cus_forged', 'active')")));
    await denied(as("authenticated", A, () => db.query("delete from public.billing_customers where user_id = $1", [A])));
  });

  it("hides the webhook event log from customers", async () => {
    await denied(as("authenticated", A, () => db.query("select * from public.stripe_webhook_events")));
    await denied(as("anon", null, () => db.query("insert into public.stripe_webhook_events (event_id, type) values ('evt_x', 'x')")));
  });

  it("lets trusted backend code write", async () => {
    await as("service_role", null, () => db.query("update public.billing_customers set subscription_status = 'past_due' where stripe_customer_id = 'cus_A'"));
    const row = await db.query<{ subscription_status: string }>("select subscription_status from public.billing_customers where user_id = $1", [A]);
    expect(row.rows[0].subscription_status).toBe("past_due");
  });
});

describe("billing table integrity (real Postgres)", () => {
  it("enforces one Stripe customer per user and one user per Stripe customer", async () => {
    await db.query("insert into auth.users (id) values ('44444444-4444-4444-8444-444444444444')");
    await expect(db.query("insert into public.billing_customers (user_id, stripe_customer_id) values ('44444444-4444-4444-8444-444444444444', 'cus_A')")).rejects.toThrow(/duplicate key/);
    await expect(db.query("insert into public.billing_customers (user_id, stripe_customer_id) values ($1, 'cus_second')", [A])).rejects.toThrow(/duplicate key/);
  });

  it("makes linking idempotent with ON CONFLICT DO NOTHING", async () => {
    await db.query("insert into public.billing_customers (user_id, stripe_customer_id) values ($1, 'cus_overwrite') on conflict (user_id) do nothing", [A]);
    const row = await db.query<{ stripe_customer_id: string }>("select stripe_customer_id from public.billing_customers where user_id = $1", [A]);
    expect(row.rows[0].stripe_customer_id).toBe("cus_A");
  });

  it("requires a real auth user and refuses to drop a user who has billing records", async () => {
    await expect(db.query("insert into public.billing_customers (user_id, stripe_customer_id) values ('99999999-9999-4999-8999-999999999999', 'cus_ghost')")).rejects.toThrow(/foreign key/);
    await expect(db.query("delete from auth.users where id = $1", [A])).rejects.toThrow(/foreign key/);
  });

  it("rejects malformed ids and unknown statuses", async () => {
    await expect(db.query("update public.billing_customers set subscription_status = 'vip' where user_id = $1", [A])).rejects.toThrow(/check constraint/);
    await expect(db.query("update public.billing_customers set stripe_customer_id = 'not-a-customer' where user_id = $1", [A])).rejects.toThrow(/check constraint/);
    await expect(db.query("update public.billing_customers set plan = 'enterprise' where user_id = $1", [A])).rejects.toThrow(/check constraint/);
  });

  it("de-duplicates webhook events by Stripe event id", async () => {
    await expect(db.query("insert into public.stripe_webhook_events (event_id, type) values ('evt_1', 'invoice.paid')")).rejects.toThrow(/duplicate key/);
  });

  it("maintains updated_at automatically", async () => {
    const before = await db.query<{ updated_at: Date }>("select updated_at from public.billing_customers where user_id = $1", [B]);
    await new Promise((r) => setTimeout(r, 15));
    await db.query("update public.billing_customers set plan = 'monitor' where user_id = $1", [B]);
    const after = await db.query<{ updated_at: Date }>("select updated_at from public.billing_customers where user_id = $1", [B]);
    expect(new Date(after.rows[0].updated_at).getTime()).toBeGreaterThan(new Date(before.rows[0].updated_at).getTime());
  });

  it("can be applied twice and leaves existing tables and rows untouched", async () => {
    await db.exec(migration("0002_billing.sql"));
    const leads = await db.query<{ email: string }>("select email from public.waitlist_leads");
    expect(leads.rows).toEqual([{ email: "existing@example.com" }]);
    const billing = await db.query<{ n: number }>("select count(*)::int as n from public.billing_customers");
    expect(billing.rows[0].n).toBe(2);
  });
});
