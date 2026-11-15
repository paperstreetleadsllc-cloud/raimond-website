export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 26 26" aria-hidden="true">
        <defs>
          <linearGradient id="rai-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#19E0C8" />
            <stop offset="100%" stopColor="#0BA898" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="24" height="24" rx="6" fill={light ? "#0b1426" : "#0b1426"} />
        <path d="M7 18 L10 8 L12 8 L9 18 Z" fill="url(#rai-mark)" />
        <path d="M12.2 18 L14.4 12.5 L16.6 18 Z" fill="url(#rai-mark)" />
        <rect x="18" y="8" width="2" height="10" rx="1" fill="url(#rai-mark)" />
      </svg>
      <span className={`font-display text-lg font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        RAimond<span className="text-teal-deep">AI</span>
      </span>
    </span>
  );
}
