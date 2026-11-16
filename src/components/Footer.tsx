import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[15px] text-muted">
            Helping local businesses get found, understood, and recommended by AI search.
          </p>
          <a href={`mailto:${SITE.contactEmail}`} className="mt-4 inline-block text-[15px] font-semibold text-ink underline decoration-teal-brand decoration-2 underline-offset-4">
            {SITE.contactEmail}
          </a>
        </div>
        <nav aria-label="Product" className="flex flex-col gap-3 text-[15px]">
          <p className="font-semibold text-ink">Product</p>
          <Link href="/audit" className="text-muted hover:text-ink">Free AI check</Link>
          <Link href="/#how-it-works" className="text-muted hover:text-ink">How it works</Link>
          <Link href="/#pricing" className="text-muted hover:text-ink">Pricing</Link>
          <Link href="/guides" className="text-muted hover:text-ink">Guides</Link>
        </nav>
        <nav aria-label="Company" className="flex flex-col gap-3 text-[15px]">
          <p className="font-semibold text-ink">Company</p>
          <Link href="/bot" className="text-muted hover:text-ink">Our crawler</Link>
          <Link href="/privacy" className="text-muted hover:text-ink">Privacy</Link>
          <Link href="/terms" className="text-muted hover:text-ink">Terms</Link>
          <Link href="/login" className="text-muted hover:text-ink">Log in</Link>
        </nav>
      </div>
      <div className="container-page border-t border-line py-6 text-sm text-muted">
        © {new Date().getFullYear()} RAimondAI. Scores describe how ready a website is for AI search. They are not a guarantee of rankings or leads.
      </div>
    </footer>
  );
}
