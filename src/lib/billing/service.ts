import { isPlanKey, planForPrice, priceAllowlist, type PlanKey } from "./plans";
import { SUBSCRIPTION_STATUSES, type BillingRepo, type SubscriptionState, type SubscriptionStatus } from "./repo";

/** The narrow slice of Stripe this app uses. Real and fake implementations share it. */
export interface StripeGateway {
  createCustomer(input: { userId: string; email: string | null }): Promise<{ id: string; livemode: boolean }>;
  /** Returns null when the customer does not exist or was deleted. */
  getCustomerOwner(customerId: string): Promise<{ userId: string | null } | null>;
  createCheckoutSession(input: { customerId: string; priceId: string; userId: string; plan: PlanKey; successUrl: string; cancelUrl: string }): Promise<{ id: string; url: string | null }>;
  createPortalSession(input: { customerId: string; returnUrl: string }): Promise<{ url: string }>;
  listSubscriptions(customerId: string): Promise<SubscriptionSnapshot[]>;
}

export interface SubscriptionSnapshot {
  id: string;
  status: string;
  created: number;
  priceId: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  livemode: boolean;
}

export interface BillingDeps {
  repo: BillingRepo;
  stripe: StripeGateway;
  siteUrl: string;
  env?: NodeJS.ProcessEnv;
  liveApproved?: boolean;
}

/** Identity taken from a server-verified session. Never built from request input. */
export interface VerifiedUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
}

export class BillingError extends Error {
  constructor(
    public code: "EMAIL_NOT_VERIFIED" | "UNKNOWN_PLAN" | "PLAN_UNAVAILABLE" | "ALREADY_SUBSCRIBED" | "NO_BILLING_ACCOUNT" | "CHECKOUT_FAILED",
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "BillingError";
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ENTITLED: SubscriptionStatus[] = ["active", "trialing"];
const HOLDS_SUBSCRIPTION: SubscriptionStatus[] = ["active", "trialing", "past_due", "unpaid", "paused", "incomplete"];

export const isEntitled = (status: SubscriptionStatus) => ENTITLED.includes(status);

/** Finds the user's Stripe customer, creating and recording one on first use. */
export async function ensureCustomer(user: VerifiedUser, deps: BillingDeps) {
  const existing = await deps.repo.getByUserId(user.id);
  if (existing) return existing;
  // Stripe de-duplicates on the idempotency key, so two simultaneous first
  // checkouts for one user produce one Stripe customer.
  const customer = await deps.stripe.createCustomer({ userId: user.id, email: user.email });
  return deps.repo.linkCustomer(user.id, customer.id, customer.livemode);
}

export async function startCheckout(user: VerifiedUser, planInput: unknown, deps: BillingDeps): Promise<{ url: string }> {
  if (!user.emailVerified) throw new BillingError("EMAIL_NOT_VERIFIED", 403, "Confirm your email address before subscribing.");
  if (!isPlanKey(planInput)) throw new BillingError("UNKNOWN_PLAN", 400, "That plan does not exist.");
  const priceId = priceAllowlist(deps.env)[planInput];
  if (!priceId) throw new BillingError("PLAN_UNAVAILABLE", 503, "That plan is not available yet.");

  let record = await ensureCustomer(user, deps);
  // Refresh from Stripe first, so a missed webhook can never lead to a second subscription.
  await syncCustomer(record.stripeCustomerId, deps);
  record = (await deps.repo.getByUserId(user.id)) ?? record;
  if (HOLDS_SUBSCRIPTION.includes(record.subscriptionStatus)) {
    throw new BillingError("ALREADY_SUBSCRIBED", 409, "You already have a subscription. Use Manage billing to change it.");
  }
  const session = await deps.stripe.createCheckoutSession({
    customerId: record.stripeCustomerId,
    priceId,
    userId: user.id,
    plan: planInput,
    successUrl: `${deps.siteUrl}/dashboard?checkout=success`,
    cancelUrl: `${deps.siteUrl}/dashboard?checkout=cancelled`,
  });
  if (!session.url) throw new BillingError("CHECKOUT_FAILED", 502, "Stripe did not return a checkout page.");
  return { url: session.url };
}

/** Opens the billing portal for the signed-in user's own customer. Takes no customer input. */
export async function openPortal(user: VerifiedUser, deps: BillingDeps): Promise<{ url: string }> {
  const record = await deps.repo.getByUserId(user.id);
  if (!record) throw new BillingError("NO_BILLING_ACCOUNT", 404, "You don't have a billing account yet.");
  return deps.stripe.createPortalSession({ customerId: record.stripeCustomerId, returnUrl: `${deps.siteUrl}/dashboard` });
}

const RANK: Record<string, number> = { active: 6, trialing: 6, past_due: 5, unpaid: 4, paused: 3, incomplete: 3, canceled: 1, incomplete_expired: 0 };

/** The subscription that defines the customer's current standing. */
export function pickSubscription(subs: SubscriptionSnapshot[]): SubscriptionSnapshot | null {
  return [...subs].sort((a, b) => (RANK[b.status] ?? 0) - (RANK[a.status] ?? 0) || b.created - a.created)[0] ?? null;
}

export function toState(sub: SubscriptionSnapshot | null, env?: NodeJS.ProcessEnv): SubscriptionState {
  if (!sub) {
    return { stripeSubscriptionId: null, subscriptionStatus: "none", plan: null, priceId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, livemode: false };
  }
  const status = (SUBSCRIPTION_STATUSES as string[]).includes(sub.status) ? (sub.status as SubscriptionStatus) : "none";
  return {
    stripeSubscriptionId: sub.id,
    subscriptionStatus: status,
    // A price outside the allowlist grants no plan, whatever its status.
    plan: planForPrice(sub.priceId, env),
    priceId: sub.priceId,
    currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd * 1000).toISOString() : null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    livemode: sub.livemode,
  };
}

/**
 * Copies the customer's current subscription state from Stripe into Postgres.
 * It always reads the latest state from Stripe rather than trusting an event
 * payload, so duplicate, delayed, and out-of-order webhooks all converge on
 * the same correct result.
 */
export async function syncCustomer(customerId: string, deps: BillingDeps): Promise<"synced" | "unmapped"> {
  const record = await deps.repo.getByCustomerId(customerId);
  if (!record) return "unmapped";
  const subs = await deps.stripe.listSubscriptions(customerId);
  await deps.repo.setSubscriptionState(customerId, toState(pickSubscription(subs), deps.env));
  return "synced";
}

export interface WebhookEvent {
  id: string;
  type: string;
  livemode: boolean;
  created: number;
  data: { object: Record<string, unknown> };
}

export type WebhookOutcome = "synced" | "unmapped" | "duplicate" | "ignored" | "ignored_live" | "cleared";

const SYNC_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.paid",
  "invoice.payment_failed",
]);

function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string") return (value as { id: string }).id;
  return null;
}

/** Processes one signature-verified Stripe event. Safe to call any number of times per event. */
export async function handleWebhookEvent(event: WebhookEvent, deps: BillingDeps): Promise<WebhookOutcome> {
  if (event.livemode && !deps.liveApproved) return "ignored_live";
  if (!SYNC_EVENTS.has(event.type) && event.type !== "customer.deleted") return "ignored";

  const claim = await deps.repo.claimEvent({ id: event.id, type: event.type, livemode: event.livemode, created: event.created });
  if (claim === "duplicate") return "duplicate";

  try {
    const outcome = await applyEvent(event, deps);
    await deps.repo.finishEvent(event.id, null);
    return outcome;
  } catch (err) {
    await deps.repo.finishEvent(event.id, err instanceof Error ? err.message : String(err)).catch(() => undefined);
    throw err; // A non-2xx response makes Stripe retry later.
  }
}

async function applyEvent(event: WebhookEvent, deps: BillingDeps): Promise<WebhookOutcome> {
  const object = event.data.object;

  if (event.type === "customer.deleted") {
    const customerId = idOf(object.id);
    if (!customerId || !(await deps.repo.getByCustomerId(customerId))) return "unmapped";
    // Keep the record for history; just clear the subscription state.
    await deps.repo.setSubscriptionState(customerId, toState(null));
    return "cleared";
  }

  const customerId = idOf(object.customer);
  if (!customerId) return "unmapped";

  if (event.type === "checkout.session.completed" && !(await deps.repo.getByCustomerId(customerId))) {
    // Recovery path: the mapping was not saved before checkout. Both values
    // below were set by our server, and they must agree. Email is never used.
    const claimedUser = typeof object.client_reference_id === "string" ? object.client_reference_id : null;
    const owner = claimedUser && UUID.test(claimedUser) ? await deps.stripe.getCustomerOwner(customerId) : null;
    if (!claimedUser || !owner || owner.userId !== claimedUser) return "unmapped";
    const linked = await deps.repo.linkCustomer(claimedUser, customerId, event.livemode);
    if (linked.stripeCustomerId !== customerId) return "unmapped";
  }

  return syncCustomer(customerId, deps);
}
