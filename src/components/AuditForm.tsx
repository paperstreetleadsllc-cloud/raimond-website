"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export function AuditForm({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const inputId = useId();
  const [url, setUrl] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
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
      <label htmlFor={inputId} className={`mb-2 block text-sm font-medium ${dark ? "text-slate-200" : "text-ink"}`}>
        Your business website
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
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
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink placeholder:text-slate-400"
        />
        {/* Honeypot: hidden from people and assistive technology. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Company website
            <input tabIndex={-1} autoComplete="off" name="company_website" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>
        <button type="submit" disabled={busy || !url.trim()} className="btn-primary whitespace-nowrap !text-base">
          {busy ? "Starting…" : "Check my AI visibility"}
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className={`mt-3 text-sm ${dark ? "text-rose-300" : "text-rose-700"}`}>
          {error}
        </p>
      ) : (
        <p className={`mt-3 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Free. No account needed. Usually takes under a minute.
        </p>
      )}
    </form>
  );
}
