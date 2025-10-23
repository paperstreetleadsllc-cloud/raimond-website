import React, { useState } from "react";

export default function BetaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, note, hp: "" }), // hp = honeypot
      });
      const data = await res.json();
      setMessage(data.message || "You’re on the list!");
      if (data.ok) { setName(""); setEmail(""); setNote(""); }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-slate-100 backdrop-blur">
        <h2 className="text-3xl font-display mb-3 text-center">Join the RAIMOND Beta</h2>
        <p className="text-slate-400 mb-6 text-sm text-center">Get early access and help shape disciplined trading.</p>

        {message ? (
          <p className="text-teal-300 font-medium text-center">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* honeypot (hidden) */}
            <input type="text" name="hp" autoComplete="off" tabIndex={-1} className="hidden" />

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
              required
            />
            <textarea
              placeholder="Optional: what are you trading, goals, pain points?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-300 to-emerald-400 text-slate-900 font-semibold py-2 rounded-lg hover:from-teal-200 hover:to-emerald-300 transition-all"
            >
              {loading ? "Submitting..." : "Join the Beta"}
            </button>
            <p className="text-xs text-slate-500 text-center">We’ll only use your email to contact you about the beta.</p>
          </form>
        )}

        <button onClick={onClose} className="mt-6 text-sm text-slate-400 hover:text-slate-200 w-full">Close</button>
      </div>
    </div>
  );
}