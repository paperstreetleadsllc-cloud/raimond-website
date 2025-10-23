import React from "react";
import LogoWordHeavy from "../brand/LogoWordHeavy"; // fallback to text if missing

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10">
      <div className="section py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {LogoWordHeavy ? <LogoWordHeavy /> : <span className="text-white font-semibold">RAIMOND</span>}
          <span className="text-slate-500 text-sm">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <a className="text-slate-300 hover:text-teal-200" href="/privacy">Privacy</a>
          <a className="text-slate-300 hover:text-teal-200" href="/terms">Terms</a>
          <a className="text-slate-300 hover:text-teal-200" href="mailto:support@raimondai.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}