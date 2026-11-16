import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#why", label: "Why it matters" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "Questions" },
  { href: "/guides", label: "Guides" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-page flex h-[70px] items-center justify-between gap-4">
        <Link href="/" aria-label="RAimondAI home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] font-medium text-body hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-[15px] font-medium text-body hover:text-ink sm:block">
            Log in
          </Link>
          <Link href="/audit" className="btn-primary !px-5 !py-2.5">
            Free check
          </Link>
          {/* Small screens: a plain menu that works without JavaScript. */}
          <details className="group relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-white" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="group-open:hidden">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="#0F2E2D" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="hidden group-open:block">
                <path d="M5 5l10 10M15 5L5 15" stroke="#0F2E2D" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </summary>
            <nav aria-label="Mobile" className="absolute right-0 mt-3 w-64 rounded-2xl border border-line bg-white p-2 shadow-card">
              {[...LINKS, { href: "/login", label: "Log in" }].map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-paper">
                  {l.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
