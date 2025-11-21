import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  change?: {
    value: string;
    trend: "up" | "down";
  };
  badge?: string;
}

export default function MetricCard({ label, value, change, badge }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 shadow-[0_30px_60px_rgba(10,40,65,0.35)]">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/40">
        <span>{label}</span>
        {badge ? (
          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[10px] font-semibold text-white/60">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</div>
      {change ? (
        <span
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
            change.trend === "up"
              ? "bg-[#1FF0DA]/10 text-[#1FF0DA]"
              : "bg-[#FF7A7A]/10 text-[#FF7A7A]"
          }`}
        >
          <span className="text-xs">{change.trend === "up" ? "▲" : "▼"}</span> {change.value}
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1FF0DA]/10 via-transparent to-transparent" />
    </div>
  );
}










