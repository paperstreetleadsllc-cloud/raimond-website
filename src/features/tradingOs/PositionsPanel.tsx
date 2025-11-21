const POSITIONS = [
  {
    symbol: "ES",
    direction: "Long",
    size: 4,
    entry: "4,138.25",
    last: "4,152.00",
    pnl: "+$5,510",
    pnlColor: "text-[#1FF0DA]"
  },
  {
    symbol: "NQ",
    direction: "Short",
    size: 2,
    entry: "15,962.50",
    last: "15,918.00",
    pnl: "+$8,900",
    pnlColor: "text-[#1FF0DA]"
  },
  {
    symbol: "CL",
    direction: "Short",
    size: 3,
    entry: "79.12",
    last: "78.45",
    pnl: "+$2,010",
    pnlColor: "text-[#1FF0DA]"
  },
  {
    symbol: "GC",
    direction: "Long",
    size: 1,
    entry: "2,350.40",
    last: "2,332.80",
    pnl: "-$1,760",
    pnlColor: "text-[#FF7A7A]"
  }
];

export default function PositionsPanel() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_34px_80px_rgba(10,32,60,0.4)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Positions</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Live Exposure</h3>
        </div>
        <button className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-[#1FF0DA]/40 hover:text-white">
          Manage Risk
        </button>
      </header>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-fixed text-left text-xs uppercase tracking-[0.35em] text-white/40">
          <thead className="text-[10px] text-white/30">
            <tr className="border-b border-white/10">
              <th className="pb-3 pr-6 font-medium">Symbol</th>
              <th className="pb-3 pr-6 font-medium">Direction</th>
              <th className="pb-3 pr-6 font-medium">Size</th>
              <th className="pb-3 pr-6 font-medium">Entry</th>
              <th className="pb-3 pr-6 font-medium">Last</th>
              <th className="pb-3 font-medium text-right">PnL</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-white">
            {POSITIONS.map((position) => (
              <tr key={position.symbol} className="border-b border-white/5">
                <td className="py-4 pr-6">{position.symbol}</td>
                <td className="py-4 pr-6 text-white/60">{position.direction}</td>
                <td className="py-4 pr-6 text-white/60">x{position.size}</td>
                <td className="py-4 pr-6 font-semibold">{position.entry}</td>
                <td className="py-4 pr-6 font-semibold">{position.last}</td>
                <td className={`py-4 text-right font-semibold ${position.pnlColor}`}>
                  {position.pnl}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}









