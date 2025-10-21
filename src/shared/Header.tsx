import { useState } from "react";
import { Menu } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="section py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-r from-amber-400 to-amber-600 grid place-items-center font-bold text-brand-night">RAi</div>
          <div className="text-white font-semibold">RAimond</div>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a className="link" href="#what">What We Do</a>
          <a className="link" href="#product">Product</a>
          <a className="link" href="#careers">Careers</a>
          <a className="link" href="#journal">Journal</a>
          <a className="btn-primary" href="#contact">Get Started</a>
        </nav>

        <button aria-label="Open Menu" className="md:hidden p-2 glass rounded-md" onClick={() => setOpen(v => !v)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden section pb-4">
          <div className="glass rounded-lg p-4 flex flex-col gap-3">
            <a onClick={() => setOpen(false)} href="#what">What We Do</a>
            <a onClick={() => setOpen(false)} href="#product">Product</a>
            <a onClick={() => setOpen(false)} href="#careers">Careers</a>
            <a onClick={() => setOpen(false)} href="#journal">Journal</a>
            <a onClick={() => setOpen(false)} className="btn-primary text-center" href="#contact">Get Started</a>
          </div>
        </div>
      )}
    </header>
  );
}