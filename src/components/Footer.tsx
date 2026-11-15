import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-slate-500">{SITE.tagline}.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/audit" className="hover:text-ink">Free audit</Link>
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/bot" className="hover:text-ink">Our crawler</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <a href={`mailto:${SITE.contactEmail}`} className="hover:text-ink">Contact</a>
        </nav>
      </div>
      <div className="container-page pb-8 text-xs text-slate-400">
        © {new Date().getFullYear()} RAimondAI. Scores describe website readiness and are not a guarantee of rankings or leads.
      </div>
    </footer>
  );
}
