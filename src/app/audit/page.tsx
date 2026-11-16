import type { Metadata } from "next";
import { AuditForm } from "@/components/AuditForm";

export const metadata: Metadata = {
  title: "Free AI visibility audit",
  description: "Enter your business website and get a free AI Readiness Score with evidence and three priority recommendations.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Free AI visibility snapshot</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Check your website&apos;s AI readiness</h1>
        <p className="mb-8 mt-4 text-lg leading-relaxed">
          We read up to 10 public pages of your site, score how ready it is for AI-powered search, and show you the three most valuable things to fix.
        </p>
        <div className="card p-6 sm:p-8">
          <AuditForm />
        </div>
        <ul className="mt-8 space-y-2 text-[15px] text-slate-600">
          <li>We only read public pages and follow your robots.txt rules.</li>
          <li>Every point in the score comes with the evidence behind it.</li>
          <li>We never estimate what AI platforms say about you. What isn&apos;t measured is labeled that way.</li>
        </ul>
      </div>
    </div>
  );
}
