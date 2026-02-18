import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  aeoApi,
  isSubscriptionRequiredError,
  type AeoActionPlan,
  type AeoPlanDeliverable,
  type AeoSite,
} from "../lib/aeoApi";

type PriorityFilter = "ALL" | "P0" | "P1" | "P2";

const priorityRank: Record<Exclude<PriorityFilter, "ALL">, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};

const priorityClass = (priority: "P0" | "P1" | "P2"): string => {
  if (priority === "P0") {
    return "border-rose-300/35 bg-rose-500/12 text-rose-100";
  }
  if (priority === "P1") {
    return "border-amber-300/35 bg-amber-500/12 text-amber-100";
  }
  return "border-emerald-300/35 bg-emerald-500/12 text-emerald-100";
};

const deliverableToText = (deliverable: AeoPlanDeliverable): string => {
  if (deliverable.type === "jsonld") {
    return JSON.stringify(deliverable.json, null, 2);
  }
  if (deliverable.type === "copy") {
    return deliverable.text;
  }
  return deliverable.sections.map((section) => `- ${section}`).join("\n");
};

export default function PlanPage() {
  const { id = "" } = useParams();
  const [site, setSite] = useState<AeoSite | null>(null);
  const [plan, setPlan] = useState<AeoActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<PriorityFilter>("ALL");
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
          setPlan(null);
          setError("Site not found.");
          return;
        }
        const latestPlan = await aeoApi.getLatestPlan(selected.id);
        setPlan(latestPlan);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load plan.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const generatePlan = async () => {
    if (!site) {
      return;
    }
    setGenerating(true);
    setError(null);
    setSubscriptionRequired(false);
    try {
      const generated = await aeoApi.generatePlan(site.id);
      setPlan(generated);
    } catch (requestError) {
      if (isSubscriptionRequiredError(requestError)) {
        setSubscriptionRequired(true);
      }
      setError(requestError instanceof Error ? requestError.message : "Failed to generate plan.");
    } finally {
      setGenerating(false);
    }
  };

  const visibleItems = useMemo(() => {
    const sorted = [...(plan?.items ?? [])].sort(
      (left, right) =>
        priorityRank[left.priority] - priorityRank[right.priority] || left.title.localeCompare(right.title),
    );
    if (filter === "ALL") {
      return sorted;
    }
    return sorted.filter((item) => item.priority === filter);
  }, [filter, plan]);

  const exportJson = () => {
    if (!plan) {
      return;
    }
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `aeo-plan-${plan.siteId}.json`;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Site Plan</h1>
          <p className="text-sm text-slate-400">
            Generate copy, JSON-LD, and content outlines from latest audit data.
          </p>
        </div>
        {site ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void generatePlan()}
              disabled={generating}
              className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60"
            >
              {generating ? "Generating..." : "Generate Plan"}
            </button>
            <button
              type="button"
              onClick={exportJson}
              disabled={!plan}
              className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300/35 disabled:opacity-60"
            >
              Export JSON
            </button>
            <Link
              to={`/sites/${site.id}/audit`}
              className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300/35"
            >
              Back to Audit
            </Link>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {subscriptionRequired ? (
        <div className="rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100">
          Subscription required to generate plans. Visit <Link to="/pricing">pricing</Link>.
        </div>
      ) : null}

      <div className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Summary</p>
        {loading ? (
          <div className="mt-3 h-12 animate-pulse rounded-md bg-slate-800/70" />
        ) : (
          <p className="mt-3 text-sm text-slate-200">
            {plan?.summary ?? "No plan found yet. Generate one after you run an audit."}
          </p>
        )}
      </div>

      <div className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Checklist</p>
          <div className="flex flex-wrap gap-2">
            {(["ALL", "P0", "P1", "P2"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-md border px-3 py-1 text-xs ${
                  filter === value
                    ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
                    : "border-cyan-300/20 text-slate-200 hover:border-cyan-300/35"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {visibleItems.length === 0 ? (
            <p className="text-sm text-slate-400">No plan items for this filter.</p>
          ) : (
            visibleItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-cyan-300/15 bg-slate-900/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-slate-100">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.category} - Impact {item.estimatedImpact} - Effort {item.effort}
                    </p>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 text-xs ${priorityClass(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-slate-200">
                  {item.instructions.map((instruction) => (
                    <li key={`${item.id}-${instruction}`}>- {instruction}</li>
                  ))}
                </ul>

                <div className="mt-3 space-y-2">
                  {item.deliverables.map((deliverable) => {
                    const key = `${item.id}-${deliverable.label}`;
                    const output = deliverableToText(deliverable);
                    const copyAllowed = deliverable.type === "copy" || deliverable.type === "jsonld";

                    return (
                      <div key={key} className="rounded-lg border border-cyan-300/15 bg-slate-950/65 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                            {deliverable.label}
                          </p>
                          {copyAllowed ? (
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(output);
                                setCopied(key);
                                window.setTimeout(() => setCopied(null), 1100);
                              }}
                              className="rounded-md border border-cyan-300/20 px-2 py-1 text-xs text-slate-200 hover:border-cyan-300/35"
                            >
                              {copied === key ? "Copied" : "Copy"}
                            </button>
                          ) : null}
                        </div>
                        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-2 text-xs text-slate-300">
                          {output}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
