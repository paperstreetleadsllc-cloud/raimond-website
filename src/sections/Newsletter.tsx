import React, { useState } from "react";

export default function Newsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMsg(data.message || "Thanks — you’re on the list.");
        setName(""); setEmail("");
      } else {
        setStatus("err");
        setMsg(data.error || "Could not subscribe. Please try again.");
      }
    } catch {
      setStatus("err");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <section className="section section-pad text-center">
      <div className="card p-8 md:p-10 max-w-2xl mx-auto">
        <h2 className="text-white font-display text-3xl md:text-4xl tracking-[-0.02em]">
          Join the RAIMOND beta
        </h2>
        <p className="text-slate-300 mt-3">
          Early access, product updates, and an occasional insight on disciplined execution.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
            aria-label="Your name"
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-slate-200 focus:border-teal-400 focus:outline-none"
            aria-label="Your email"
          />
          <button
            type="submit"
            disabled={status==="loading"}
            className="rounded-lg bg-teal-300 text-slate-900 font-semibold px-5 py-2.5 hover:bg-teal-200 transition disabled:opacity-70"
          >
            {status==="loading" ? "Submitting…" : "Request access"}
          </button>
        </form>

        {!!msg && (
          <p className={`mt-3 ${status==="ok" ? "text-teal-300" : "text-red-300"}`}>{msg}</p>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Or email us directly:{" "}
          <a className="underline hover:text-teal-200" href="mailto:support@raimondai.com">
            support@raimondai.com
          </a>
        </p>
      </div>
    </section>
  );
}