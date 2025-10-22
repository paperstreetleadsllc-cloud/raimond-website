import React from "react";
import { NavLink } from "react-router-dom";
import LogoWord from "../brand/LogoWord";

const linkBase =
  "relative px-3 py-2 text-sm text-slate-300 hover:text-white transition";
const activeUnderline =
  "after:absolute after:left-3 after:right-3 after:-bottom-[2px] after:h-[2px] after:bg-[var(--accent)] after:rounded after:shadow-[0_0_12px_rgba(25,224,200,.6)]";

export default function Header(){
  const items = [
    { to: "/", label: "What We Do" },
    { to: "/#features", label: "Product" },
    { to: "/journal", label: "Journal" },
  ];

  return (
    <header className="sticky top-0 z-40">
      <div className="backdrop-blur-md bg-[rgba(5,10,20,.55)] border-b border-white/10">
        <nav className="container h-14 flex items-center justify-between">
          <LogoWord />
          <div className="flex items-center gap-1">
            {items.map(it => (
              <NavLink
                key={it.label}
                to={it.to}
                className={({isActive}) =>
                  `${linkBase} ${isActive ? activeUnderline : ""}`
                }
              >
                {it.label}
              </NavLink>
            ))}
            <a
              href="mailto:support@raimondai.com?subject=Get%20Started"
              className="ml-2 btn btn-accent btn-lg h-9 px-4"
            >
              Get Started
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}