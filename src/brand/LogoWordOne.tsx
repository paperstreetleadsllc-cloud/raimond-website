import React from "react";

/** One-word RAImond wordmark (teal RAI + tight MOND) */
export default function LogoWordOne({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end ${className}`} aria-label="RAImond">
      {/* RAI glyph */}
      <svg
        width="120"
        height="28"
        viewBox="0 0 120 28"
        className="translate-y-[1px] drop-shadow-[0_0_14px_rgba(25,224,200,.45)]"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="raiGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#20F2D9" />
            <stop offset="100%" stopColor="#0BC1AE" />
          </linearGradient>
        </defs>
        {/* R */}
        <path d="M2 26V2h13.2c5.4 0 8.9 3.2 8.9 7.6c0 3.9-2.7 7-7.4 7.6l8.2 8.8h-9.7l-7.8-8.3H10.8V26H2Zm8.8-13h5.2c2.2 0 3.8-1.3 3.8-3.1c0-1.9-1.6-3.2-3.8-3.2h-5.2V13Z" fill="url(#raiGrad)"/>
        {/* A */}
        <path d="M38.5 26L48 2h9.2L66.6 26h-8.5l-1.3-4.1h-8.5l-1.4 4.1h-8.4Zm12.2-9.9h6.3l-3.1-9.3-3.2 9.3Z" fill="url(#raiGrad)"/>
        {/* I */}
        <path d="M75.5 26V2h9.6V26h-9.6Zm-2.1-24h13.8v3.2H73.4V2Zm0 20.8h13.8V26H73.4v-3.2Z" fill="url(#raiGrad)"/>
      </svg>

      {/* mond (tight lockup) */}
      <span
        className="-ml-1 text-white/95 tracking-[-0.035em] leading-[0.9]"
        style={{ fontWeight: 850, fontSize: "1.05rem", textTransform: "uppercase" }}
      >
        MOND
      </span>
    </div>
  );
}

