"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { STAGES, type CategoryKey, type CheckResult, type PromptIntent, type Recommendation } from "@/lib/audit/types";
import type { PublicAudit } from "@/lib/service";

const INTENT_LABEL: Record<PromptIntent, string> = {
  local: "Local purchase intent",
  urgent: "Urgent service need",
  commercial: "Commercial",
  comparison: "Comparison",
  informational: "Informational",
};

const STATUS_STYLE: Record<CheckResult["status"], { label: string; cls: string }> = {
  pass: { label: "Pass", cls: "bg-emerald-50 text-emerald-800" },
  partial: { label: "Partial", cls: "bg-amber-50 text-amber-800" },
  fail: { label: "Missing", cls: "bg-rose-50 text-rose-800" },
};

const PRIORITY_STYLE: Record<Recommendation["priority"], string> = {
  High: "bg-rose-50 text-rose-800",
  Medium: "bg-amber-50 text-amber-800",
  Low: "bg-slate-100 text-slate-700",
};

function scoreWord(score: number) {
  if (score >= 80) return "Strong foundation";
  if (score >= 60) return "Solid, with clear gaps";
  if (score >= 40) return "Needs work";
  return "Significant gaps";
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 128 128" className="h-36 w-36" role="img" aria-label={`AI Readiness Score: ${score} out of 100`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="#0BA898" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 64 64)" />
      <text x="64" y="62" textAnchor="middle" dominantBaseline="middle" className="fill-ink font-display" fontSize="34" fontWeight="600">{score}</text>
      <text x="64" y="86" textAnchor="middle" className="fill-slate-500" fontSize="11">out of 100</text>
    </svg>
  );
}

export function Progress({ audit }: { audit: PublicAudit }) {
  const done = new Set(audit.progress?.stagesDone ?? []);
  const current = audit.progress?.stage;
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Auditing {new URL(audit.inputUrl).hostname}</h1>
        <p className="mt-2 text-slate-600">This page updates as each step actually finishes.</p>
        <ol className="mt-6 space-y-3" aria-live="polite">
          {STAGES.map((s) => {
            const state = done.has(s.key) ? "done" : current === s.key ? "active" : "waiting";
            return (
              <li key={s.key} className="flex items-center gap-3 text-[15px]">
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${state === "done" ? "bg-teal-deep text-white" : state === "active" ? "animate-pulse border-2 border-teal-deep" : "border border-slate-300"}`}
                >
                  {state === "done" ? "✓" : ""}
                </span>
                <span className={state === "waiting" ? "text-slate-400" : "text-ink"}>
                  {s.label}
                  {s.key === "crawl" && state === "active" && audit.progress && audit.progress.pagesPlanned > 0
                    ? ` (${audit.progress.pagesFetched} of ${audit.progress.pagesPlanned})`
                    : ""}
                </span>
                <span className="sr-only">{state === "done" ? "finished" : state === "active" ? "in progress" : "not started"}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Failure({ message }: { message: string }) {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">We couldn&apos;t complete this audit</h1>
        <p className="mt-3 leading-relaxed" role="alert">{message}</p>
        <Link href="/audit" className="btn-primary mt-6">Try another address</Link>
      </div>
    </div>
  );
}

function LeadForm({ auditId }: { auditId: string }) {
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ auditId, email, company_website: trap }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) {
      setError(data.error ?? "We couldn't save your request. Please try again.");
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Thanks. Your request is saved and we&apos;ll be in touch about your full report.</p>;
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" noValidate>
      <label className="sr-only" htmlFor="lead-email">Email address</label>
      <input id="lead-email" type="email" required autoComplete="email" placeholder="you@yourbusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-ink" />
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <input tabIndex={-1} autoComplete="off" name="company_website" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>
      <button type="submit" disabled={state === "busy" || !email} className="btn-primary whitespace-nowrap">{state === "busy" ? "Saving…" : "Request the full report"}</button>
      {error ? <p role="alert" className="text-sm text-rose-700 sm:basis-full">{error}</p> : null}
    </form>
  );
}

export function Report({ audit }: { audit: PublicAudit }) {
  const r = audit.result!;
  const b = r.business;
  const byCategory = (key: CategoryKey) => r.readiness.checks.filter((c) => c.category === key);
  const intents = [...new Set(r.prompts.map((p) => p.intent))];
  const blockedSearch = r.crawl.robots.aiCrawlers.filter((c) => !c.allowed);

  return (
    <div className="bg-slate-50">
      <div className="container-page space-y-6 py-10">
        {/* Overview */}
        <section className="card p-6 sm:p-8" aria-labelledby="overview">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow">AI visibility snapshot</p>
              <h1 id="overview" className="mt-2 break-words text-3xl font-semibold sm:text-4xl">{b.name?.value ?? new URL(r.finalUrl).hostname}</h1>
              <dl className="mt-5 grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
                <div><dt className="text-slate-500">Website</dt><dd className="break-all font-medium text-ink">{r.finalUrl}</dd></div>
                <div><dt className="text-slate-500">Audit date</dt><dd className="font-medium text-ink">{new Date(r.auditedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</dd></div>
                <div>
                  <dt className="text-slate-500">Industry</dt>
                  <dd className="font-medium text-ink">{b.industry?.value ?? "Not determined"}</dd>
                  {b.industry ? <dd className="text-xs text-slate-500">From {b.industry.source}</dd> : <dd className="text-xs text-slate-500">The site did not give a clear enough signal</dd>}
                </div>
                <div>
                  <dt className="text-slate-500">Service location</dt>
                  <dd className="font-medium text-ink">{b.locations?.value.slice(0, 3).join("; ") ?? "Not determined"}</dd>
                  {b.locations ? <dd className="text-xs text-slate-500">From {b.locations.source}</dd> : null}
                </div>
                {b.services.length ? (
                  <div className="sm:col-span-2"><dt className="text-slate-500">Services found on the site</dt><dd className="font-medium capitalize text-ink">{b.services.map((s) => s.name).join(", ")}</dd></div>
                ) : null}
              </dl>
            </div>
            <div className="flex items-center gap-6 lg:flex-col lg:gap-2 lg:text-center">
              <ScoreRing score={r.readiness.score} />
              <div>
                <p className="font-display text-lg font-semibold text-ink">AI Readiness Score</p>
                <p className="text-sm text-slate-600">{scoreWord(r.readiness.score)}</p>
              </div>
            </div>
          </div>
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            This score measures your website, based on {r.stats.pagesAnalyzed} page{r.stats.pagesAnalyzed === 1 ? "" : "s"} we read. It does not tell you whether AI products currently mention your business. That is reported separately below and only when it has actually been observed.
          </p>
        </section>

        {/* Readiness breakdown */}
        <section className="card p-6 sm:p-8" aria-labelledby="readiness">
          <h2 id="readiness" className="text-2xl font-semibold">Readiness breakdown</h2>
          <p className="mt-1 text-slate-600">Open a category to see each check and the evidence behind it.</p>
          <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {r.readiness.categories.map((cat) => (
              <details key={cat.key} className="group py-4">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="min-w-[14rem] flex-1 text-base font-semibold">{cat.label}</h3>
                  <span className="h-2 w-40 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                    <span className="block h-full rounded-full bg-teal-deep" style={{ width: `${(cat.earned / cat.max) * 100}%` }} />
                  </span>
                  <span className="w-20 text-right text-sm font-medium tabular-nums text-ink">{cat.earned} / {cat.max}</span>
                  <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <ul className="mt-4 space-y-3">
                  {byCategory(cat.key).map((check) => (
                    <li key={check.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-ink">{check.label}</p>
                        <span className="flex items-center gap-3">
                          <span className="text-sm tabular-nums text-slate-500">{check.earned} / {check.max}</span>
                          <span className={`pill ${STATUS_STYLE[check.status].cls}`}>{STATUS_STYLE[check.status].label}</span>
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-600">
                        {check.evidence.map((e, i) => <li key={i} className="break-words">{e}</li>)}
                      </ul>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="card p-6 sm:p-8" aria-labelledby="recs">
          <h2 id="recs" className="text-2xl font-semibold">Priority recommendations</h2>
          {r.recommendations.length === 0 ? (
            <p className="mt-3">Every check passed on the pages we read. Nothing to fix here.</p>
          ) : (
            <ol className="mt-6 space-y-5">
              {r.recommendations.map((rec, i) => (
                <li key={rec.id} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{i + 1}. {rec.title}</h3>
                    <span className="flex gap-2">
                      <span className={`pill ${PRIORITY_STYLE[rec.priority]}`}>{rec.priority} priority</span>
                      <span className="pill bg-slate-100 text-slate-700">{rec.effort} effort</span>
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-4 text-[15px] leading-relaxed md:grid-cols-2">
                    <div><dt className="text-sm font-semibold text-ink">Problem</dt><dd>{rec.problem}</dd></div>
                    <div><dt className="text-sm font-semibold text-ink">Why it matters</dt><dd>{rec.businessImpact}</dd></div>
                    <div className="md:col-span-2"><dt className="text-sm font-semibold text-ink">What we found</dt><dd className="break-words text-slate-600">{rec.evidence.join(" ")}</dd></div>
                    <div>
                      <dt className="text-sm font-semibold text-ink">How to fix it</dt>
                      <dd><ol className="ml-5 list-decimal space-y-1">{rec.implementation.map((s) => <li key={s}>{s}</li>)}</ol></dd>
                    </div>
                    <div><dt className="text-sm font-semibold text-ink">How to verify</dt><dd>{rec.verification}</dd><dd className="mt-2 text-sm text-slate-500">Up to {rec.pointsAvailable} readiness points available.</dd></div>
                  </dl>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 rounded-2xl bg-night-700 p-6 text-slate-200">
            <h3 className="text-lg font-semibold !text-white">
              {audit.result!.moreRecommendations > 0 ? `${audit.result!.moreRecommendations} more recommendation${audit.result!.moreRecommendations === 1 ? "" : "s"} in the full report` : "Want the full report?"}
            </h3>
            <p className="mb-4 mt-1 text-sm text-slate-300">Leave your email and we&apos;ll contact you about the complete audit and action plan. No spam, and we don&apos;t share it.</p>
            <LeadForm auditId={audit.id} />
          </div>
        </section>

        {/* Platform visibility */}
        <section className="card p-6 sm:p-8" aria-labelledby="platforms">
          <h2 id="platforms" className="text-2xl font-semibold">Observed AI visibility</h2>
          <p className="mt-1 max-w-3xl text-slate-600">Whether AI products actually mention this business can only be known by asking them and recording the answers. This snapshot did not query any AI platform, so nothing is reported here. No figure below is estimated.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-[15px]">
              <thead className="text-sm text-slate-500">
                <tr className="border-b border-slate-200">
                  <th scope="col" className="py-2 pr-4 font-medium">Platform</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Questions tested</th>
                  <th scope="col" className="py-2 font-medium">Mentioned / recommended / cited</th>
                </tr>
              </thead>
              <tbody>
                {r.providers.map((p) => (
                  <tr key={p.key} className="border-b border-slate-100">
                    <th scope="row" className="py-3 pr-4 font-medium text-ink">{p.name}</th>
                    <td className="py-3 pr-4"><span className="pill bg-slate-100 text-slate-700">{p.note}</span></td>
                    <td className="py-3 pr-4 text-slate-500">0</td>
                    <td className="py-3 text-slate-500">No data</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-8 text-lg font-semibold">Can AI crawlers read this site?</h3>
          <p className="mt-1 text-slate-600">This part is measured: it comes from the site&apos;s robots.txt file.{blockedSearch.length === 0 ? " No crawler we check is blocked." : ""}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {r.crawl.robots.aiCrawlers.map((c) => (
              <li key={c.agent} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
                <span><span className="font-medium text-ink">{c.agent}</span><span className="block text-slate-500">{c.purpose}</span></span>
                <span className={`pill ${c.allowed ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{c.allowed ? "Allowed" : "Blocked"}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Questions */}
        <section className="card p-6 sm:p-8" aria-labelledby="questions">
          <h2 id="questions" className="text-2xl font-semibold">Customer questions worth tracking</h2>
          {r.prompts.length === 0 ? (
            <p className="mt-3 max-w-3xl">We could not determine this business&apos;s industry from the site, so we have not generated questions rather than guess. Making the industry and services explicit on the homepage will fix this.</p>
          ) : (
            <>
              <p className="mt-1 max-w-3xl text-slate-600">Built from the industry, services, and location found on the site. These are the questions to test against AI platforms. They have not been tested yet.</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {intents.map((intent) => (
                  <div key={intent}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{INTENT_LABEL[intent]}</h3>
                    <ul className="mt-2 space-y-2">
                      {r.prompts.filter((p) => p.intent === intent).map((p) => (
                        <li key={p.question} className="rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-ink">{p.question}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Pages */}
        <section className="card p-6 sm:p-8" aria-labelledby="pages">
          <h2 id="pages" className="text-2xl font-semibold">Pages we read</h2>
          <p className="mt-1 text-slate-600">{r.stats.pagesAnalyzed} {r.stats.pagesAnalyzed === 1 ? "page" : "pages"}, {r.stats.requests} requests, completed in {(r.stats.durationMs / 1000).toFixed(1)} seconds. The free snapshot reads up to 10 pages.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th scope="col" className="py-2 pr-4 font-medium">Page</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Title</th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">Words</th>
                  <th scope="col" className="py-2 text-right font-medium">Schema types</th>
                </tr>
              </thead>
              <tbody>
                {r.crawl.pages.map((p) => (
                  <tr key={p.url} className="border-b border-slate-100 align-top">
                    <th scope="row" className="max-w-[16rem] break-all py-2 pr-4 font-medium text-ink">{new URL(p.url).pathname}</th>
                    <td className="max-w-[20rem] py-2 pr-4">{p.title || <span className="text-rose-700">No title</span>}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{p.wordCount}</td>
                    <td className="py-2 text-right tabular-nums">{new Set(p.schema.flatMap((s) => s.types)).size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {r.crawl.brokenInternalLinks.length ? (
            <p className="mt-4 text-sm text-slate-600">Links that failed when we requested them: {r.crawl.brokenInternalLinks.map((l) => `${new URL(l.url).pathname} (${l.status ?? "no response"})`).join(", ")}.</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function AuditView({ id }: { id: string }) {
  const [audit, setAudit] = useState<PublicAudit | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const failures = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/audits/${id}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!cancelled) setLoadError("We couldn't find that audit. It may have expired.");
          return;
        }
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as PublicAudit;
        if (cancelled) return;
        failures.current = 0;
        setAudit(data);
        if (data.status === "queued" || data.status === "running") timer = setTimeout(poll, 1500);
      } catch {
        if (cancelled) return;
        if (++failures.current >= 5) setLoadError("We lost contact with the server. Refresh the page to check on this audit.");
        else timer = setTimeout(poll, 3000);
      }
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  if (loadError) return <Failure message={loadError} />;
  if (!audit) return <div className="container-page py-16 text-center text-slate-500" role="status">Loading audit…</div>;
  if (audit.status === "failed") return <Failure message={audit.error?.message ?? "The audit did not finish."} />;
  if (audit.status !== "completed" || !audit.result) return <Progress audit={audit} />;
  return <Report audit={audit} />;
}
