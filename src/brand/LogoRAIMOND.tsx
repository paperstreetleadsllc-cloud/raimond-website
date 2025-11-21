import React from "react";

/**
 * RAIMOND wordmark – single word:
 * - "RAI" teal accent
 * - "MOND" white with tighter kerning and a tiny negative left margin
 * - No space, reads as one brand
 */
type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "text-[18px] md:text-[20px]",
  md: "text-[22px] md:text-[24px]",
  lg: "text-[26px] md:text-[30px]",
};

export default function LogoRAIMOND({
  size = "sm",
  className = "",
  asLink = true,
}: {
  size?: Size;
  className?: string;
  asLink?: boolean;
}) {
  const content = (
    <span
      className={[
        "inline-flex items-baseline select-none font-display font-semibold leading-none",
        sizeMap[size],
        className,
      ].join(" ")}
      aria-label="RAIMOND"
    >
      <span className="text-teal-300 drop-shadow-[0_0_10px_rgba(32,242,217,.35)]">
        RAI
      </span>
      <span
        className="text-white/95 -tracking-[0.02em] ml-[-0.03em]"
        // NOTE: the small negative margin plus tighter tracking removes any 'gap' feel
      >
        MOND
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <a href="/" aria-label="Go to home" className="inline-block">
      {content}
    </a>
  );
}

