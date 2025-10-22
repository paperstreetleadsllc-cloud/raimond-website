import React from "react";

/**
 * RAImond heavy/edgy wordmark
 * - Thick strokes, angular joins
 * - Subtle neon edge glow
 * - “MOND” condensed lockup to balance weight
 */
export default function LogoWordHeavy({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`} aria-label="RAImond">
      {/* Heavy angular RAI glyph */}
      <svg
        width="140"
        height="30"
        viewBox="0 0 140 30"
        role="img"
        className="drop-shadow-[0_0_14px_rgba(25,224,200,.45)]"
      >
        <defs>
          <linearGradient id="rai-heavy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#20F2D9" />
            <stop offset="100%" stopColor="#0BC1AE" />
          </linearGradient>
        </defs>

        {/* R (blocky with diagonal leg) */}
        <path
          d="M4 26 V4 h13 c5.2 0 8.6 3 8.6 7.3 c0 3.8-2.6 6.8-7.1 7.3 l7.9 7.4 h-9.2 l-7.4-7.2 h-3.8 V26 Z
             M12.2 15.2 h4.8 c2.0 0 3.5-1.2 3.5-2.9 c0-1.8-1.5-3-3.5-3 h-4.8 v5.9 Z"
          fill="url(#rai-heavy)"
        />

        {/* A (hard apex + crossbar) */}
        <path
          d="M39 26 L48.6 4 h8.8 L67 26 h-8.2 l-1.3-4 h-8.1 l-1.3 4 H39 Z
             M50.5 16.5 h6.0 l-3.0-9 -3.0 9 Z"
          fill="url(#rai-heavy)"
        />

        {/* I (monolithic with cap stripes) */}
        <path
          d="M78 26 V4 h9.2 v22 H78 Z
             M76.2 4 h12.8 v3 h-12.8 Z
             M76.2 23 h12.8 v3 h-12.8 Z"
          fill="url(#rai-heavy)"
        />
      </svg>

      {/* MOND compact word lockup */}
      <span
        className="text-white/95 tracking-[-0.02em] leading-[0.9]"
        style={{
          fontWeight: 800,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
        }}
      >
        MOND
      </span>
    </div>
  );
}