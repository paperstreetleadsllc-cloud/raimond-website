import { useState } from "react";
import { ApiError, aeoApi, type BillingPlan } from "../lib/aeoApi";

type PlanCard = {
  id: BillingPlan;
  name: string;
  price: string;
  description: string;
  highlights: string[];
};

const plans: PlanCard[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$49/mo",
    description: "Single-site monitoring and weekly audits.",
    highlights: ["1 site", "Weekly audits", "Actionable recommendations"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$149/mo",
    description: "Expanded data and faster optimization loops.",
    highlights: ["5 sites", "More frequent runs", "Priority scoring"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$399/mo",
    description: "Portfolio-level controls for teams.",
    highlights: ["20 sites", "Team workflows", "Portfolio reporting"],
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingUnavailable, setBillingUnavailable] = useState(false);

  const subscribe = async (plan: BillingPlan) => {
    setError(null);
    setBillingUnavailable(false);
    setLoadingPlan(plan);
    try {
      const session = await aeoApi.createCheckoutSession({ email, plan });
      if (!session.checkoutUrl) {
        throw new Error("Checkout URL missing from response.");
      }
      window.location.assign(session.checkoutUrl);
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        (requestError.statusCode === 404 ||
          requestError.statusCode === 405 ||
          requestError.statusCode === 503)
      ) {
        setBillingUnavailable(true);
      }
      setError(
        requestError instanceof Error ? requestError.message : "Failed to start checkout session.",
      );
      setLoadingPlan(null);
    }
  };

  const openPortal = async () => {
    setError(null);
    setBillingUnavailable(false);
    setOpeningPortal(true);
    try {
      const portal = await aeoApi.createCustomerPortal(email);
      window.location.assign(portal.portalUrl);
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        (requestError.statusCode === 404 ||
          requestError.statusCode === 405 ||
          requestError.statusCode === 503)
      ) {
        setBillingUnavailable(true);
      }
      setError(requestError instanceof Error ? requestError.message : "Failed to open portal.");
      setOpeningPortal(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Pricing</h1>
        <p className="text-sm text-slate-400">
          Start checkout using billing endpoints when configured, otherwise use scaffold mode.
        </p>
      </div>

      <div className="panel rounded-2xl p-5">
        <label className="block text-xs uppercase tracking-[0.12em] text-slate-400">
          Billing Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full max-w-lg rounded-md border border-cyan-300/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
          />
        </label>
        <div className="mt-3">
          <button
            type="button"
            disabled={!email || openingPortal}
            onClick={() => void openPortal()}
            className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300/35 disabled:opacity-60"
          >
            {openingPortal ? "Opening Portal..." : "Manage Subscription"}
          </button>
        </div>
      </div>

      {billingUnavailable ? (
        <div className="rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100">
          Billing endpoints are not available in this environment yet. TODO: enable Stripe env vars on
          API and retry.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="panel flex flex-col rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">{plan.name}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-100">{plan.price}</p>
            <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-200">
              {plan.highlights.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <button
              type="button"
              disabled={!email || loadingPlan !== null}
              onClick={() => void subscribe(plan.id)}
              className="mt-5 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60"
            >
              {loadingPlan === plan.id ? "Redirecting..." : `Subscribe to ${plan.name}`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
