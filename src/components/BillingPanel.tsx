"use client";

import { useState } from "react";

interface Props {
  plans: { key: string; name: string; price: string; available: boolean }[];
  hasCustomer: boolean;
  canSubscribe: boolean;
  emailVerified: boolean;
}

export function BillingPanel({ plans, hasCustomer, canSubscribe, emailVerified }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(path: string, body: object, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.assign("/login?next=/dashboard");
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div>
      {canSubscribe ? (
        <>
          {!emailVerified ? <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Confirm your email address before subscribing.</p> : null}
          <ul className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <li key={plan.key} className="rounded-2xl border border-slate-200 p-5">
                <p className="font-display text-lg font-semibold text-ink">{plan.name}</p>
                <p className="mt-1 text-slate-600">{plan.price} per month</p>
                <button
                  type="button"
                  className="btn-primary mt-4 w-full"
                  disabled={!plan.available || !emailVerified || busy !== null}
                  onClick={() => go("/api/billing/checkout", { plan: plan.key }, plan.key)}
                >
                  {!plan.available ? "Opening soon" : busy === plan.key ? "Opening checkout…" : "Subscribe"}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {hasCustomer ? (
        <button type="button" className="btn-secondary mt-5" disabled={busy !== null} onClick={() => go("/api/billing/portal", {}, "portal")}>
          {busy === "portal" ? "Opening…" : "Manage billing"}
        </button>
      ) : null}
      {error ? <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
