import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "AI search visibility guides",
  description: "Plain-English guides to answer engine optimization and AI search readiness for local businesses.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold">AI search visibility guides</h1>
        <p className="mt-4 text-lg text-slate-700">Plain-English answers about how AI products find, read, and recommend local businesses.</p>
        <ul className="mt-10 space-y-6">
          {GUIDES.map((g) => (
            <li key={g.slug} className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold"><Link href={`/guides/${g.slug}`} className="hover:underline">{g.title}</Link></h2>
              <p className="mt-2 text-slate-700">{g.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
