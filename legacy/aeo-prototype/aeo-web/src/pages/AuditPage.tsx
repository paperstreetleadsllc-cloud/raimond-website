import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  aeoApi,
  isSubscriptionRequiredError,
  type AeoAudit,
  type AeoSite,
} from "../lib/aeoApi";

export default function AuditPage() {
  const { id = "" } = useParams();
  const [site, setSite] = useState<AeoSite | null>(null);
  const [audit, setAudit] = useState<AeoAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sites = await aeoApi.listSites();
        const selected = sites.find((item) => item.id === id) ?? null;
        setSite(selected);
        if (!selected) {
          setAudit(null);
          setError("Site not found.");
          return;
        }
        const latestAudit = await aeoApi.getLatestAudit(selected.id);
        setAudit(latestAudit);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load audit.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const runAudit = async () => {
    if (!site) {
      return;
    }
    setRunningAudit(true);
    setError(null);
    setSubscriptionRequired(false);
    try {
      const nextAudit = await aeoApi.runAudit(site.id);
      setAudit(nextAudit);
    } catch (requestError) {
      if (isSubscriptionRequiredError(requestError)) {
        setSubscriptionRequired(true);
      }
      setError(requestError instanceof Error ? requestError.message : "Failed to run audit.");
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Site Audit</h1>
          <p className="text-sm text-slate-400">Run audit and inspect findings from the AEO API.</p>
        </div>
        {site ? (
          <Link
            to={`/sites/${site.id}/plan`}
            className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300/35"
          >
            Open Plan
          </Link>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {subscriptionRequired ? (
        <div className="rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100">
          Subscription required to run audits. Visit <Link to="/pricing">pricing</Link>.
        </div>
      ) : null}

      {site ? (
        <div className="panel rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-100">{site.businessName || site.url}</p>
              <p className="text-xs text-slate-400">{site.url}</p>
            </div>
            <button
              type="button"
              onClick={() => void runAudit()}
              disabled={runningAudit}
              className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60"
            >
              {runningAudit ? "Running Audit..." : "Run Audit"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Score</p>
          {loading ? (
            <div className="mt-3 h-10 animate-pulse rounded-md bg-slate-800/70" />
          ) : (
            <p className="mt-2 text-3xl font-semibold text-cyan-100">{audit?.totalScore ?? "--"}</p>
          )}
        </div>
        <div className="panel rounded-xl p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Competitor Gap</p>
          {loading ? (
            <div className="mt-3 h-10 animate-pulse rounded-md bg-slate-800/70" />
          ) : (
            <p className="mt-2 text-sm text-slate-200">
              {audit?.competitorGap || "Run an audit to calculate competitor gap analysis."}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Top Winning Queries</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {(audit?.topWinningQueries ?? []).slice(0, 12).map((query) => (
              <li key={query}>- {query}</li>
            ))}
            {audit?.topWinningQueries?.length ? null : (
              <li className="text-slate-400">No query data yet.</li>
            )}
          </ul>
        </div>
        <div className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Weak Areas</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {(audit?.weakAreas ?? []).map((item) => (
              <li key={item}>- {item}</li>
            ))}
            {audit?.weakAreas?.length ? null : <li className="text-slate-400">No weak areas yet.</li>}
          </ul>
        </div>
      </div>

      <div className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Recommended Actions</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {(audit?.recommendedActions ?? []).map((item) => (
            <li key={item}>- {item}</li>
          ))}
          {audit?.recommendedActions?.length ? null : (
            <li className="text-slate-400">No recommendations yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
