import { describe, expect, it } from "vitest";
import { assertKeyAllowed, BillingNotConfiguredError } from "@/lib/billing/stripe";
import { isPlanKey, planForPrice, priceAllowlist } from "@/lib/billing/plans";
import { ensureCustomer, isEntitled, openPortal, pickSubscription, startCheckout, syncCustomer, toState } from "@/lib/billing/service";
import { ALICE, BOB, makeDeps, sub, TEST_ENV } from "./billing-fakes";

describe("authenticated checkout", () => {
  it("creates one Stripe customer for the user, stores the mapping, and opens checkout for that customer", async () => {
    const { repo, stripe, deps } = makeDeps();
    const { url } = await startCheckout(ALICE, "growth", deps);
    expect(url).toContain("checkout.stripe.com");
    const record = await repo.getByUserId(ALICE.id);
    expect(record?.stripeCustomerId).toBe("cus_test1");
    expect(stripe.last("createCheckoutSession")).toMatchObject({
      customerId: "cus_test1",
      userId: ALICE.id,
      priceId: "price_growth123",
      successUrl: "https://raimondai.com/dashboard?checkout=success",
      cancelUrl: "https://raimondai.com/dashboard?checkout=cancelled",
    });
  });

  it("reuses the stored customer on later checkouts", async () => {
    const { stripe, deps } = makeDeps();
    await startCheckout(ALICE, "monitor", deps);
    await startCheckout(ALICE, "growth", deps);
    expect(stripe.calls.filter((c) => c.method === "createCustomer").length).toBe(1);
  });

  it("creates only one customer when two first checkouts race", async () => {
    const { repo, stripe, deps } = makeDeps();
    const [a, b] = await Promise.all([ensureCustomer(ALICE, deps), ensureCustomer(ALICE, deps)]);
    expect(a.stripeCustomerId).toBe(b.stripeCustomerId);
    expect(stripe.customers.size).toBe(1);
    expect(repo.rows.size).toBe(1);
  });

  it("gives each user their own customer", async () => {
    const { repo, deps } = makeDeps();
    await startCheckout(ALICE, "growth", deps);
    await startCheckout(BOB, "growth", deps);
    expect((await repo.getByUserId(ALICE.id))?.stripeCustomerId).not.toBe((await repo.getByUserId(BOB.id))?.stripeCustomerId);
  });

  it.each([["price_attacker999"], ["professional"], [""], [null], [{ plan: "growth" }], ["__proto__"]])("rejects a plan or price the server does not recognise: %j", async (input) => {
    const { stripe, deps } = makeDeps();
    await expect(startCheckout(ALICE, input, deps)).rejects.toMatchObject({ code: "UNKNOWN_PLAN", status: 400 });
    expect(stripe.calls.length).toBe(0);
  });

  it("refuses a plan whose price is not configured", async () => {
    const { deps } = makeDeps({ env: { STRIPE_PRICE_GROWTH: "price_growth123" } as unknown as NodeJS.ProcessEnv });
    await expect(startCheckout(ALICE, "authority", deps)).rejects.toMatchObject({ code: "PLAN_UNAVAILABLE" });
  });

  it("requires a verified email address", async () => {
    const { stripe, deps } = makeDeps();
    await expect(startCheckout({ ...ALICE, emailVerified: false }, "growth", deps)).rejects.toMatchObject({ code: "EMAIL_NOT_VERIFIED", status: 403 });
    expect(stripe.calls.length).toBe(0);
  });

  it("does not start a second subscription, even if a webhook was missed", async () => {
    const { repo, stripe, deps } = makeDeps();
    await startCheckout(ALICE, "growth", deps);
    // Stripe has an active subscription, but our database has not heard about it yet.
    stripe.subscriptions.set("cus_test1", [sub()]);
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("none");
    await expect(startCheckout(ALICE, "authority", deps)).rejects.toMatchObject({ code: "ALREADY_SUBSCRIBED", status: 409 });
    expect((await repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("active");
  });

  it("allows a new checkout after cancellation", async () => {
    const { stripe, deps } = makeDeps();
    await startCheckout(ALICE, "growth", deps);
    stripe.subscriptions.set("cus_test1", [sub({ status: "canceled" })]);
    await expect(startCheckout(ALICE, "monitor", deps)).resolves.toHaveProperty("url");
  });
});

describe("billing portal", () => {
  it("opens the portal only for the signed-in user's own customer", async () => {
    const { stripe, deps } = makeDeps();
    await startCheckout(ALICE, "growth", deps);
    await startCheckout(BOB, "growth", deps);
    const { url } = await openPortal(BOB, deps);
    expect(stripe.last("createPortalSession")).toEqual({ customerId: "cus_test2", returnUrl: "https://raimondai.com/dashboard" });
    expect(url).toContain("cus_test2");
    expect(url).not.toContain("cus_test1");
  });

  it("has no parameter through which another customer could be requested", () => {
    // openPortal(user, deps): the customer is always looked up from the verified user id.
    expect(openPortal.length).toBe(2);
  });

  it("returns 404 for a user with no billing account", async () => {
    const { stripe, deps } = makeDeps();
    await expect(openPortal(ALICE, deps)).rejects.toMatchObject({ code: "NO_BILLING_ACCOUNT", status: 404 });
    expect(stripe.calls.length).toBe(0);
  });
});

describe("subscription state", () => {
  it("prefers a live subscription over an older cancelled one", () => {
    const chosen = pickSubscription([sub({ id: "sub_old", status: "canceled", created: 5 }), sub({ id: "sub_new", status: "active", created: 3 })]);
    expect(chosen?.id).toBe("sub_new");
    expect(pickSubscription([])).toBeNull();
  });

  it("maps a known price to its plan and grants nothing for an unknown price", () => {
    expect(toState(sub(), TEST_ENV)).toMatchObject({ subscriptionStatus: "active", plan: "growth", currentPeriodEnd: new Date(1_802_592_000_000).toISOString() });
    expect(toState(sub({ priceId: "price_someoneelse" }), TEST_ENV).plan).toBeNull();
    expect(toState(null)).toMatchObject({ subscriptionStatus: "none", stripeSubscriptionId: null, plan: null });
    expect(toState(sub({ status: "weird_new_status" }), TEST_ENV).subscriptionStatus).toBe("none");
  });

  it("records cancellation", async () => {
    const { repo, stripe, deps } = makeDeps();
    await startCheckout(ALICE, "growth", deps);
    stripe.subscriptions.set("cus_test1", [sub()]);
    await syncCustomer("cus_test1", deps);
    expect(isEntitled((await repo.getByUserId(ALICE.id))!.subscriptionStatus)).toBe(true);
    stripe.subscriptions.set("cus_test1", [sub({ status: "canceled" })]);
    await syncCustomer("cus_test1", deps);
    const record = await repo.getByUserId(ALICE.id);
    expect(record?.subscriptionStatus).toBe("canceled");
    expect(isEntitled(record!.subscriptionStatus)).toBe(false);
    expect(record?.stripeCustomerId).toBe("cus_test1"); // the mapping itself is kept
  });

  it("ignores customers that are not mapped to a user", async () => {
    const { repo, deps } = makeDeps();
    expect(await syncCustomer("cus_stranger", deps)).toBe("unmapped");
    expect(repo.rows.size).toBe(0);
  });
});

describe("configuration guards", () => {
  it("reads prices only from server configuration", () => {
    expect(priceAllowlist(TEST_ENV)).toEqual({ monitor: "price_monitor123", growth: "price_growth123", authority: "price_authority123" });
    expect(priceAllowlist({ STRIPE_PRICE_GROWTH: "not-a-price" } as unknown as NodeJS.ProcessEnv)).toEqual({});
    expect(planForPrice("price_growth123", TEST_ENV)).toBe("growth");
    expect(isPlanKey("growth")).toBe(true);
    expect(isPlanKey("constructor")).toBe(false);
  });

  it("refuses live Stripe keys until live billing is approved", () => {
    expect(() => assertKeyAllowed(undefined)).toThrow(BillingNotConfiguredError);
    expect(() => assertKeyAllowed("sk_live_abc", {} as NodeJS.ProcessEnv)).toThrow(/not been approved/);
    expect(assertKeyAllowed("sk_test_abc", {} as NodeJS.ProcessEnv)).toBe("sk_test_abc");
    expect(assertKeyAllowed("sk_live_abc", { BILLING_LIVE_MODE_APPROVED: "true" } as unknown as NodeJS.ProcessEnv)).toBe("sk_live_abc");
  });
});
