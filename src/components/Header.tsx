import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night-700/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label="RAimondAI home">
          <Logo light />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-6">
          <Link href="/#how-it-works" className="hidden text-sm text-slate-300 hover:text-white sm:block">
            How it works
          </Link>
          <Link href="/#pricing" className="hidden text-sm text-slate-300 hover:text-white sm:block">
            Pricing
          </Link>
          <Link href="/#faq" className="hidden text-sm text-slate-300 hover:text-white sm:block">
            FAQ
          </Link>
          <Link href="/audit" className="btn-primary !py-2">
            Check my AI visibility
          </Link>
        </nav>
      </div>
    </header>
  );
}
