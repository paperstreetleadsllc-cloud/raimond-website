import React from "react";
import LogoRAIMOND from "../brand/LogoRAIMOND";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/70">
      <div className="section section-pad py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoRAIMOND size="sm" />
            <span className="text-slate-400 text-sm">© {new Date().getFullYear()} RAIMOND</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <a href="/privacy" className="text-slate-400 hover:text-teal-300 transition">Privacy</a>
            <a href="/terms" className="text-slate-400 hover:text-teal-300 transition">Terms</a>
            <a href="mailto:support@raimondai.com" className="text-slate-400 hover:text-teal-300 transition">Contact</a>
            <a
              href="https://x.com/RAimond_Ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-300 transition"
            >
              X (Twitter)
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

