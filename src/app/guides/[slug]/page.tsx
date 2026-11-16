import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = guideBySlug((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.description, url: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();

  const url = `${SITE.url}/guides/${guide.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        dateModified: guide.updated,
        datePublished: guide.updated,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.sections.map((s) => ({
          "@type": "Question",
          name: s.question,
          acceptedAnswer: { "@type": "Answer", text: [...s.answer, ...(s.list ?? [])].join(" ") },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE.url}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };
  const updated = new Date(`${guide.updated}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <div className="container-page py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-3xl leading-relaxed">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href="/" className="hover:text-ink">Home</Link> / <Link href="/guides" className="hover:text-ink">Guides</Link>
        </nav>
        <h1 className="mt-4 text-4xl font-semibold">{guide.title}</h1>
        <p className="mt-2 text-sm text-slate-500">By {SITE.name}. Last updated {updated}.</p>
        <p className="mt-6 text-lg text-slate-700">{guide.intro}</p>

        {guide.sections.map((s) => (
          <section key={s.question} className="mt-10">
            <h2 className="text-2xl font-semibold">{s.question}</h2>
            {s.answer.map((p) => (
              <p key={p} className="mt-3 text-slate-700">{p}</p>
            ))}
            {s.list && (
              <ul className="ml-5 mt-3 list-disc space-y-1 text-slate-700">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <aside className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold">See what AI crawlers can read on your site</h2>
          <p className="mt-2 text-slate-700">The free audit reads up to ten public pages and shows the evidence behind every point of your score. No account needed.</p>
          <Link href="/audit" className="btn-primary mt-4 inline-block">Check my AI visibility</Link>
        </aside>

        <div className="mt-10 text-sm">
          <h2 className="font-semibold">More guides</h2>
          <ul className="mt-2 space-y-1">
            {GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
              <li key={g.slug}><Link href={`/guides/${g.slug}`} className="underline">{g.title}</Link></li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}
