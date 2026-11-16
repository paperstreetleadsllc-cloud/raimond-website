/**
 * Review-first migration of the old email-keyed billing records
 * (legacy/aeo-prototype/aeo-api/data/billing-customers.json).
 *
 * Email is used only to PROPOSE a link. Nothing is written until a person has
 * marked a proposal approved, and proposals that fail any check cannot be approved.
 */
export interface LegacyBillingRecord {
  email: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  plan?: string;
}

export interface KnownUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
}

export type ProposalStatus = "ready" | "no_customer_id" | "no_user" | "unverified_email" | "stripe_customer_missing" | "stripe_email_mismatch" | "user_already_linked" | "customer_already_linked" | "ambiguous_user";

export interface LinkProposal {
  email: string;
  stripeCustomerId: string | null;
  userId: string | null;
  status: ProposalStatus;
  legacyStatus: string | null;
  /** Set to true by a human reviewer. Only "ready" proposals are ever applied. */
  approved: boolean;
}

const norm = (e: string | null | undefined) => (e ?? "").trim().toLowerCase();

export function proposeLegacyLinks(
  legacy: LegacyBillingRecord[],
  users: KnownUser[],
  stripeCustomerEmails: Map<string, string | null>,
  existing: { userIds: Set<string>; customerIds: Set<string> },
): LinkProposal[] {
  return legacy.map((record) => {
    const email = norm(record.email);
    const base = { email, stripeCustomerId: record.customerId ?? null, userId: null as string | null, legacyStatus: record.status ?? null, approved: false };
    if (!record.customerId) return { ...base, status: "no_customer_id" as const };
    if (existing.customerIds.has(record.customerId)) return { ...base, status: "customer_already_linked" as const };

    const matches = users.filter((u) => norm(u.email) === email);
    if (matches.length === 0) return { ...base, status: "no_user" as const };
    if (matches.length > 1) return { ...base, status: "ambiguous_user" as const };
    const user = matches[0];
    const withUser = { ...base, userId: user.id };
    if (!user.emailVerified) return { ...withUser, status: "unverified_email" as const };
    if (existing.userIds.has(user.id)) return { ...withUser, status: "user_already_linked" as const };
    if (!stripeCustomerEmails.has(record.customerId)) return { ...withUser, status: "stripe_customer_missing" as const };
    if (norm(stripeCustomerEmails.get(record.customerId)) !== email) return { ...withUser, status: "stripe_email_mismatch" as const };
    return { ...withUser, status: "ready" as const };
  });
}

/** Proposals a reviewer approved AND that passed every check. */
export function approvedLinks(proposals: LinkProposal[]): { userId: string; stripeCustomerId: string }[] {
  return proposals
    .filter((p) => p.approved === true && p.status === "ready" && p.userId && p.stripeCustomerId)
    .map((p) => ({ userId: p.userId as string, stripeCustomerId: p.stripeCustomerId as string }));
}
