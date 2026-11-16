export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="1" y="1" width="24" height="24" rx="7" fill={light ? "#FFFFFF" : "#0F2E2D"} />
        <path d="M7 18 L10 8 L12 8 L9 18 Z" fill="#1FF0DA" />
        <path d="M12.2 18 L14.4 12.5 L16.6 18 Z" fill="#1FF0DA" />
        <rect x="18" y="8" width="2" height="10" rx="1" fill="#1FF0DA" />
      </svg>
      <span className={`font-display text-[21px] font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        RAimond<span className={light ? "text-teal-brand" : "text-teal-ink"}>AI</span>
      </span>
    </span>
  );
}
