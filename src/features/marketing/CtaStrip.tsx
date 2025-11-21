import type { MouseEventHandler } from "react";

interface CtaStripProps {
  onPrimaryAction?: MouseEventHandler<HTMLButtonElement>;
  onSecondaryAction?: MouseEventHandler<HTMLButtonElement>;
}

export function CtaStrip({ onPrimaryAction, onSecondaryAction }: CtaStripProps) {
  return (
    <section id="cta" className="relative overflow-hidden bg-[var(--night-900)] section-padding-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(31,240,218,0.16),_transparent_70%)] opacity-60" />
      <div className="relative mx-auto w-full max-w-5xl rounded-[36px] border border-white/12 bg-[var(--night-700-soft)] p-12 text-center text-white shadow-[0_35px_90px_rgba(5,10,22,0.6)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Ready to trade with an always-on co-pilot?</h2>
          <p className="text-base text-white/70 sm:text-lg">
            Get early access to RAimond and let RAi keep your discipline sharp, your execution fast, and your edge evolving.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--cyber-teal)] px-8 py-3 text-base font-semibold text-[var(--deep-navy)] shadow-[0_20px_55px_rgba(31,240,218,0.35)] transition hover:bg-[#59f6e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/60"
            >
              Get Early Access
            </button>
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Talk to us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
