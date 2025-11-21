const SIGNALS = [
  { label: "Liquidity Zones", value: "High", color: "text-[#1FF0DA]" },
  { label: "Volatility", value: "Moderate", color: "text-[#4B7CF5]" },
  { label: "Trend Bias", value: "Bullish", color: "text-[#7FF0ED]" }
];

const PRICE_POINTS = [4125, 4132, 4118, 4146, 4158, 4142, 4165];

export default function MarketActivity() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 shadow-[0_40px_120px_rgba(8,28,54,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Market Activity</p>
          <h2 className="mt-2 text-xl font-semibold text-white">ES Futures Microflow</h2>
        </div>
        <div className="flex gap-3">
          {SIGNALS.map((signal) => (
            <div key={signal.label} className="rounded-2xl border border-white/10 px-4 py-2 text-xs">
              <span className="block uppercase tracking-[0.35em] text-white/40">{signal.label}</span>
              <span className={`text-sm font-semibold ${signal.color}`}>{signal.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Orderflow Heatmap</span>
            <span>8:30 ET — 14:00 ET</span>
          </div>
          <div className="mt-6 grid grid-cols-12 gap-[2px]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-md bg-gradient-to-b from-[#1FF0DA]/10 via-[#4B7CF5]/20 to-[#1FF0DA]/15"
              />
            ))}
          </div>
          <div className="mt-6 flex justify-between text-[10px] uppercase tracking-[0.35em] text-white/30">
            <span>Bid</span>
            <span>Ask</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/40">
            <span>Price Action</span>
            <span>1H View</span>
          </div>
          <ul className="mt-6 space-y-4 text-sm text-white/80">
            {PRICE_POINTS.map((price, index) => (
              <li key={price} className="flex items-center justify-between">
                <span className="text-white/40">{`Leg ${index + 1}`}</span>
                <span className="font-semibold">{price.toLocaleString()}</span>
                <span
                  className={`text-xs font-medium ${
                    index % 2 === 0 ? "text-[#1FF0DA]" : "text-[#FF7A7A]"
                  }`}
                >
                  {index % 2 === 0 ? "+12.8" : "-8.6"}
                </span>
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full rounded-xl border border-[#1FF0DA]/30 bg-[#1FF0DA]/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#1FF0DA]/60 hover:bg-[#1FF0DA]/20">
            Launch Advanced Chart
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(79,197,255,0.16),_transparent_55%)]" />
    </section>
  );
}









