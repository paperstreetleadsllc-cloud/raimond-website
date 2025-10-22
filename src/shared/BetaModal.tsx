import React, { useState } from "react";

type Props = { open: boolean; onClose: () => void };

export default function BetaModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setDone(null);
    try {
      const r = await fetch("/api/join-beta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, notes }),
      });
      const j = await r.json();
      setDone(j.ok ? "ok" : "err");
      if (j.ok) { setName(""); setEmail(""); setNotes(""); }
    } catch {
      setDone("err");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[560px] mx-4 rounded-2xl border border-white/10 bg-[#0E1A2C]/90 backdrop-blur hud-card p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-white text-2xl font-semibold tracking-tight">Join the RAimond beta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="mt-2 text-slate-300">
          Tell us where to reach you. We’ll follow up with onboarding details.
          <span className="ml-2 link-accent"><a href="mailto:support@raimondai.com">support@raimondai.com</a></span>
        </p>

        <form onSubmit={submit} className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Name</span>
            <input value={name} onChange={e=>setName(e.target.value)}
              className="rounded-md bg-[#0B1526] border border-white/10 px-3 py-2 text-slate-100 outline-none focus:border-[var(--accent)]"
              placeholder="Jane Doe" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Email *</span>
            <input value={email} onChange={e=>setEmail(e.target.value)} required
              className="rounded-md bg-[#0B1526] border border-white/10 px-3 py-2 text-slate-100 outline-none focus:border-[var(--accent)]"
              type="email" placeholder="jane@domain.com" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Notes (optional)</span>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
              className="rounded-md bg-[#0B1526] border border-white/10 px-3 py-2 text-slate-100 outline-none focus:border-[var(--accent)]"
              placeholder="Platforms, goals, timeline…" />
          </label>

          <div className="flex items-center gap-3">
            <button disabled={submitting}
              className="btn btn-lg"
              style={{ background: "var(--accent)", color: "#051014" }}>
              {submitting ? "Sending…" : "Request Access"}
            </button>
            {done === "ok" && <span className="text-[var(--accent)]">✓ Sent — we’ll be in touch.</span>}
            {done === "err" && <span className="text-rose-400">Something went wrong. Try again.</span>}
          </div>
        </form>
      </div>
    </div>
  );
}