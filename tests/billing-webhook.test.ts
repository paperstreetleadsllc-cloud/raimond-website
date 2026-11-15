import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { handleWebhookEvent, startCheckout, type WebhookEvent } from "@/lib/billing/service";
import { ALICE, BOB, makeDeps, sub } from "./billing-fakes";

let counter = 0;
const evt = (type: string, object: Record<string, unknown>, over: Partial<WebhookEvent> = {}): WebhookEvent => ({
  id: `evt_${++counter}`, type, livemode: false, created: 1_800_000_000 + counter, data: { object }, ...over,
});

async function subscribed() {
  const ctx = makeDeps();
  await startCheckout(ALICE, "growth", ctx.deps);
  return ctx;
}

describe("Stripe webhook signature", () => {
  const stripe = new Stripe("sk_test_dummy");
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_sig", object: "event", type: "customer.subscription.updated", data: { object: {} } });

  it("accepts a correctly signed payload", async () => {
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret });
    const event = await stripe.webhooks.constructEventAsync(payload, header, secret);
    expect(event.id).toBe("evt_sig");
  });

  it("rejects a tampered payload, a wrong secret, and a stale timestamp", async () => {
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret });
    await expect(stripe.webhooks.constructEventAsync(payload.replace("evt_sig", "evt_forged"), header, secret)).rejects.toThrow();
    await expect(stripe.webhooks.constructEventAsync(payload, header, "whsec_other")).rejects.toThrow();
    const old = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret, timestamp: Math.floor(Date.now() / 1000) - 3600 });
    await expect(stripe.webhooks.constructEventAsync(payload, old, secret)).rejects.toThrow();
  });
});

describe("webhook processing", () => {
  it("records a new subscription against the mapped user", async () => {
    const { repo, stripe, deps } = await subscribed();
    stripe.subscriptions.set("cus_test1", [sub()]);
    expect(await handleWebhookEvent(evt("customer.subscription.created", { id: "sub_test1", customer: "cus_test1" }), deps)).toBe("synced");
    expect(await repo.getByUserId(ALICE.id)).toMatchObject({ subscriptionStatus: "active", plan: "growth", stripeSubscriptionId: "sub_test1" });
  });

  it("processes a duplicate delivery only once", async () => {
    const { repo, stripe, deps } = await subscribed();
    stripe.subscriptions.set("cus_test1", [sub()]);
    const event = evt("customer.subscription.updated", { id: "sub_test1", customer: "cus_test1" });
    expect(await handleWebhookEvent(event, deps)).toBe("synced");
    stripe.subscriptions.set("cus_test1", [sub({ status: "canceled" })]);
    expect(await handleWebhookEvent(event, deps)).toBe("duplicate");
    // The replay changed nothing.
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("active");
  });

  it("ends in the correct state when events arrive out of order", async () => {
    const { repo, stripe, deps } = await subscribed();
    const created = evt("customer.subscription.created", { id: "sub_test1", customer: "cus_test1", status: "active" });
    const deleted = evt("customer.subscription.deleted", { id: "sub_test1", customer: "cus_test1", status: "canceled" });
    // Stripe's current truth: the subscription is cancelled.
    stripe.subscriptions.set("cus_test1", [sub({ status: "canceled" })]);
    await handleWebhookEvent(deleted, deps);
    await handleWebhookEvent(created, deps); // the older event arrives last
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("canceled");
  });

  it("retries an event whose first attempt failed", async () => {
    const { repo, stripe, deps } = await subscribed();
    stripe.subscriptions.set("cus_test1", [sub()]);
    const event = evt("invoice.paid", { id: "in_1", customer: "cus_test1" });
    const original = stripe.listSubscriptions.bind(stripe);
    stripe.listSubscriptions = async () => { throw new Error("stripe timeout"); };
    await expect(handleWebhookEvent(event, deps)).rejects.toThrow("stripe timeout");
    expect(repo.events.get(event.id)).toMatchObject({ processed: false, error: "stripe timeout" });
    stripe.listSubscriptions = original;
    expect(await handleWebhookEvent(event, deps)).toBe("synced");
    expect(repo.events.get(event.id)).toMatchObject({ processed: true, attempts: 2 });
  });

  it("never assigns a subscription by email address", async () => {
    const { repo, stripe, deps } = await subscribed();
    // A different Stripe customer that happens to carry Alice's email.
    stripe.customers.set("cus_lookalike", { userId: null });
    stripe.subscriptions.set("cus_lookalike", [sub({ id: "sub_other" })]);
    const outcome = await handleWebhookEvent(evt("customer.subscription.created", { id: "sub_other", customer: "cus_lookalike", customer_email: ALICE.email }), deps);
    expect(outcome).toBe("unmapped");
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("none");
    expect(repo.rows.size).toBe(1);
  });

  it("links an unmapped checkout only when the session and the Stripe customer agree on the user", async () => {
    const { repo, stripe, deps } = makeDeps();
    stripe.customers.set("cus_new", { userId: BOB.id });
    stripe.subscriptions.set("cus_new", [sub()]);
    // Session claims Alice, but the customer was created for Bob: refuse.
    expect(await handleWebhookEvent(evt("checkout.session.completed", { id: "cs_1", customer: "cus_new", client_reference_id: ALICE.id }), deps)).toBe("unmapped");
    expect(repo.rows.size).toBe(0);
    // Not a user id at all: refuse.
    expect(await handleWebhookEvent(evt("checkout.session.completed", { id: "cs_2", customer: "cus_new", client_reference_id: "bob@example.com" }), deps)).toBe("unmapped");
    // Both agree: link and sync.
    expect(await handleWebhookEvent(evt("checkout.session.completed", { id: "cs_3", customer: "cus_new", client_reference_id: BOB.id }), deps)).toBe("synced");
    expect(await repo.getByUserId(BOB.id)).toMatchObject({ stripeCustomerId: "cus_new", subscriptionStatus: "active" });
  });

  it("keeps the record but clears the subscription when a Stripe customer is deleted", async () => {
    const { repo, stripe, deps } = await subscribed();
    stripe.subscriptions.set("cus_test1", [sub()]);
    await handleWebhookEvent(evt("customer.subscription.created", { customer: "cus_test1" }), deps);
    expect(await handleWebhookEvent(evt("customer.deleted", { id: "cus_test1" }), deps)).toBe("cleared");
    expect(await repo.getByUserId(ALICE.id)).toMatchObject({ stripeCustomerId: "cus_test1", subscriptionStatus: "none", plan: null });
  });

  it("ignores unrelated event types and live-mode events before approval", async () => {
    const { repo, stripe, deps } = await subscribed();
    stripe.subscriptions.set("cus_test1", [sub()]);
    expect(await handleWebhookEvent(evt("charge.refunded", { customer: "cus_test1" }), deps)).toBe("ignored");
    expect(await handleWebhookEvent(evt("customer.subscription.created", { customer: "cus_test1" }, { livemode: true }), deps)).toBe("ignored_live");
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("none");
    expect(repo.events.size).toBe(0);
  });

  it("handles a payment failure by reflecting Stripe's status", async () => {
    const { repo, stripe, deps } = await subscribed();
    stripe.subscriptions.set("cus_test1", [sub({ status: "past_due" })]);
    await handleWebhookEvent(evt("invoice.payment_failed", { id: "in_2", customer: { id: "cus_test1" } }), deps);
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("past_due");
  });
});
