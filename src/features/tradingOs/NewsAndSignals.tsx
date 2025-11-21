const items = [
  {
    title: "Fed minutes hint at tighter liquidity window",
    time: "5m ago",
    impact: "High",
    type: "Macro Signal"
  },
  {
    title: "AI sentiment feed detecting flow shift in NVDA",
    time: "9m ago",
    impact: "Medium",
    type: "Alpha Pulse"
  },
  {
    title: "Crude supply drawdown accelerating vs forecasts",
    time: "18m ago",
    impact: "Medium",
    type: "Market Brief"
  },
  {
    title: "Execution agent suggests scaling ES position by 15%",
    time: "27m ago",
    impact: "High",
    type: "Agent Insight"
  }
];

export default function NewsAndSignals() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_34px_80px_rgba(9,28,52,0.45)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Signals</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Briefing Feed</h3>
        </div>
        <span className="rounded-full border border-[#1FF0DA]/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#1FF0DA]">
          Live Sync
        </span>
      </header>

      <ul className="mt-6 space-y-4 text-sm text-white/80">
        {items.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-[#1FF0DA]/40"
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/30">
              <span>{item.type}</span>
              <span>{item.time}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
            <span className="mt-3 inline-flex rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/50">
              Impact: {item.impact}
            </span>
          </li>
        ))}
      </ul>

      <button className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-[#1FF0DA]/40 hover:text-white">
        View agent recommendations
      </button>
    </section>
  );
}









