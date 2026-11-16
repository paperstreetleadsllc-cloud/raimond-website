import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BillingPanel } from "@/components/BillingPanel";
import { getVerifiedUser } from "@/lib/auth";
import { billingDeps } from "@/lib/billing/context";
import { PLAN_KEYS, priceAllowlist } from "@/lib/billing/plans";
import { syncCustomer } from "@/lib/billing/service";
import { PLANS } from "@/lib/plans";
import { listSavedAudits, type SavedAuditSummary } from "@/lib/service";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  none: "No subscription",
  active: "Active",
  trialing: "Trial",
  past_due: "Payment past due",
  unpaid: "Unpaid",
  paused: "Paused",
  canceled: "Canceled",
  incomplete: "Payment incomplete",
  incomplete_expired: "Checkout expired",
};

async function readOwnBilling() {
  // Read through the visitor's own session, so row-level security decides what is visible.
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id, subscription_status, plan, current_period_end, cancel_at_period_end")
    .maybeSingle();
  return data as { stripe_customer_id: string; subscription_status: string; plan: string | null; current_period_end: string | null; cancel_at_period_end: boolean } | null;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ checkout?: string; password?: string }> }) {
  // Verified here as well as in the proxy: the proxy alone is never the gate.
  const user = await getVerifiedUser().catch(() => null);
  if (!user) redirect("/login?next=/dashboard");
  const params = await searchParams;

  let billing = await readOwnBilling();
  if (params.checkout === "success" && billing) {
    // Show the new subscription immediately instead of waiting for the webhook.
    try {
      await syncCustomer(billing.stripe_customer_id, billingDeps());
      billing = await readOwnBilling();
    } catch (err) {
      console.error(JSON.stringify({ event: "dashboard_sync_error", detail: String(err) }));
    }
  }

  let saved: SavedAuditSummary[] = [];
  try {
    saved = await listSavedAudits(user.id);
  } catch (err) {
    console.error(JSON.stringify({ event: "dashboard_audits_error", detail: String(err) }));
  }

  const status = billing?.subscription_status ?? "none";
  const allow = priceAllowlist();
  const plans = PLAN_KEYS.map((key) => {
    const plan = PLANS.find((p) => p.key === key)!;
    return { key, name: plan.name, price: plan.price, available: Boolean(allow[key]) };
  });
  const planName = PLANS.find((p) => p.key === billing?.plan)?.name;
  const canSubscribe = ["none", "canceled", "incomplete_expired"].includes(status);

  return (
    <div className="bg-slate-50">
      <div className="container-page space-y-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-slate-600">Signed in as {user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-secondary">Log out</button>
          </form>
        </div>

        {params.checkout === "success" ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Thanks. Your subscription details are below. If the status still shows as pending, refresh in a moment.</p> : null}
        {params.checkout === "cancelled" ? <p role="status" className="rounded-xl bg-slate-100 p-4">Checkout was cancelled. You have not been charged.</p> : null}
        {params.password === "updated" ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Your password has been updated.</p> : null}

        <section className="card p-6 sm:p-8" aria-labelledby="billing">
          <h2 id="billing" className="text-2xl font-semibold">Subscription</h2>
          <dl className="mt-4 grid gap-4 text-[15px] sm:grid-cols-3">
            <div><dt className="text-slate-500">Status</dt><dd className="font-medium text-ink">{STATUS_LABEL[status] ?? status}</dd></div>
            <div><dt className="text-slate-500">Plan</dt><dd className="font-medium text-ink">{planName ?? "None"}</dd></div>
            <div>
              <dt className="text-slate-500">{billing?.cancel_at_period_end ? "Ends on" : "Renews on"}</dt>
              <dd className="font-medium text-ink">{billing?.current_period_end && !canSubscribe ? new Date(billing.current_period_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not applicable"}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <BillingPanel plans={plans} hasCustomer={Boolean(billing)} canSubscribe={canSubscribe} emailVerified={Boolean(user.email_confirmed_at)} />
          </div>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Your audits</h2>
          {saved.length === 0 ? (
            <p className="mt-2 text-slate-600">Audits you run while signed in are saved here.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead className="text-slate-500">
                  <tr><th className="py-2 pr-4 font-medium">Website</th><th className="py-2 pr-4 font-medium">Readiness score</th><th className="py-2 pr-4 font-medium">Date</th><th className="py-2 font-medium"><span className="sr-only">Open</span></th></tr>
                </thead>
                <tbody>
                  {saved.map((a) => (
                    <tr key={a.id} className="border-t border-slate-200">
                      <td className="py-3 pr-4"><span className="font-medium text-ink">{a.businessName ?? a.site}</span>{a.businessName ? <span className="block text-sm text-slate-500">{a.site}</span> : null}</td>
                      <td className="py-3 pr-4">{a.score !== null ? `${a.score} / 100` : a.status === "failed" ? "Could not be audited" : "In progress"}</td>
                      <td className="py-3 pr-4">{new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                      <td className="py-3"><a className="underline" href={`/audit/${a.id}`}>View report</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <a href="/audit" className="btn-primary mt-4">Run a free audit</a>
        </section>
      </div>
    </div>
  );
}
