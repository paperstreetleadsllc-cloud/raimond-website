import type { BillingRecord, BillingRepo, SubscriptionState, WebhookEventInput } from "@/lib/billing/repo";
import type { BillingDeps, StripeGateway, SubscriptionSnapshot, VerifiedUser } from "@/lib/billing/service";

export class MemoryRepo implements BillingRepo {
  rows = new Map<string, BillingRecord>();
  events = new Map<string, { processed: boolean; attempts: number; error: string | null }>();

  async getByUserId(userId: string) {
    return this.rows.get(userId) ?? null;
  }
  async getByCustomerId(id: string) {
    return [...this.rows.values()].find((r) => r.stripeCustomerId === id) ?? null;
  }
  async linkCustomer(userId: string, stripeCustomerId: string, livemode: boolean) {
    if (!this.rows.has(userId)) {
      if (await this.getByCustomerId(stripeCustomerId)) throw new Error("billing link failed: duplicate key stripe_customer_id");
      this.rows.set(userId, { userId, stripeCustomerId, stripeSubscriptionId: null, subscriptionStatus: "none", plan: null, priceId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, livemode });
    }
    return this.rows.get(userId)!;
  }
  async setSubscriptionState(stripeCustomerId: string, state: SubscriptionState) {
    const row = await this.getByCustomerId(stripeCustomerId);
    if (row) Object.assign(row, state);
  }
  async claimEvent(event: WebhookEventInput) {
    const seen = this.events.get(event.id);
    if (!seen) {
      this.events.set(event.id, { processed: false, attempts: 1, error: null });
      return "new" as const;
    }
    if (seen.processed) return "duplicate" as const;
    seen.attempts++;
    return "retry" as const;
  }
  async finishEvent(eventId: string, error: string | null) {
    const e = this.events.get(eventId)!;
    e.processed = error === null;
    e.error = error;
  }
}

export class FakeStripe implements StripeGateway {
  customers = new Map<string, { userId: string | null; deleted?: boolean }>();
  subscriptions = new Map<string, SubscriptionSnapshot[]>();
  calls: { method: string; args: unknown }[] = [];
  private byKey = new Map<string, string>();
  private n = 0;

  async createCustomer(input: { userId: string; email: string | null }) {
    this.calls.push({ method: "createCustomer", args: input });
    // Mirrors Stripe's idempotency-key behaviour for the per-user key.
    const existing = this.byKey.get(input.userId);
    if (existing) return { id: existing, livemode: false };
    const id = `cus_test${++this.n}`;
    this.byKey.set(input.userId, id);
    this.customers.set(id, { userId: input.userId });
    return { id, livemode: false };
  }
  async getCustomerOwner(customerId: string) {
    const c = this.customers.get(customerId);
    return c && !c.deleted ? { userId: c.userId } : null;
  }
  async createCheckoutSession(input: Parameters<StripeGateway["createCheckoutSession"]>[0]) {
    this.calls.push({ method: "createCheckoutSession", args: input });
    return { id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" };
  }
  async createPortalSession(input: { customerId: string; returnUrl: string }) {
    this.calls.push({ method: "createPortalSession", args: input });
    return { url: `https://billing.stripe.com/p/session/${input.customerId}` };
  }
  async listSubscriptions(customerId: string) {
    return this.subscriptions.get(customerId) ?? [];
  }
  last(method: string) {
    return this.calls.filter((c) => c.method === method).at(-1)?.args as Record<string, string>;
  }
}

export const TEST_ENV = {
  STRIPE_PRICE_MONITOR: "price_monitor123",
  STRIPE_PRICE_GROWTH: "price_growth123",
  STRIPE_PRICE_AUTHORITY: "price_authority123",
} as unknown as NodeJS.ProcessEnv;

export function makeDeps(overrides: Partial<BillingDeps> = {}) {
  const repo = new MemoryRepo();
  const stripe = new FakeStripe();
  const deps: BillingDeps = { repo, stripe, siteUrl: "https://raimondai.com", env: TEST_ENV, liveApproved: false, ...overrides };
  return { repo, stripe, deps };
}

export const ALICE: VerifiedUser = { id: "11111111-1111-4111-8111-111111111111", email: "alice@example.com", emailVerified: true };
export const BOB: VerifiedUser = { id: "22222222-2222-4222-8222-222222222222", email: "bob@example.com", emailVerified: true };

export const sub = (over: Partial<SubscriptionSnapshot> = {}): SubscriptionSnapshot => ({
  id: "sub_test1", status: "active", created: 1_800_000_000, priceId: "price_growth123", currentPeriodEnd: 1_802_592_000, cancelAtPeriodEnd: false, livemode: false, ...over,
});
