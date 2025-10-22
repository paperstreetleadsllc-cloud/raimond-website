import React from "react";

/** Compact teal icon for favicon/buttons */
export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 26 26">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#19E0C8"/>
          <stop offset="100%" stopColor="#7EF1E4"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="24" height="24" rx="6" fill="url(#g2)" opacity=".16" stroke="url(#g2)" strokeOpacity=".7"/>
      <path d="M7 18 L10 8 L12 8 L9 18 Z" fill="url(#g2)" opacity=".9"/>
      <path d="M12.2 18 L14.4 12.5 L16.6 18 Z" fill="url(#g2)" opacity=".9"/>
      <rect x="18" y="8" width="2" height="10" rx="1" fill="url(#g2)"/>
    </svg>
  );
}