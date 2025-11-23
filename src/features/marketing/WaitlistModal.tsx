import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, X } from "lucide-react";

type WaitlistModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  email: string;
  traderType: string;
  goal: string;
  consent: boolean;
};

type FormErrors = Partial<Record<"name" | "email" | "traderType" | "goal" | "consent", string>>;

const defaultFormState: FormState = {
  name: "",
  email: "",
  traderType: "",
  goal: "",
  consent: false
};

const traderTypes = ["Scalper", "Day trader", "Swing", "Prop firm", "Other"];

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const previousOverflow = useRef<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        onClose();
      }
    }

    if (open) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => firstFieldRef.current?.focus(), 75);
    } else {
      document.body.style.overflow = previousOverflow.current || "";
      setErrors({});
      setErrorMessage(null);
      if (status !== "success") {
        setForm(defaultFormState);
        setStatus("idle");
      }
    }

    return () => {
      document.body.style.overflow = previousOverflow.current || "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, status]);

  const endpoint = useMemo(
    () => import.meta.env.VITE_WAITLIST_ENDPOINT ?? "/api/waitlist",
    []
  );

  if (!open) {
    return null;
  }

  const handleRequestClose = () => {
    if (status === "success") {
      setStatus("idle");
    }
    onClose();
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleRequestClose();
    }
  };

  const handleChange =
    <Key extends keyof FormState>(key: Key) =>
    (value: FormState[Key]) => {
      setForm((prev) => ({
        ...prev,
        [key]: value
      }));
      setErrors((prev) => ({
        ...prev,
        [key]: undefined
      }));
    };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.traderType) {
      nextErrors.traderType = "Select the trader type that fits you best.";
    }

    if (!form.consent) {
      nextErrors.consent = "You must agree to receive email updates.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // This form POSTs to the waitlist endpoint (defaults to /api/waitlist). Before we introduced that handler,
  // production builds returned 404 from Vercel and surfaced the generic “Something went wrong” banner.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        traderType: form.traderType,
        goal: form.goal.trim()
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: payload.name,
          email: payload.email,
          traderType: payload.traderType,
          goal: payload.goal,
          source: "website-landing-modal",
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.message ?? "Something went wrong. Please try again.";
        throw new Error(message);
      }

      setForm(defaultFormState);
      onClose();
      navigate("/thank-you", {
        state: {
          name: payload.name,
          email: payload.email
        }
      });
      setStatus("idle");
    } catch (error) {
      console.error("Failed to submit waitlist form", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[var(--night-850)]/95 text-white shadow-[0_35px_90px_rgba(5,10,22,0.75)]">
        <button
          type="button"
          onClick={handleRequestClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Close waitlist form"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6 px-8 pb-10 pt-9 sm:px-12 sm:pt-12">
          <div className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">Early Access</p>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              Get Early Access to RAImond
            </h2>
            <p className="text-sm text-white/70 sm:text-base">
              Join the early access list and be the first to try the RAi trading co-pilot.
            </p>
          </div>

          {status === "success" ? (
            <div className="rounded-2xl border border-[var(--cyber-teal)]/35 bg-[var(--cyber-teal)]/10 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cyber-teal)]/15 text-[var(--cyber-teal)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">You’re in.</h3>
              <p className="mt-3 text-sm text-white/75">
                Check your email for next steps soon. We’ll reach out when invites roll out.
              </p>
              <button
                type="button"
                onClick={handleRequestClose}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Close
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="waitlist-name" className="text-sm font-medium text-white/80">
                    Full name
                  </label>
                  <input
                    id="waitlist-name"
                    ref={firstFieldRef}
                    type="text"
                    value={form.name}
                    onChange={(event) => handleChange("name")(event.target.value)}
                    className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[var(--cyber-teal)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/40"
                    placeholder="Jordan Reyes"
                    autoComplete="name"
                  />
                  {errors.name ? <p className="text-xs text-[#FF7A7A]">{errors.name}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="waitlist-email" className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange("email")(event.target.value)}
                    className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[var(--cyber-teal)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/40"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email ? <p className="text-xs text-[#FF7A7A]">{errors.email}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="waitlist-trader-type" className="text-sm font-medium text-white/80">
                  Trader type
                </label>
                <div className="relative">
                  <select
                    id="waitlist-trader-type"
                    value={form.traderType}
                    onChange={(event) => handleChange("traderType")(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-[var(--cyber-teal)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/40"
                  >
                    <option value="" disabled>
                      Select trader type
                    </option>
                    {traderTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/40">
                    ▾
                  </div>
                </div>
                {errors.traderType ? (
                  <p className="text-xs text-[#FF7A7A]">{errors.traderType}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="waitlist-goal" className="text-sm font-medium text-white/80">
                  What do you want RAImond to help you with most? <span className="text-white/45">(Optional)</span>
                </label>
                <textarea
                  id="waitlist-goal"
                  value={form.goal}
                  onChange={(event) => handleChange("goal")(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[var(--cyber-teal)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/40"
                  placeholder="E.g. stay disciplined on my playbook, automate risk management..."
                />
                {errors.goal ? <p className="text-xs text-[#FF7A7A]">{errors.goal}</p> : null}
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => handleChange("consent")(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/25 bg-white/5 text-[var(--cyber-teal)] focus:ring-[var(--cyber-teal)]"
                    required
                  />
                  <span>I agree to receive email updates about RAImond.</span>
                </label>
                {errors.consent ? <p className="text-xs text-[#FF7A7A]">{errors.consent}</p> : null}
              </div>

              {status === "error" && errorMessage ? (
                <div className="rounded-2xl border border-[#FF7A7A]/35 bg-[#FF7A7A]/10 px-4 py-3 text-sm text-[#FF9A9A]">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--cyber-teal)] px-8 py-3 text-base font-semibold text-[var(--deep-navy)] shadow-[0_22px_55px_rgba(31,240,218,0.4)] transition hover:bg-[#59f6e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/60 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Join the waitlist"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


