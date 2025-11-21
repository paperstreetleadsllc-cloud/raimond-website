import React from "react";
import LogoMark from "./LogoMark";

type LogoWordProps = {
  className?: string;
};

export default function LogoWord({ className = "" }: LogoWordProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} aria-label="RAImond">
      <LogoMark className="h-8 w-8 flex-shrink-0 drop-shadow-[0_0_14px_rgba(31,240,218,0.45)]" />
      <span className="inline-flex items-baseline font-display text-[1.35rem] font-semibold tracking-[-0.045em] text-white">
        <span className="uppercase leading-none tracking-[-0.06em] text-white">RAI</span>
        <span className="ml-[-0.04em] lowercase font-medium leading-none text-white">mond</span>
      </span>
    </div>
  );
}
