import { describe, expect, it } from "vitest";
import { approvedLinks, proposeLegacyLinks, type KnownUser } from "@/lib/billing/legacy";

const users: KnownUser[] = [
  { id: "u-alice", email: "Alice@Example.com", emailVerified: true },
  { id: "u-bob", email: "bob@example.com", emailVerified: false },
  { id: "u-carol", email: "carol@example.com", emailVerified: true },
  { id: "u-dave", email: "dave@example.com", emailVerified: true },
  { id: "u-erin", email: "erin@example.com", emailVerified: true },
];
const stripeEmails = new Map<string, string | null>([["cus_alice", "alice@example.com"], ["cus_bob", "bob@example.com"], ["cus_carol", "someone-else@example.com"], ["cus_dave", "dave@example.com"], ["cus_taken", "erin@example.com"]]);
const none = { userIds: new Set<string>(), customerIds: new Set<string>() };

describe("existing customer migration", () => {
  const legacy = [
    { email: "alice@example.com", customerId: "cus_alice", status: "active" },
    { email: "bob@example.com", customerId: "cus_bob" },
    { email: "carol@example.com", customerId: "cus_carol" },
    { email: "nobody@example.com", customerId: "cus_nobody" },
    { email: "pending@example.com" },
    { email: "dave@example.com", customerId: "cus_gone" },
  ];

  it("proposes a link only when every check passes", () => {
    const byEmail = Object.fromEntries(proposeLegacyLinks(legacy, users, stripeEmails, none).map((p) => [p.email, p.status]));
    expect(byEmail).toEqual({
      "alice@example.com": "ready",
      "bob@example.com": "unverified_email",
      "carol@example.com": "stripe_email_mismatch",
      "nobody@example.com": "no_user",
      "pending@example.com": "no_customer_id",
      "dave@example.com": "stripe_customer_missing",
    });
  });

  it("applies nothing until a reviewer approves, and never applies a failed check", () => {
    const proposals = proposeLegacyLinks(legacy, users, stripeEmails, none);
    expect(approvedLinks(proposals)).toEqual([]);
    for (const p of proposals) p.approved = true; // reviewer approves everything, including bad rows
    expect(approvedLinks(proposals)).toEqual([{ userId: "u-alice", stripeCustomerId: "cus_alice" }]);
  });

  it("does not relink users or customers that are already mapped", () => {
    const proposals = proposeLegacyLinks(
      [{ email: "alice@example.com", customerId: "cus_alice" }, { email: "erin@example.com", customerId: "cus_taken" }],
      users,
      stripeEmails,
      { userIds: new Set(["u-alice"]), customerIds: new Set(["cus_taken"]) },
    );
    expect(proposals.map((p) => p.status)).toEqual(["user_already_linked", "customer_already_linked"]);
  });

  it("refuses to guess when two accounts share an email", () => {
    const dup = [...users, { id: "u-alice2", email: "alice@example.com", emailVerified: true }];
    expect(proposeLegacyLinks([{ email: "alice@example.com", customerId: "cus_alice" }], dup, stripeEmails, none)[0].status).toBe("ambiguous_user");
  });
});
