import MetricCard from "./MetricCard";

const METRICS = [
  {
    label: "Net P&L",
    value: "$42,730",
    change: { value: "+12.4%", trend: "up" as const }
  },
  {
    label: "Win Rate",
    value: "68.9%",
    change: { value: "+4.7%", trend: "up" as const },
    badge: "LIVE"
  },
  {
    label: "Sessions",
    value: 5,
    change: { value: "Active", trend: "up" as const }
  },
  {
    label: "Risk Utilization",
    value: "42%",
    change: { value: "-3.1%", trend: "down" as const }
  }
];

export default function MetricsRow() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
}










