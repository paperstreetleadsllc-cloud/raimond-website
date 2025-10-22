import React from "react";

/**
 * Sleek tech wordmark:
 * - Custom monoline "RAI" glyph (SVG paths)
 * - "mond" set in the UI font for clarity
 * - Subtle teal glow, scales cleanly at any size
 */
export default function LogoWord({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* RAI monoline glyph */}
      <svg
        width="112" height="24" viewBox="0 0 112 24"
        className="drop-shadow-[0_0_10px_rgba(25,224,200,.35)]"
        aria-label="RAI"
      >
        <defs>
          <linearGradient id="rai-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#19E0C8"/><stop offset="100%" stopColor="#7EF1E4"/>
          </linearGradient>
        </defs>
        {/* R */}
        <path
          d="M4 20 V4 h7.2c3 0 5 1.8 5 4.4c0 2.5-1.9 4.2-4.8 4.2H8.6l7.2 7.4"
          fill="none" stroke="url(#rai-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          />
        {/* A */}
        <path
          d="M32 20 L39 4 L46 20 M34.8 14.2h6.4"
          fill="none" stroke="url(#rai-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          />
        {/* I */}
        <path
          d="M58 4 V20 M54 4h8 M54 20h8"
          fill="none" stroke="url(#rai-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          />
      </svg>

      {/* mond label */}
      <span
        className="text-white/95 tracking-[-0.01em]"
        style={{ fontWeight: 600, fontSize: "1rem", lineHeight: 1 }}
      >
        mond
      </span>
    </div>
  );
}