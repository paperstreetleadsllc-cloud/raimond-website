"use client";

import { useEffect, useMemo, useState } from "react";
import { formatRank, parseCitationMatches } from "@/src/lib/citations/citationDetailUtils";

type Check = {
  id: string;
  run_at: string;
  status: "ok" | "error";
  matched_urls: unknown;
  results_json: unknown;
  error_message: string | null;
};

type QueryDetailResponse =
  | {
      ok: true;
      query: {
        id: string;
        project_name: string | null;
        query_text: string;
        locale: string;
        engine: string;
      };
      checks: Check[];
    }
  | { ok: false; error: string };

export default function CitationDetailClient({ queryId }: { queryId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState<{
    query_text: string;
    locale: string;
    engine: string;
    project_name: string | null;
  } | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [copyState, setCopyState] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/citations/history?queryId=${encodeURIComponent(queryId)}`);
        const data = (await response.json()) as QueryDetailResponse;
        if (!response.ok || !data.ok) {
          if (active) setError(data.ok ? "Failed to load query history." : data.error);
          return;
        }
        if (active) {
          setQuery({
            query_text: data.query.query_text,
            locale: data.query.locale,
            engine: data.query.engine,
            project_name: data.query.project_name,
          });
          setChecks(data.checks);
        }
      } catch {
        if (active) setError("Could not load citation history.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [queryId]);

  const trend = useMemo(() => {
    if (checks.length === 0) {
      return {
        runsWithMatches: 0,
        latestMatchCount: 0,
        bestRank: null as number | null,
        lastSeenDate: null as string | null,
      };
    }

    let runsWithMatches = 0;
    let bestRank: number | null = null;
    let lastSeenDate: string | null = null;
    let lastSeenMs = -1;
    let latestMatchCount = 0;
    let latestRunMs = -1;
    let hasLatestFromTimestamp = false;

    for (const check of checks) {
      const matches = parseCitationMatches(check.matched_urls);
      if (matches.length > 0) {
        runsWithMatches += 1;
        const runAtMs = Date.parse(check.run_at);
        if (Number.isFinite(runAtMs) && runAtMs > lastSeenMs) {
          lastSeenMs = runAtMs;
          lastSeenDate = check.run_at;
        }
      }

      for (const match of matches) {
        const rank = typeof match.rank === "number" && Number.isFinite(match.rank) ? match.rank : null;
        if (rank !== null) {
          bestRank = bestRank === null ? rank : Math.min(bestRank, rank);
        }
      }

      const runAtMs = Date.parse(check.run_at);
      if (Number.isFinite(runAtMs)) {
        hasLatestFromTimestamp = true;
        if (runAtMs > latestRunMs) {
          latestRunMs = runAtMs;
          latestMatchCount = matches.length;
        }
      }
    }

    if (!hasLatestFromTimestamp) {
      latestMatchCount = parseCitationMatches(checks[0]?.matched_urls).length;
    }

    return { runsWithMatches, latestMatchCount, bestRank, lastSeenDate };
  }, [checks]);

  const simulationOutputs = useMemo(() => {
    return checks
      .map((check) => {
        const parsed = parseSimulationResultJson(check.results_json);
        const isSimulation = query?.engine === "llm_sim" || parsed.simulation === true;
        if (!isSimulation) return null;
        return {
          checkId: check.id,
          runAt: check.run_at,
          answerText: parsed.answerText,
          citations: parsed.citations,
          matchedUrls: parseCitationMatches(check.matched_urls),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [checks, query?.engine]);

  const showSimulationWarning = query?.engine === "llm_sim" || simulationOutputs.length > 0;

  async function copyText(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState(key);
      window.setTimeout(() => setCopyState((current) => (current === key ? "" : current)), 1500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopyState(key);
      window.setTimeout(() => setCopyState((current) => (current === key ? "" : current)), 1500);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading citation query history...</p>;
  }

  if (error) {
    return <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }

  if (!query) {
    return <p className="text-sm text-slate-600">Query not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{query.query_text}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Project: {query.project_name ?? "Missing project"} | Locale: {query.locale} | Engine: {query.engine}
        </p>
        {showSimulationWarning ? (
          <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            Simulation only: this run approximates LLM behavior and is not equivalent to real-world AI overview citations.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Trend summary</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Runs with matches</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{trend.runsWithMatches}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Latest match count</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{trend.latestMatchCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Best rank achieved</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{trend.bestRank ?? "n/a"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Last seen date</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {trend.lastSeenDate ? new Date(trend.lastSeenDate).toLocaleString() : "n/a"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Check history (last 30)</h3>
        {checks.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No checks yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2">Run at</th>
                  <th className="border-b border-slate-200 px-3 py-2">Status</th>
                  <th className="border-b border-slate-200 px-3 py-2">Match count</th>
                  <th className="border-b border-slate-200 px-3 py-2">Top match</th>
                  <th className="border-b border-slate-200 px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => {
                  const matches = parseCitationMatches(check.matched_urls);
                  const top = matches[0];
                  const topUrl = top && typeof top.url === "string" && top.url.trim().length > 0 ? top.url : null;
                  const copyKey = `${check.id}:top-url`;
                  return (
                    <tr key={check.id}>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                        {new Date(check.run_at).toLocaleString()}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            check.status === "ok"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {check.status}
                        </span>
                        {check.error_message ? (
                          <p className="mt-1 text-xs text-red-600">Error: {check.error_message}</p>
                        ) : null}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{matches.length}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-xs text-slate-700">
                        {top
                          ? `${formatRank(top.rank)} ${top.url}${top.matchedDomain ? ` (matched: ${top.matchedDomain})` : ""}`
                          : "n/a"}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => (topUrl ? void copyText(topUrl, copyKey) : undefined)}
                          disabled={!topUrl}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {copyState === copyKey ? "Copied" : "Copy URL"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {simulationOutputs.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Simulation Output</h3>
          <div className="mt-4 space-y-5">
            {simulationOutputs.map((output) => {
              const citationUrlLines = output.citations.map((item) => item.url).join("\n");
              return (
                <article key={output.checkId} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Run at: <span className="font-medium text-slate-700">{new Date(output.runAt).toLocaleString()}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyText(output.answerText, `${output.checkId}:answer`)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {copyState === `${output.checkId}:answer` ? "Copied" : "Copy answerText"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyText(citationUrlLines, `${output.checkId}:urls`)}
                      disabled={output.citations.length === 0}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {copyState === `${output.checkId}:urls` ? "Copied" : "Copy citation URLs"}
                    </button>
                  </div>

                  <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">answerText</p>
                    <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-800">
                      {output.answerText || "No answer text available."}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Parsed citations</p>
                    {output.citations.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-600">No citations parsed.</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-xs text-slate-700">
                        {output.citations.map((citation, index) => (
                          <li key={`${output.checkId}:${citation.url}:${index}`}>
                            {formatRank(citation.rank)} {citation.url}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">matched_urls summary</p>
                    <p className="mt-1 text-xs text-slate-700">
                      {output.matchedUrls.length} match{output.matchedUrls.length === 1 ? "" : "es"}
                    </p>
                    {output.matchedUrls.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-slate-700">
                        {output.matchedUrls.map((item, index) => (
                          <li key={`${output.checkId}:match:${item.url}:${index}`}>
                            {formatRank(item.rank)} {item.url}
                            {item.matchedDomain ? ` (matched: ${item.matchedDomain})` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

type ParsedSimulationCitation = {
  rank: number | null;
  url: string;
};

type ParsedSimulationResult = {
  simulation: boolean;
  answerText: string;
  citations: ParsedSimulationCitation[];
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSimulationResultJson(value: unknown): ParsedSimulationResult {
  if (!isObjectRecord(value)) {
    return { simulation: false, answerText: "", citations: [] };
  }

  const simulation = value.simulation === true;
  const answerText = typeof value.answerText === "string" ? value.answerText : "";
  const citations = Array.isArray(value.citations)
    ? value.citations
        .map((item): ParsedSimulationCitation | null => {
          if (!isObjectRecord(item)) return null;
          const url = typeof item.url === "string" ? item.url : "";
          if (!url) return null;
          return {
            rank: typeof item.rank === "number" ? item.rank : null,
            url,
          };
        })
        .filter((item): item is ParsedSimulationCitation => item !== null)
    : [];

  return { simulation, answerText, citations };
}
