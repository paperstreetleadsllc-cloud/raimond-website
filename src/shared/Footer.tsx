import React from "react";
import LogoRAIMOND from "../brand/LogoRAIMOND";
export default function Footer(){
  return (
    <footer className="mt-20 bg-[rgba(5,10,20,.7)] border-t border-white/10">
      <div className="hr-glow" />
      <div className="container py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <LogoRAIMOND />
        <div className="text-slate-300 text-sm flex items-center gap-4">
          <a className="link-accent" href="/privacy">Privacy</a>
          <span className="text-slate-500">·</span>
          <a className="link-accent" href="/terms">Terms</a>
          <span className="text-slate-500">·</span>
          <span className="text-slate-500">© {new Date().getFullYear()} RAimond</span>
        </div>
      </div>
    </footer>
  );
}