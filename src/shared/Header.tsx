import LogoRAIMOND from "../brand/LogoRAIMOND";
import React from "react";
import useStickyHeader from "../hooks/useStickyHeader";

function Wordmark() {
  return (
    <div className="flex items-baseline gap-2 select-none">
      <span className="font-display tracking-[-0.06em] text-[18px] md:text-[20px] leading-none text-teal-300">
        RAI
      </span>
      <span className="font-display tracking-[-0.02em] text-[18px] md:text-[20px] leading-none text-white/95">
        MOND
      </span>
    </div>
  );
}

export default function Header() {
  const scrolled = useStickyHeader();

  return (
    <header
      className={`site-header fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass on" : "glass"
      }`}
    >
      <div className="inner flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Wordmark />
        </a>

        <nav className="hidden md:flex items-center gap-6 text-[13px] text-slate-300">
          <a className="hover:text-white/90" href="/#whatwedo">What We Do</a>
          <a className="hover:text-white/90" href="/#product">Product</a>
          <a className="hover:text-white/90" href="/journal">Journal</a>
          <a
            className="ml-2 px-3 py-1.5 rounded-md bg-teal-300 text-slate-900 font-semibold hover:bg-teal-200"
            href="mailto:support@raimondai.com?subject=Get%20Started%20with%20RAIMOND"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}