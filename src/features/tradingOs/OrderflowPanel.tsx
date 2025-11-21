const ORDERS = [
  {
    id: "order-1",
    symbol: "ES",
    type: "Long",
    size: 3,
    fill: "4,152.25",
    status: "Filled",
    time: "09:12:04"
  },
  {
    id: "order-2",
    symbol: "NQ",
    type: "Short",
    size: 2,
    fill: "15,932.5",
    status: "Partial",
    time: "09:16:42"
  },
  {
    id: "order-3",
    symbol: "ES",
    type: "Short",
    size: 5,
    fill: "4,147.75",
    status: "Working",
    time: "09:20:18"
  },
  {
    id: "order-4",
    symbol: "YM",
    type: "Long",
    size: 1,
    fill: "34,215.0",
    status: "Filled",
    time: "09:28:55"
  },
  {
    id: "order-5",
    symbol: "CL",
    type: "Short",
    size: 2,
    fill: "78.42",
    status: "Queued",
    time: "09:31:07"
  }
];

export default function OrderflowPanel() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_34px_80px_rgba(10,32,60,0.4)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Orderflow</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Execution Stream</h3>
        </div>
        <div className="flex gap-2 text-[11px] uppercase tracking-[0.35em] text-white/40">
          <span>Auto Align</span>
          <span>•</span>
          <span>Latency &lt; 12 ms</span>
        </div>
      </header>

      <ul className="mt-6 space-y-3 text-sm">
        {ORDERS.map((order) => (
          <li
            key={order.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">{order.symbol}</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                {order.type}
                <span className="text-xs font-medium text-white/40">x{order.size}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs uppercase tracking-[0.35em] text-white/60">
              <span>{order.fill}</span>
              <span>{order.time}</span>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  order.status === "Filled"
                    ? "bg-[#1FF0DA]/10 text-[#1FF0DA]"
                    : order.status === "Partial"
                      ? "bg-[#FFD166]/10 text-[#FFD166]"
                      : "bg-[#4B7CF5]/10 text-[#4B7CF5]"
                }`}
              >
                {order.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}









