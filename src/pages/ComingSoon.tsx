import React from "react";

export default function ComingSoon() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--night-900)] px-6 py-24 text-center text-white">
      <div className="max-w-2xl space-y-6">
        <p className="text-xs uppercase tracking-[0.36em] text-white/40">Private Beta</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          The RAImond Trading OS is in private development
        </h1>
        <p className="text-base text-white/70 sm:text-lg">
          Right now, RAimondai.com is focused on sharing the vision and collecting early access signups for serious
          traders. The live console will roll out to beta partners first before opening up more broadly.
        </p>
        <p className="text-sm text-white/55">
          Join the early access waitlist on the home page and we’ll let you know as soon as trading access expands.
        </p>
      </div>
    </div>
  );
}


