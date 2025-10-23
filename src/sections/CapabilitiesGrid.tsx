import React from "react";

const caps = [
  { title: "Edge profiling", body: "Maps your win-rate by context (trend, volatility, session) to surface “trade in your lane” guidance." },
  { title: "Discipline engine", body: "Daily limits, soft lockouts, and escalation rules — enforced by voice and the HUD panel." },
  { title: "Reminders that land", body: "Contextual nudges triggered by drawdown, streaks, and time decay — not just timers." },
  { title: "Journal that writes itself", body: "Auto-tagged entries with reasoning templates, quick voice notes, and end-of-day synthesis." },
  { title: "Backtest + live blend", body: "Compares historical patterns with your live execution to recommend realistic improvements." },
  { title: "Broker + tools", body: "Integrations: Topstep, Sierra Chart, Bookmap and more to sync trades and telemetry." },
];

export default function CapabilitiesGrid() {
  return (
    <section className="section section-pad">
      <div className="section-head text-center">
        <span className="badge mb-4">Capabilities</span>
        <h2 className="text-3xl md:text-5xl font-display text-white tracking-[-0.02em]">
          Built for disciplined, repeatable performance
        </h2>
        <p className="prose-intro text-slate-300 mx-auto mt-3">
          The assistant learns your patterns and applies structured controls so your process scales with you.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {caps.map((c) => (
          <div key={c.title} className="card p-6">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{c.title}</h3>
            <p className="text-slate-300 text-sm md:text-base">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}