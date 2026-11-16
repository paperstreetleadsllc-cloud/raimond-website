import Stripe from "stripe";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ALICE, makeDeps, sub } from "./billing-fakes";

const session = vi.hoisted(() => ({ result: { data: { user: null as unknown }, error: null as unknown } }));
const ctx = vi.hoisted(() => ({ deps: null as unknown }));

vi.mock("@/lib/supabase/server", () => ({
  createSessionClient: async () => ({ auth: { getUser: async () => session.result } }),
}));
vi.mock("@/lib/billing/context", async () => ({
  billingDeps: () => ctx.deps,
  toVerifiedUser: (u: { id: string; email: string; email_confirmed_at?: string }) => ({ id: u.id, email: u.email, emailVerified: Boolean(u.email_confirmed_at) }),
}));

import { getVerifiedUser, requireUser } from "@/lib/auth";
import { POST as checkout } from "@/app/api/billing/checkout/route";
import { POST as portal } from "@/app/api/billing/portal/route";
import { POST as webhook } from "@/app/api/billing/webhook/route";

const signedIn = (id = ALICE.id) => {
  session.result = { data: { user: { id, email: "alice@example.com", email_confirmed_at: "2026-11-01T00:00:00Z" } }, error: null };
};
const signedOut = (error: unknown = null) => {
  session.result = { data: { user: null }, error };
};
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(`https://raimondai.com${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { host: "raimondai.com", "content-type": "application/json", ...headers } });

let fake: ReturnType<typeof makeDeps>;
beforeEach(() => {
  fake = makeDeps();
  ctx.deps = fake.deps;
  signedOut();
  vi.unstubAllEnvs();
});

describe("session verification", () => {
  it("treats a missing session as signed out", async () => {
    expect(await getVerifiedUser()).toBeNull();
    await expect(requireUser()).rejects.toThrow("Authentication required");
  });

  it("treats an expired or invalid token as signed out", async () => {
    signedOut({ name: "AuthApiError", status: 401, message: "JWT expired" });
    expect(await getVerifiedUser()).toBeNull();
  });
});

describe("billing endpoints require a verified session", () => {
  it("rejects unauthenticated checkout and portal requests with 401 and does nothing", async () => {
    for (const res of [await checkout(post("/api/billing/checkout", { plan: "growth" })), await portal(post("/api/billing/portal", {}))]) {
      expect(res.status).toBe(401);
    }
    expect(fake.stripe.calls.length).toBe(0);
    expect(fake.repo.rows.size).toBe(0);
  });

  it("rejects requests whose session has expired", async () => {
    signedOut({ status: 401, message: "JWT expired" });
    expect((await checkout(post("/api/billing/checkout", { plan: "growth" }))).status).toBe(401);
  });

  it("rejects cross-site requests", async () => {
    signedIn();
    const res = await checkout(post("/api/billing/checkout", { plan: "growth" }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(fake.stripe.calls.length).toBe(0);
  });

  it("ignores user ids, customer ids, prices and URLs supplied by the browser", async () => {
    await fake.deps.repo.linkCustomer("22222222-2222-4222-8222-222222222222", "cus_victim", false);
    signedIn();
    const res = await checkout(post("/api/billing/checkout", {
      plan: "growth",
      userId: "22222222-2222-4222-8222-222222222222",
      customerId: "cus_victim",
      priceId: "price_free",
      successUrl: "https://evil.example/thanks",
    }));
    expect(res.status).toBe(200);
    const sent = fake.stripe.last("createCheckoutSession");
    expect(sent.userId).toBe(ALICE.id);
    expect(sent.customerId).not.toBe("cus_victim");
    expect(sent.priceId).toBe("price_growth123");
    expect(sent.successUrl).toBe("https://raimondai.com/dashboard?checkout=success");
  });

  it("cannot be pointed at another customer's billing portal", async () => {
    await fake.deps.repo.linkCustomer("22222222-2222-4222-8222-222222222222", "cus_victim", false);
    signedIn();
    const res = await portal(post("/api/billing/portal", { customerId: "cus_victim", userId: "22222222-2222-4222-8222-222222222222" }));
    expect(res.status).toBe(404); // Alice has no billing account; the victim's is never used
    expect(fake.stripe.calls.length).toBe(0);
  });

  it("opens the portal for the signed-in user's own customer", async () => {
    signedIn();
    await checkout(post("/api/billing/checkout", { plan: "growth" }));
    const res = await portal(post("/api/billing/portal", {}));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toContain("cus_test1");
  });
});

describe("webhook endpoint", () => {
  const secret = "whsec_route_test";
  const stripe = new Stripe("sk_test_dummy");
  const body = (id: string) => JSON.stringify({ id, object: "event", type: "customer.subscription.updated", livemode: false, created: 1_800_000_000, data: { object: { id: "sub_test1", customer: "cus_test1" } } });

  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
  });

  it("refuses unsigned and wrongly signed requests without touching the database", async () => {
    expect((await webhook(post("/api/billing/webhook", body("evt_a")))).status).toBe(400);
    const bad = await stripe.webhooks.generateTestHeaderStringAsync({ payload: body("evt_a"), secret: "whsec_wrong" });
    expect((await webhook(post("/api/billing/webhook", body("evt_a"), { "stripe-signature": bad }))).status).toBe(400);
    expect(fake.repo.events.size).toBe(0);
  });

  it("reports itself unavailable when no webhook secret is configured", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    expect((await webhook(post("/api/billing/webhook", body("evt_a"), { "stripe-signature": "t=1,v1=x" }))).status).toBe(503);
  });

  it("processes a correctly signed event once, and acknowledges the duplicate", async () => {
    await fake.deps.repo.linkCustomer(ALICE.id, "cus_test1", false);
    fake.stripe.subscriptions.set("cus_test1", [sub()]);
    const payload = body("evt_b");
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret });
    const first = await webhook(post("/api/billing/webhook", payload, { "stripe-signature": header }));
    expect(first.status).toBe(200);
    expect((await first.json()).outcome).toBe("synced");
    const second = await webhook(post("/api/billing/webhook", payload, { "stripe-signature": header }));
    expect(second.status).toBe(200);
    expect((await second.json()).outcome).toBe("duplicate");
    expect((await fake.deps.repo.getByUserId(ALICE.id))?.subscriptionStatus).toBe("active");
  });

  it("returns 500 so Stripe retries when processing fails", async () => {
    await fake.deps.repo.linkCustomer(ALICE.id, "cus_test1", false);
    fake.stripe.listSubscriptions = async () => { throw new Error("boom"); };
    const payload = body("evt_c");
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret });
    const res = await webhook(post("/api/billing/webhook", payload, { "stripe-signature": header }));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("boom");
  });
});
