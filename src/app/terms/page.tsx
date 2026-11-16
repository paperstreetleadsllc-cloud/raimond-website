import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <Prose title="Terms of use" updated="November 15, 2026">
      <p>By using this website and the free audit, you agree to these terms.</p>
      <h2>The service</h2>
      <p>RAimondAI analyzes publicly available website content and reports on how ready a site is for AI-powered search. Reports are informational. They are based on a limited sample of pages at a point in time.</p>
      <h2>No guarantees</h2>
      <p>We do not guarantee rankings, mentions in AI products, traffic, leads, or revenue. Scores reflect our scoring model, which is a set of reasonable assumptions and not a validated predictor of how any AI system behaves.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Submit only public website addresses.</li>
        <li>Do not use the service to attack, overload, or probe systems.</li>
        <li>Do not automate requests to the free audit.</li>
      </ul>
      <h2>Liability</h2>
      <p>The service is provided as is. To the extent permitted by law, RAimondAI is not liable for decisions made on the basis of a report.</p>
      <h2>Contact</h2>
      <p>Questions: <a className="underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
    </Prose>
  );
}
