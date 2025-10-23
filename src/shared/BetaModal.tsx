import React, { useState } from "react";

export default function BetaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setMessage(data.message || "You’re on the list!");
      setName("");
      setEmail("");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center text-slate-100 backdrop-blur">
        <h2 className="text-3xl font-display mb-3">Join the RAImond Beta</h2>
        <p className="text-slate-400 mb-6 text-sm">Get early access and help shape the future of disciplined trading.</p>
        {message ? (
          <p className="text-teal-300 font-medium">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-300 to-emerald-400 text-slate-900 font-semibold py-2 rounded-lg hover:from-teal-200 hover:to-emerald-300 transition-all"
            >
              {loading ? "Submitting..." : "Join the Beta"}
            </button>
          </form>
        )}
        <button
          onClick={onClose}
          className="mt-6 text-sm text-slate-400 hover:text-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}