import React from "react";

export default function MetricsBand() {
  const items = [
    { label: "Rules Enforced", value: "12,847+", icon: "🛡️" },
    { label: "Cooldowns Triggered", value: "3,214+", icon: "⏸️" },
    { label: "Sessions Reviewed", value: "8,932+", icon: "📊" },
    { label: "Max Daily Loss Locks", value: "1,127", icon: "🔒" },
    { label: "Rule Breaches Prevented", value: "5,406", icon: "🚫" },
    { label: "Win Streaks Preserved", value: "2,391", icon: "🏆" },
  ];

  return (
    <section className="py-14 md:py-18 relative">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="text-center text-3xl md:text-4xl font-semibold text-white">
          Built for Discipline
        </h2>
        <p className="mt-2 text-center text-white/70">
          Real metrics from traders who trust RAimond to enforce their edge.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((it) => (
            <div
              key={it.label}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-6 text-center hover:border-white/15 hover:bg-white/8 transition-all duration-300"
            >
              <div className="text-2xl mb-2">{it.icon}</div>
              <div className="text-2xl font-semibold text-white">
                {it.value}
              </div>
              <div className="mt-1 text-xs text-white/60">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
