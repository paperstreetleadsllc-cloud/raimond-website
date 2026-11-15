/**
 * Migrates old email-keyed billing records to user-id-keyed Postgres rows.
 *
 *   Step 1 (read-only):  npx tsx scripts/migrate-legacy-billing.ts plan <billing-customers.json>
 *                        Writes legacy-billing-review.json. Changes nothing.
 *   Step 2 (human):      Open the review file. Set "approved": true on rows you have checked.
 *   Step 3 (writes):     npx tsx scripts/migrate-legacy-billing.ts apply
 *
 * Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and STRIPE_SECRET_KEY in the environment.
 * The old JSON file is never modified or deleted.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { approvedLinks, proposeLegacyLinks, type KnownUser, type LegacyBillingRecord, type LinkProposal } from "../src/lib/billing/legacy";
import { SupabaseBillingRepo } from "../src/lib/billing/repo";
import { pickSubscription, toState, type SubscriptionSnapshot } from "../src/lib/billing/service";

const REVIEW_FILE = "legacy-billing-review.json";

function clients() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) throw new Error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and STRIPE_SECRET_KEY.");
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  return { db, stripe: new Stripe(STRIPE_SECRET_KEY), repo: new SupabaseBillingRepo(db) };
}

async function plan(file: string) {
  const legacy = JSON.parse(readFileSync(file, "utf8")) as LegacyBillingRecord[];
  const { db, stripe } = clients();

  const users: KnownUser[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users.map((u) => ({ id: u.id, email: u.email ?? null, emailVerified: Boolean(u.email_confirmed_at) })));
    if (data.users.length < 1000) break;
  }

  const emails = new Map<string, string | null>();
  for (const record of legacy) {
    if (!record.customerId) continue;
    try {
      const customer = await stripe.customers.retrieve(record.customerId);
      if (!customer.deleted) emails.set(record.customerId, customer.email);
    } catch {
      /* missing in Stripe: reported as stripe_customer_missing */
    }
  }

  const { data: rows, error } = await db.from("billing_customers").select("user_id, stripe_customer_id");
  if (error) throw error;
  const proposals = proposeLegacyLinks(legacy, users, emails, {
    userIds: new Set((rows ?? []).map((r) => r.user_id as string)),
    customerIds: new Set((rows ?? []).map((r) => r.stripe_customer_id as string)),
  });
  writeFileSync(REVIEW_FILE, JSON.stringify(proposals, null, 2));
  const tally = proposals.reduce<Record<string, number>>((t, p) => ({ ...t, [p.status]: (t[p.status] ?? 0) + 1 }), {});
  console.log(`${legacy.length} legacy records. Proposals by status:`, tally);
  console.log(`Review ${REVIEW_FILE}, mark checked rows "approved": true, then run: apply`);
}

async function apply() {
  const proposals = JSON.parse(readFileSync(REVIEW_FILE, "utf8")) as LinkProposal[];
  const links = approvedLinks(proposals);
  const { stripe, repo } = clients();
  for (const link of links) {
    const stored = await repo.linkCustomer(link.userId, link.stripeCustomerId, false);
    if (stored.stripeCustomerId !== link.stripeCustomerId) {
      console.log(`SKIPPED ${link.userId}: already linked to ${stored.stripeCustomerId}`);
      continue;
    }
    await stripe.customers.update(link.stripeCustomerId, { metadata: { supabase_user_id: link.userId } });
    const list = await stripe.subscriptions.list({ customer: link.stripeCustomerId, status: "all", limit: 20 });
    const snapshots: SubscriptionSnapshot[] = list.data.map((s) => ({
      id: s.id, status: s.status, created: s.created, priceId: s.items.data[0]?.price?.id ?? null,
      currentPeriodEnd: s.items.data[0]?.current_period_end ?? null, cancelAtPeriodEnd: s.cancel_at_period_end, livemode: s.livemode,
    }));
    await repo.setSubscriptionState(link.stripeCustomerId, toState(pickSubscription(snapshots)));
    console.log(`LINKED ${link.userId} -> ${link.stripeCustomerId}`);
  }
  console.log(`${links.length} approved link(s) processed of ${proposals.length} proposals.`);
}

const [command, file] = process.argv.slice(2);
(command === "plan" && file ? plan(file) : command === "apply" ? apply() : Promise.reject(new Error("Usage: plan <file> | apply"))).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
