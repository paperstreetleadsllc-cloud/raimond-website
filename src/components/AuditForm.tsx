"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export function AuditForm({ dark = false, buttonLabel = "Check my business" }: { dark?: boolean; buttonLabel?: string }) {
  const router = useRouter();
  const inputId = useId();
  const [url, setUrl] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!url.trim()) {
      setError("Type your website address first, for example yourbusiness.com.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, company_website: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.push(`/audit/${data.id}`);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor={inputId} className={`mb-2 block text-[15px] font-semibold ${dark ? "text-white" : "text-ink"}`}>
        Your business website
      </label>
      <div className={`flex flex-col gap-2 rounded-[22px] border p-2 sm:flex-row ${dark ? "border-white/20 bg-white/10" : "border-line bg-white shadow-card"}`}>
        <input
          id={inputId}
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="yourbusiness.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-2xl border border-transparent bg-white px-4 py-3.5 text-lg text-ink placeholder:text-slate-400 focus:border-teal-ink"
        />
        {/* Honeypot: hidden from people and assistive technology. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Company website
            <input tabIndex={-1} autoComplete="off" name="company_website" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>
        <button type="submit" disabled={busy} className={`btn-primary whitespace-nowrap !rounded-2xl !px-7 !py-3.5 !text-base ${dark ? "!bg-teal-brand !text-ink hover:!bg-[#6ff6e9]" : ""}`}>
          {busy ? "Starting…" : buttonLabel}
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className={`mt-3 text-sm ${dark ? "text-rose-300" : "text-rose-700"}`}>
          {error}
        </p>
      ) : (
        <p className={`mt-3 text-sm ${dark ? "text-slate-300" : "text-muted"}`}>
          Free. No account or credit card. Usually takes under a minute.
        </p>
      )}
    </form>
  );
}
