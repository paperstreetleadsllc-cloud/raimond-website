import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/** A short plain-text summary of the site for language models (the llms.txt convention). */
export function GET() {
  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} audits a business website and reports an AI Readiness Score out of 100, with the evidence behind each point. The score measures the website only. Whether AI products mention a business is reported separately and only when it has been observed.`,
    "",
    "## Main pages",
    `- [Free AI readiness audit](${SITE.url}/audit): audit a website without an account`,
    `- [About the crawler](${SITE.url}/bot): what RAimondAIBot does and how to block it`,
    "",
    "## Guides",
    ...GUIDES.map((g) => `- [${g.title}](${SITE.url}/guides/${g.slug}): ${g.description}`),
    "",
    "## Contact",
    `- ${SITE.contactEmail}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
