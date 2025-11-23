import React from "react";
import { useNavigate } from "react-router-dom";
import { EarlyAccessForm, type EarlyAccessFormSubmit } from "../features/marketing/EarlyAccessForm";
import { NeuralBackground } from "../features/marketing/NeuralBackground";

export default function SignupPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSuccess = React.useCallback(
    (payload: EarlyAccessFormSubmit) => {
      navigate("/thank-you", {
        state: {
          name: payload.name,
          email: payload.email
        }
      });
    },
    [navigate]
  );

  return (
    <div className="relative min-h-screen bg-[var(--night-900)] text-white">
      <section className="relative overflow-hidden section-padding-lg">
        <NeuralBackground intensity="subtle" />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-36 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-[var(--cyber-teal)]/12 blur-[160px]" />
          <div className="absolute -bottom-48 right-1/3 h-[420px] w-[420px] rounded-full bg-[#4a90e2]/14 blur-[160px]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-[32px] border border-white/12 bg-white/[0.04] px-6 py-10 shadow-[0_35px_90px_rgba(5,10,22,0.65)] backdrop-blur-md sm:px-10 sm:py-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.32em] text-white/60">
              Early Access
            </div>
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
              Request Early Access to RAImond
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Tell us a little about how you trade so we can onboard you smoothly when the next wave
              of invites opens.
            </p>
          </div>

          <EarlyAccessForm onSuccess={handleSuccess} />
        </div>
      </section>
    </div>
  );
}






