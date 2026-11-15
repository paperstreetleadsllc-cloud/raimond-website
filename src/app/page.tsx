import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import { PLANS } from "@/lib/plans";
import { SITE } from "@/lib/site";

const FAQS = [
  {
    q: "What is AI search visibility?",
    a: "It is whether AI-powered tools such as ChatGPT, Google AI Overviews, Perplexity, and Microsoft Copilot can find your business and mention it when someone asks for the services you offer. More customers now ask an AI assistant for a recommendation instead of scrolling a list of links.",
  },
  {
    q: "What does the free audit check?",
    a: "It reads up to 10 public pages of your website and checks things we can verify directly: whether AI crawlers are allowed in, whether your content is readable without JavaScript, your structured data, how clearly your services, location, and contact details are stated, and how your content is organized. Every point in the score links to the evidence behind it.",
  },
  {
    q: "Does the score tell me whether ChatGPT recommends my business?",
    a: "No, and we won't pretend it does. The AI Readiness Score measures your website. Whether an AI product actually mentions you has to be observed by asking it real customer questions and recording the answers. Until that measurement is connected for a platform, your report shows it as \"Not currently measured\" rather than an estimate.",
  },
  {
    q: "How is this different from traditional SEO?",
    a: "Traditional SEO aims to rank a page in a list of links. AI answer engines read pages, pull out facts, and write a single answer that names a few businesses. That rewards sites that state clearly who they are, what they do, where they work, and that answer customer questions directly.",
  },
  {
    q: "Do you guarantee rankings or leads?",
    a: "No. Nobody can guarantee what an AI system will say. We show you what we measured, what we recommend, and how to verify each change.",
  },
  {
    q: "Will the audit affect my website?",
    a: "No. Our crawler makes a small number of ordinary page requests, follows your robots.txt rules, never logs in, and never changes anything.",
  },
];

const STEPS = [
  { title: "Enter your website", body: "No account or credit card. We only read pages that are already public." },
  { title: "We read your site the way a crawler does", body: "Robots rules, sitemap, page HTML, structured data, and how your services and location are described." },
  { title: "You get a score with the evidence", body: "A 0 to 100 AI Readiness Score across six categories. Every point is traceable to something we found." },
  { title: "You get a short list of what to fix first", body: "Three priority recommendations, each with the problem, why it matters, how to fix it, and how to verify it." },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, url: SITE.url, email: SITE.contactEmail, description: SITE.description },
      { "@type": "WebSite", "@id": `${SITE.url}/#site`, url: SITE.url, name: SITE.name, publisher: { "@id": `${SITE.url}/#org` } },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="bg-night-700 text-white">
        <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-brand">AI search visibility for local businesses</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] !text-white sm:text-5xl lg:text-6xl">
              Is AI recommending your competitors instead of you?
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Discover how your business appears in AI-powered search, identify missed opportunities, and get a clear plan to improve your visibility.
            </p>
            <div className="mt-8 max-w-xl">
              <AuditForm dark />
            </div>
            <p className="mt-6">
              <Link href="#how-it-works" className="text-sm font-medium text-teal-brand underline-offset-4 hover:underline">
                See how it works
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-night-600 p-6 sm:p-8">
            <h2 className="text-lg font-semibold !text-white">Your report answers five questions</h2>
            <ol className="mt-5 space-y-4 text-sm text-slate-300">
              {[
                ["Can AI search systems read your website?", "Measured in the free audit"],
                ["Does your business appear when customers ask for your services?", "Measured per platform as each is connected"],
                ["Which competitors appear instead?", "Reported from the same observations"],
                ["What would improve your visibility?", "Prioritized in the free audit"],
                ["Is that visibility producing customers?", "Tracked when you connect your lead sources"],
              ].map(([q, note], i) => (
                <li key={q} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-brand/15 text-xs font-semibold text-teal-brand">{i + 1}</span>
                  <span>
                    <span className="block font-medium text-white">{q}</span>
                    <span className="text-slate-400">{note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="container-page py-16 sm:py-20">
        <p className="eyebrow">Why this matters</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">Customers are asking AI who to hire</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">
          When someone asks an AI assistant for a plumber, a roofer, or a dentist nearby, it does not show ten links. It reads websites and names a few businesses. If it cannot read your site, or cannot tell what you do and where, you are not on the list.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["AI has to be able to get in", "Many sites block AI crawlers by accident or hide their content behind JavaScript that crawlers never run."],
            ["AI has to understand the business", "Who you are, what you offer, and where you work should be stated plainly and in structured data, not left to be guessed."],
            ["AI has to find the answer", "Assistants answer questions. Pages that ask and answer the questions customers really have are the ones that get quoted."],
          ].map(([title, body]) => (
            <div key={title} className="card p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-slate-50">
        <div className="container-page py-16 sm:py-20">
          <p className="eyebrow">How the audit works</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">From web address to action plan</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card p-6">
                <span className="font-display text-sm font-semibold text-teal-ink">Step {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you receive */}
      <section className="container-page py-16 sm:py-20">
        <p className="eyebrow">What you receive</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">Two measurements, kept separate on purpose</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-7">
            <span className="pill bg-emerald-50 text-emerald-800">Included in the free audit</span>
            <h3 className="mt-4 text-xl font-semibold">AI Readiness Score</h3>
            <p className="mt-2 leading-relaxed">A 0 to 100 score built from things we can inspect on your website. It tells you how easy your site is for an AI system to read, understand, and trust.</p>
            <ul className="mt-5 grid gap-2 text-[15px] sm:grid-cols-2">
              {["Technical accessibility", "Structured data quality", "Content relevance and completeness", "Business identity consistency", "Trust and credibility signals", "AI-friendly content structure"].map((c) => (
                <li key={c} className="flex gap-2"><span aria-hidden="true" className="text-teal-deep">●</span>{c}</li>
              ))}
            </ul>
          </div>
          <div className="card p-7">
            <span className="pill bg-slate-100 text-slate-700">Shown only when actually measured</span>
            <h3 className="mt-4 text-xl font-semibold">Observed AI Visibility</h3>
            <p className="mt-2 leading-relaxed">What AI search products actually say when asked real customer questions: whether you are mentioned, recommended, or cited, and which competitors appear instead.</p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              These are sampled observations, not rankings, and answers vary from one request to the next. A platform we have not measured is labeled <strong className="text-ink">Not currently measured</strong>. We never fill the gap with an estimate.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="card p-7">
            <h3 className="text-xl font-semibold">Competitor analysis</h3>
            <p className="mt-2 leading-relaxed">When visibility is measured, the same recorded answers show which businesses were named for each question. Competitors are reported from what was observed, with the question and date, not from guesswork.</p>
          </div>
          <div className="card p-7">
            <h3 className="text-xl font-semibold">Ongoing optimization</h3>
            <p className="mt-2 leading-relaxed">A one-time audit is a snapshot. Subscriptions add scheduled re-checks, new recommendations, prepared content and technical fixes for your approval, and a running record of what changed.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-y border-slate-200 bg-slate-50">
        <div className="container-page py-16 sm:py-20">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Start free. Upgrade when it is worth it.</h2>
          <p className="mt-4 max-w-2xl text-lg">Paid plans are opening soon. Run the free audit now and you will be first to hear when they launch.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PLANS.map((plan) => (
              <div key={plan.key} className={`card flex flex-col p-6 ${plan.available ? "ring-2 ring-teal-deep" : ""}`}>
                <h3 className="text-base font-semibold">{plan.name}</h3>
                <p className="mt-3 font-display text-3xl font-semibold text-ink">
                  {plan.price}
                  {plan.cadence ? <span className="ml-1 text-sm font-normal text-slate-500">{plan.cadence}</span> : null}
                </p>
                <p className="mt-2 text-sm text-slate-600">{plan.summary}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2"><span aria-hidden="true" className="text-teal-deep">✓</span>{f}</li>
                  ))}
                </ul>
                {plan.available ? (
                  <Link href="/audit" className="btn-primary mt-6">Run free audit</Link>
                ) : (
                  <span className="mt-6 inline-flex justify-center rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500">Opening soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page scroll-mt-20 py-16 sm:py-20">
        <p className="eyebrow">Frequently asked questions</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Straight answers</h2>
        <div className="mt-8 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink">
                <h3 className="text-lg font-semibold">{f.q}</h3>
                <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-night-700">
        <div className="container-page py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold !text-white sm:text-4xl">See what AI can and cannot read on your website</h2>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <AuditForm dark />
          </div>
        </div>
      </section>
    </>
  );
}
