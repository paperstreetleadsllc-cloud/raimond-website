import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

type LocationState = {
  name?: string;
  email?: string;
} | null;

export default function ThankYouPage() {
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--night-900)] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
      <div className="absolute inset-0 neural-grid-medium opacity-10" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center sm:px-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--cyber-teal)]/15 text-[var(--cyber-teal)] shadow-[0_0_45px_rgba(31,240,218,0.25)]">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">You're on the list.</h1>
        <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
          {state?.name ? `${state.name}, we'll reach out as soon as the next cohort opens.` : "We'll reach out as soon as the next cohort opens."}{" "}
          In the meantime, keep an eye on {state?.email ?? "your inbox"} for early access updates and rollout details.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--cyber-teal)] px-7 py-3 text-base font-semibold text-[var(--deep-navy)] shadow-[0_22px_55px_rgba(31,240,218,0.35)] transition hover:bg-[#59f6e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/60"
          >
            Return to homepage
          </Link>
          <Link
            to="/"
            state={{ scrollTo: "rai-method", navHash: "#rai-method" }}
            className="inline-flex items-center justify-center rounded-full border border-white/22 px-7 py-3 text-base font-semibold text-white/80 transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Review the RAi method
          </Link>
        </div>
      </section>
    </div>
  );
}


