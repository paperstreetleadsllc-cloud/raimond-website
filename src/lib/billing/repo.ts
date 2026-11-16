import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanKey } from "./plans";

export type SubscriptionStatus =
  | "none" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "none", "incomplete", "incomplete_expired", "trialing", "active", "past_due", "canceled", "unpaid", "paused",
];

export interface BillingRecord {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  plan: PlanKey | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  livemode: boolean;
}

export type SubscriptionState = Pick<
  BillingRecord,
  "stripeSubscriptionId" | "subscriptionStatus" | "plan" | "priceId" | "currentPeriodEnd" | "cancelAtPeriodEnd" | "livemode"
>;

export interface WebhookEventInput {
  id: string;
  type: string;
  livemode: boolean;
  created: number;
}

/** Storage for billing relationships. Implementations must be safe to call repeatedly. */
export interface BillingRepo {
  getByUserId(userId: string): Promise<BillingRecord | null>;
  getByCustomerId(stripeCustomerId: string): Promise<BillingRecord | null>;
  /** Creates the mapping unless the user already has one. Returns the stored record either way. */
  linkCustomer(userId: string, stripeCustomerId: string, livemode: boolean): Promise<BillingRecord>;
  setSubscriptionState(stripeCustomerId: string, state: SubscriptionState): Promise<void>;
  /** Records a webhook delivery. "duplicate" means it was already fully processed. */
  claimEvent(event: WebhookEventInput): Promise<"new" | "retry" | "duplicate">;
  finishEvent(eventId: string, error: string | null): Promise<void>;
}

interface Row {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  plan: PlanKey | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  livemode: boolean;
}

const toRecord = (r: Row): BillingRecord => ({
  userId: r.user_id,
  stripeCustomerId: r.stripe_customer_id,
  stripeSubscriptionId: r.stripe_subscription_id,
  subscriptionStatus: r.subscription_status,
  plan: r.plan,
  priceId: r.price_id,
  currentPeriodEnd: r.current_period_end,
  cancelAtPeriodEnd: r.cancel_at_period_end,
  livemode: r.livemode,
});

/** Postgres implementation. Must be given the service-role client. */
export class SupabaseBillingRepo implements BillingRepo {
  constructor(private db: SupabaseClient) {}

  private async one(column: "user_id" | "stripe_customer_id", value: string) {
    const { data, error } = await this.db.from("billing_customers").select("*").eq(column, value).maybeSingle();
    if (error) throw new Error(`billing lookup failed: ${error.message}`);
    return data ? toRecord(data as Row) : null;
  }

  getByUserId(userId: string) {
    return this.one("user_id", userId);
  }

  getByCustomerId(stripeCustomerId: string) {
    return this.one("stripe_customer_id", stripeCustomerId);
  }

  async linkCustomer(userId: string, stripeCustomerId: string, livemode: boolean) {
    // ON CONFLICT DO NOTHING: a second request for the same user cannot overwrite the first mapping.
    const { error } = await this.db
      .from("billing_customers")
      .upsert({ user_id: userId, stripe_customer_id: stripeCustomerId, livemode }, { onConflict: "user_id", ignoreDuplicates: true });
    if (error) throw new Error(`billing link failed: ${error.message}`);
    const stored = await this.getByUserId(userId);
    if (!stored) throw new Error("billing link failed: record missing after insert");
    return stored;
  }

  async setSubscriptionState(stripeCustomerId: string, s: SubscriptionState) {
    const { error } = await this.db
      .from("billing_customers")
      .update({
        stripe_subscription_id: s.stripeSubscriptionId,
        subscription_status: s.subscriptionStatus,
        plan: s.plan,
        price_id: s.priceId,
        current_period_end: s.currentPeriodEnd,
        cancel_at_period_end: s.cancelAtPeriodEnd,
        livemode: s.livemode,
        synced_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", stripeCustomerId);
    if (error) throw new Error(`billing update failed: ${error.message}`);
  }

  async claimEvent(event: WebhookEventInput) {
    const { error } = await this.db.from("stripe_webhook_events").insert({
      event_id: event.id,
      type: event.type,
      livemode: event.livemode,
      stripe_created: new Date(event.created * 1000).toISOString(),
    });
    if (!error) return "new" as const;
    if (error.code !== "23505") throw new Error(`webhook event insert failed: ${error.message}`);
    const { data, error: readError } = await this.db
      .from("stripe_webhook_events")
      .select("processed_at, attempts")
      .eq("event_id", event.id)
      .single();
    if (readError) throw new Error(`webhook event read failed: ${readError.message}`);
    if (data.processed_at) return "duplicate" as const;
    await this.db.from("stripe_webhook_events").update({ attempts: (data.attempts ?? 1) + 1 }).eq("event_id", event.id);
    return "retry" as const;
  }

  async finishEvent(eventId: string, error: string | null) {
    const patch = error ? { last_error: error.slice(0, 500) } : { processed_at: new Date().toISOString(), last_error: null };
    const { error: dbError } = await this.db.from("stripe_webhook_events").update(patch).eq("event_id", eventId);
    if (dbError) throw new Error(`webhook event update failed: ${dbError.message}`);
  }
}
