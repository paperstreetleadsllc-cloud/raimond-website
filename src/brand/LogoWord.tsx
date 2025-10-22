import React from "react";

/** Teal "RAI" + white "mond" — scalable wordmark */
export default function LogoWord({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon badge left (optional subtle) */}
      <svg width="26" height="26" viewBox="0 0 26 26" className="drop-shadow-[0_0_10px_rgba(25,224,200,.35)]">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#19E0C8"/>
            <stop offset="100%" stopColor="#7EF1E4"/>
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="24" height="24" rx="6" fill="url(#g)" opacity=".15" stroke="url(#g)" strokeOpacity=".7"/>
        {/* stylized RAI lines */}
        <path d="M7 18 L10 8 L12 8 L9 18 Z" fill="url(#g)" opacity=".9"/>
        <path d="M12.2 18 L14.4 12.5 L16.6 18 Z" fill="url(#g)" opacity=".9"/>
        <rect x="18" y="8" width="2" height="10" rx="1" fill="url(#g)"/>
      </svg>

      {/* Wordmark */}
      <span className="font-[600] tracking-[-0.01em] text-[1.05rem] sm:text-[1.12rem] leading-none">
        <span className="text-[var(--accent)]">RAI</span>
        <span className="text-white">mond</span>
      </span>
    </div>
  );
}