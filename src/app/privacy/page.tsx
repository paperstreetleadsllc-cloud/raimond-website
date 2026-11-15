import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <Prose title="Privacy policy" updated="November 15, 2026">
      <p>This policy explains what RAimondAI collects when you use this website and the free audit, and what we do with it.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>The website address you submit.</strong> We fetch public pages from that site and store the audit results.</li>
        <li><strong>Your email address,</strong> only if you ask for the full report.</li>
        <li><strong>A one-way hash of your IP address,</strong> used to limit abuse of the free audit. We do not store the IP address itself.</li>
        <li><strong>Standard server logs,</strong> kept by our hosting provider.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To run the audit and show you the results.</li>
        <li>To contact you about the report you asked for.</li>
        <li>To prevent abuse and keep the service reliable.</li>
      </ul>
      <p>We do not sell personal information.</p>
      <h2>Service providers</h2>
      <p>We use Vercel for hosting and Supabase for data storage. They process data on our behalf.</p>
      <h2>Audit results</h2>
      <p>Each audit has a private link that is hard to guess. Anyone with the link can view it, so share it only with people you want to see it. Audits describe publicly available website content.</p>
      <h2>Your choices</h2>
      <p>To have an audit or your email address deleted, write to <a className="underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
      <h2>Website owners</h2>
      <p>If you do not want our crawler to read your site, see <a className="underline" href="/bot">how to block it</a>.</p>
    </Prose>
  );
}
