import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import { AskAiMock } from "@/components/home/AskAiMock";
import { SampleReport } from "@/components/home/SampleReport";
import { ThenNow } from "@/components/home/ThenNow";
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

const REASONS = [
  {
    title: "It can't get in",
    body: "Many websites block AI systems by accident, or only show their text after a script runs. To the AI, the page looks empty.",
  },
  {
    title: "It can't tell what you do",
    body: "Your services, your service area, your hours and your phone number need to be stated plainly. If the AI has to guess, it moves on to a business it doesn't have to guess about.",
  },
  {
    title: "It can't find an answer to quote",
    body: "Customers ask questions: how much, how soon, do you cover my town. Websites that answer those questions are the ones that get used in the reply.",
  },
];

const BENEFITS = [
  {
    title: "A chance to be one of the names",
    body: "A business the AI can't read is never considered. Fixing that puts you in the running every time someone nearby asks for what you do.",
  },
  {
    title: "Customers who are ready to hire",
    body: "Someone asking \"who can fix a leaking water heater today\" isn't browsing. They are about to pick up the phone.",
  },
  {
    title: "Your details, told correctly",
    body: "When your services, area and phone number are clear, AI repeats them accurately instead of leaving them out or getting them wrong.",
  },
  {
    title: "A to-do list, not a lecture",
    body: "You get the three fixes that matter most, in plain English, with how to check each one. Hand it to whoever looks after your website.",
  },
];

const STEPS = [
  { title: "Type in your website address", body: "No account and no credit card. We only read pages that are already public, and we never change anything." },
  { title: "We read your site the way AI does", body: "It takes about a minute. We check whether AI can get in, and whether it can tell who you are, what you do and where you work." },
  { title: "You get a score and three things to fix first", body: "Every point in the score shows what we found on your site, so you can see the reason for yourself." },
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
  const freePlan = PLANS.find((p) => p.available);
  const paidPlans = PLANS.filter((p) => !p.available);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="border-b border-line">
        <div className="container-page grid gap-14 pb-16 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div>
            <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.1rem]">
              When a customer asks AI who to call, does it say your name?
            </h1>
            <p className="lede">
              People now ask ChatGPT and Google&apos;s AI for a plumber, a roofer or a dentist, and it answers with a few names. Our free check shows whether AI can read and understand your website, and what to fix first.
            </p>
            <div className="mt-8 max-w-xl">
              <AuditForm />
            </div>
          </div>
          <AskAiMock />
        </div>
      </section>

      {/* Why it matters */}
      <section id="why" className="section scroll-mt-20">
        <div className="container-page">
          <h2 className="section-title">Customers used to get a list. Now they get an answer.</h2>
          <p className="lede">
            For twenty years, being found meant showing up in a list of search results. AI assistants don&apos;t hand over a list. They read websites, make up their mind, and name a few businesses. If yours isn&apos;t one of them, the customer never knows you were an option.
          </p>
          <div className="mt-10">
            <ThenNow />
          </div>

          <h3 className="mt-16 text-2xl sm:text-[1.75rem]">Three reasons AI leaves a good business out</h3>
          <p className="mt-3 max-w-2xl text-lg">None of them have anything to do with how good your work is.</p>
          <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {REASONS.map((r) => (
              <div key={r.title} className="border-t-4 border-signal pt-5">
                <dt className="text-xl font-bold text-ink">{r.title}</dt>
                <dd className="mt-2">{r.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it helps the business */}
      <section id="grow" className="section scroll-mt-20 bg-paper-deep">
        <div className="container-page">
          <h2 className="section-title">What that means for your business</h2>
          <p className="lede">
            RAimondAI finds what is keeping AI from reading and understanding your website, and tells you how to fix it. Here is what you get out of that.
          </p>
          <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.title} className="border-t-4 border-teal-deep pt-5">
                <dt className="text-xl font-bold text-ink sm:text-2xl">{b.title}</dt>
                <dd className="mt-2 max-w-md text-lg">{b.body}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-14 rounded-3xl bg-white p-6 sm:p-8 lg:flex lg:items-center lg:gap-10">
            <p className="text-xl font-bold leading-snug text-ink lg:w-1/3">What we won&apos;t tell you</p>
            <p className="mt-3 text-lg lg:mt-0 lg:w-2/3">
              That we can guarantee an AI will recommend you. Nobody can, and anyone who says so is guessing. We show you what we found on your website, what to change, and how to check that the change worked.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section scroll-mt-20">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="section-title">Three steps, about a minute</h2>
            <ol className="mt-10 space-y-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl">{step.title}</h3>
                    <p className="mt-1.5 text-lg">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/audit" className="btn-primary mt-10 !px-8 !py-4 !text-lg">Check my business for free</Link>
          </div>
          <SampleReport />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section scroll-mt-20 border-y border-line bg-paper-deep">
        <div className="container-page">
          <h2 className="section-title">Start with the free check</h2>
          <p className="lede">Most owners should start here. Paid plans are opening soon, for when you want us to keep watch or prepare the fixes for you.</p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {freePlan ? (
              <div className="flex flex-col rounded-3xl bg-ink p-7 text-white sm:p-9">
                <h3 className="text-2xl !text-white">{freePlan.name}</h3>
                <p className="mt-3 font-display text-6xl font-bold leading-none" style={{ fontStretch: "112%" }}>Free</p>
                <p className="mt-4 text-lg text-white/80">{freePlan.summary}</p>
                <ul className="mt-6 flex-1 space-y-3 text-[17px]">
                  {freePlan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="mt-0.5 shrink-0">
                        <path d="M4.5 11.5l4 4 9-9.5" fill="none" stroke="#1FF0DA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/audit" className="mt-8 inline-flex items-center justify-center rounded-full bg-teal-brand px-8 py-4 text-lg font-bold text-ink transition hover:bg-[#6ff6e9]">
                  Check my business for free
                </Link>
              </div>
            ) : null}

            <div className="rounded-3xl border border-line bg-white p-7 sm:p-9">
              <h3 className="text-2xl">When you want more help</h3>
              <ul className="mt-4 divide-y divide-line">
                {paidPlans.map((plan) => (
                  <li key={plan.key} className="grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-lg font-bold text-ink">{plan.name}</p>
                      <p className="text-body">{plan.summary}</p>
                      <p className="mt-1 text-[15px] text-muted">{plan.features.slice(0, 3).join(", ")}.</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xl font-bold text-ink">
                        {plan.price} <span className="text-[15px] font-medium text-muted">{plan.cadence}</span>
                      </p>
                      <p className="text-[15px] font-medium text-muted">Opening soon</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section scroll-mt-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="section-title">Questions owners ask us</h2>
            <p className="lede">
              Want the longer version? Our <Link href="/guides" className="font-semibold text-ink underline decoration-teal-brand decoration-2 underline-offset-4">plain-English guides</Link> explain how AI search works for a local business.
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-xl" style={{ fontStretch: "100%" }}>{f.q}</h3>
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-2xl leading-none text-ink transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-lg">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink">
        <div className="container-page py-16 sm:py-24">
          <h2 className="max-w-3xl text-[2rem] leading-[1.08] !text-white sm:text-[2.75rem]">Find out what AI sees when it looks at your business</h2>
          <div className="mt-8 max-w-xl">
            <AuditForm dark />
          </div>
        </div>
      </section>
    </>
  );
}
