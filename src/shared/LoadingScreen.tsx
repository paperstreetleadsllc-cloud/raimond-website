import React from "react";
import LogoMark from "../brand/LogoMark";

export default function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(31,240,218,0.18),_transparent_65%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--cyber-teal)]/22 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-[#4a90e2]/18 blur-[160px]" />

      <div className="relative flex flex-col items-center gap-10 px-6">
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="flex items-end gap-4">
            <LogoMark className="h-16 w-16 drop-shadow-[0_0_35px_rgba(31,240,218,0.55)]" />
            <div className="flex items-end font-display text-[2.6rem] font-semibold leading-none tracking-[-0.065em] sm:text-[3rem]">
              <span className="text-[var(--cyber-teal)]">RA</span>
              <span className="relative inline-flex px-[0.08em] text-[var(--cyber-teal)] before:absolute before:left-0 before:top-[-0.3rem] before:h-[0.18rem] before:w-full before:rounded-full before:bg-[var(--cyber-teal)] after:absolute after:bottom-[-0.3rem] after:left-0 after:h-[0.18rem] after:w-full after:rounded-full after:bg-[var(--cyber-teal)]">
                I
              </span>
              <span className="ml-[-0.08em] lowercase text-white/92">mond</span>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/55">
            Calibrating RAi protocols
          </p>
        </div>

        <div className="relative flex h-2 w-48 overflow-hidden rounded-full bg-white/10 shadow-[0_0_30px_rgba(31,240,218,0.25)]">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[var(--cyber-teal)]/80 to-transparent" />
          <div className="absolute inset-0 animate-[loader-shimmer_2s_linear_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        <p className="text-sm text-white/60">
          Preparing your disciplined co-pilot<span className="text-[var(--cyber-teal)]">…</span>
        </p>
      </div>
    </div>
  );
}

