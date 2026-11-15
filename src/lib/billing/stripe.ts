import "server-only";
import Stripe from "stripe";

export class BillingNotConfiguredError extends Error {
  constructor(message = "Billing is not configured.") {
    super(message);
    this.name = "BillingNotConfiguredError";
  }
}

/**
 * Live keys are refused unless live billing has been explicitly approved by
 * setting BILLING_LIVE_MODE_APPROVED=true. Test keys work without it.
 */
export function liveModeApproved(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.BILLING_LIVE_MODE_APPROVED === "true";
}

export function assertKeyAllowed(key: string | undefined, env: NodeJS.ProcessEnv = process.env): string {
  if (!key) throw new BillingNotConfiguredError();
  const isLive = key.startsWith("sk_live_") || key.startsWith("rk_live_");
  if (isLive && !liveModeApproved(env)) {
    throw new BillingNotConfiguredError("A live Stripe key is set but live billing has not been approved.");
  }
  return key;
}

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  client = new Stripe(assertKeyAllowed(process.env.STRIPE_SECRET_KEY));
  return client;
}
