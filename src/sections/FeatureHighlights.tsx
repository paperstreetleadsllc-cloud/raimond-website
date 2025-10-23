import React from "react";

const items = [
  {
    title: "Over-confidence guardrails",
    body:
      "Dynamic size caps and pacing prompts kick in when you’re hot — momentum stays controlled, not emotional.",
  },
  {
    title: "Revenge trading breaker",
    body:
      "After losses, RAImond enters a cool-down state and nudges toward low-risk modes with calm cues and timeboxed resets.",
  },
  {
    title: "Accountability timers & check-ins",
    body:
      "Daily rituals, end-of-session reviews, and guided micro-audits build structure you can trust — consistency through routine.",
  },
];

export default function FeatureHighlights() {
  return (
    <section className="section section-pad">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="card p-6">
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 tracking-[-0.01em]">
              {it.title}
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}