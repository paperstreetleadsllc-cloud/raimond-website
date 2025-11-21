import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import LogoWord from "../brand/LogoWord";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#030712] text-white">
      <header className="flex items-center justify-between px-6 py-6">
        <Link to="/" className="text-sm text-white/70 transition hover:text-white">
          ← Back to site
        </Link>
        <LogoWord className="scale-110" />
        <span className="text-xs uppercase tracking-[0.3em] text-white/50">Private beta</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-white shadow-[0_40px_120px_rgba(10,45,70,0.35)] backdrop-blur">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1FF0DA]">
              RAImond Console
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to RAImond</h1>
            <p className="mt-4 text-sm text-white/70">
              App access is currently in a private beta. Join the waitlist and we’ll notify you as invitations open.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#1FF0DA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1FF0DA]/40"
                placeholder="you@example.com"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#1FF0DA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1FF0DA]/40"
                placeholder="••••••••"
                disabled
              />
            </div>

            <button
              type="submit"
              disabled
              className="inline-flex w-full items-center justify-center rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-90"
            >
              Coming soon – app access is in private beta
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-sm text-white/55">
            <p>Already on the list? We’ll email you as soon as your invite is ready.</p>
            <p>
              Questions?{" "}
              <a className="text-white underline-offset-4 hover:text-[#1FF0DA]" href="mailto:support@raimond.ai">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
