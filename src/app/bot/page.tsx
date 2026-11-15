import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About RAimondAIBot",
  description: "What the RAimondAI audit crawler does and how to control it.",
  alternates: { canonical: "/bot" },
};

export default function BotPage() {
  return (
    <Prose title="About RAimondAIBot" updated="November 15, 2026">
      <p>RAimondAIBot is the crawler behind the RAimondAI website audit. It visits a site only when someone requests an audit of that site.</p>
      <h2>What it does</h2>
      <ul>
        <li>Requests robots.txt first and follows its rules.</li>
        <li>Reads the sitemap and a small number of public HTML pages (10 for a free audit).</li>
        <li>Makes at most three requests at a time and finishes within about a minute.</li>
        <li>Does not log in, submit forms, run page scripts, or bypass access controls.</li>
      </ul>
      <h2>How to block it</h2>
      <p>Add this to your robots.txt file:</p>
      <pre className="overflow-x-auto rounded-xl bg-slate-100 p-4 text-sm text-ink"><code>{"User-agent: RAimondAIBot\nDisallow: /"}</code></pre>
      <h2>Contact</h2>
      <p>Questions or concerns: <a className="underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
    </Prose>
  );
}
