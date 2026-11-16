import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "../supabase/admin";
import { siteUrl } from "../supabase/env";
import { stripeGateway } from "./gateway";
import { SupabaseBillingRepo } from "./repo";
import type { BillingDeps, VerifiedUser } from "./service";
import { getStripe, liveModeApproved } from "./stripe";

export function billingDeps(): BillingDeps {
  return {
    repo: new SupabaseBillingRepo(createAdminClient()),
    stripe: stripeGateway(getStripe()),
    siteUrl: siteUrl(),
    liveApproved: liveModeApproved(),
  };
}

export function toVerifiedUser(user: User): VerifiedUser {
  return { id: user.id, email: user.email ?? null, emailVerified: Boolean(user.email_confirmed_at) };
}
