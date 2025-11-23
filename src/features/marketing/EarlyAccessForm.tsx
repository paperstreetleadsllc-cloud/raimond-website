import React from "react";
import { Loader2 } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  traderType: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const traderTypes = ["Day Trader", "Swing", "Futures", "Options", "Other"] as const;

const defaultState: FormState = {
  name: "",
  email: "",
  traderType: "",
  notes: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EarlyAccessFormSubmit = FormState;

type EarlyAccessFormProps = {
  onSuccess?: (payload: EarlyAccessFormSubmit) => void;
};

export function EarlyAccessForm({ onSuccess }: EarlyAccessFormProps) {
  const [form, setForm] = React.useState<FormState>(defaultState);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const firstFieldRef = React.useRef<HTMLInputElement | null>(null);

  const endpoint = React.useMemo(
    () => import.meta.env.VITE_WAITLIST_ENDPOINT ?? "/api/waitlist",
    []
  );

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

  const validate = React.useCallback(() => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your full name.";
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      nextErrors.email = "Please enter your email.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.traderType) {
      nextErrors.traderType = "Select the trader type that fits you best.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form.email, form.name, form.traderType]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      firstFieldRef.current?.focus();
      return;
    }

    const payload: FormState = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      traderType: form.traderType,
      notes: form.notes.trim()
    };

    setStatus("loading");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: payload.name,
          ...payload,
          source: "website-early-access",
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
            ? data.error
            : "Something went wrong. Please try again.";
        throw new Error(message);
      }

      setForm(defaultState);
      setStatus("idle");
      onSuccess?.(payload);
    } catch (error) {
      console.error("Failed to submit early access form", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <form id="early-access-form" className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="ea-name" className="text-sm font-medium text-white/80">
            Full name
          </label>
          <input
            id="ea-name"
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
          <label htmlFor="ea-email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="ea-email"
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
        <label htmlFor="ea-trader-type" className="text-sm font-medium text-white/80">
          Trader type
        </label>
        <div className="relative">
          <select
            id="ea-trader-type"
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
        <label htmlFor="ea-notes" className="text-sm font-medium text-white/80">
          Notes <span className="text-white/45">(Optional)</span>
        </label>
        <textarea
          id="ea-notes"
          value={form.notes}
          onChange={(event) => handleChange("notes")(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[var(--cyber-teal)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/40"
          placeholder="Share how you plan to use RAImond or what challenges you're solving."
        />
        {errors.notes ? <p className="text-xs text-[#FF7A7A]">{errors.notes}</p> : null}
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#FF7A7A]/35 bg-[#FF7A7A]/10 px-4 py-3 text-sm text-[#FF9A9A]"
        >
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
          "Request Early Access"
        )}
      </button>
    </form>
  );
}






