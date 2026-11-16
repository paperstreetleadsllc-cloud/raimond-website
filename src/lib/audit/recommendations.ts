import type { CheckResult, ReadinessScore, Recommendation } from "./types";

interface Template {
  title: string;
  problem: string;
  /** Used instead of `problem` when the check earned some credit. */
  partialProblem?: string;
  partialImplementation?: string[];
  partialVerification?: string;
  businessImpact: string;
  action: string;
  effort: Recommendation["effort"];
  implementation: string[];
  verification: string;
  /** Multiplier for how directly the issue limits discovery by AI systems. */
  impact: number;
}

const TEMPLATES: Record<string, Template> = {
  https: {
    title: "Move the site to HTTPS",
    problem: "The site does not load over a secure connection.",
    businessImpact: "Browsers warn visitors about insecure sites, and search systems prefer secure pages when choosing sources.",
    action: "Install an SSL certificate and redirect all http:// addresses to https://.",
    effort: "Low",
    implementation: ["Enable the free SSL certificate offered by your host.", "Add a site-wide 301 redirect from http to https.", "Update internal links and the sitemap to https addresses."],
    verification: "Re-run this audit; the homepage should resolve to an https:// address.",
    impact: 1.4,
  },
  response_time: {
    title: "Speed up the homepage response",
    problem: "The homepage HTML was slow to arrive in our test request.",
    businessImpact: "Crawlers work within time budgets, and slow pages are fetched less often and less completely.",
    action: "Reduce server response time with caching or better hosting.",
    effort: "Medium",
    implementation: ["Turn on page caching in your site platform or host.", "Put the site behind a CDN.", "Remove unused plugins that run on every request."],
    verification: "Re-run this audit; the homepage should respond in under 1,500 ms.",
    impact: 0.8,
  },
  robots_txt: {
    title: "Add a robots.txt file",
    problem: "The site has no usable robots.txt file.",
    businessImpact: "robots.txt tells crawlers what they may read and where the sitemap is. Without it, discovery is left to guesswork.",
    action: "Publish a robots.txt that allows crawling and points to the sitemap.",
    effort: "Low",
    implementation: ["Create /robots.txt containing 'User-agent: *' and 'Allow: /'.", "Add a 'Sitemap:' line with the full sitemap address."],
    verification: "Open /robots.txt in a browser, then re-run this audit.",
    impact: 0.9,
  },
  ai_crawlers: {
    title: "Stop blocking AI search crawlers",
    problem: "robots.txt blocks one or more crawlers that AI search products use to read websites.",
    businessImpact: "A blocked crawler cannot read the site, so that AI product cannot retrieve or cite these pages when answering customers.",
    action: "Remove the Disallow rules that apply to AI search crawlers.",
    effort: "Low",
    implementation: ["Open robots.txt and find the groups for the blocked crawlers named in the evidence.", "Remove 'Disallow: /' for the search crawlers you want to appear in.", "Blocking training-only crawlers (GPTBot, ClaudeBot, Google-Extended) is a separate business choice and does not affect search answers."],
    verification: "Re-run this audit; the AI crawler check should list no blocked search crawlers.",
    impact: 2,
  },
  sitemap: {
    title: "Publish an XML sitemap",
    problem: "No XML sitemap was found.",
    businessImpact: "A sitemap is the most reliable way for crawlers to find every service and location page, including ones not linked from the homepage.",
    action: "Generate a sitemap and reference it from robots.txt.",
    effort: "Low",
    implementation: ["Enable the sitemap feature in your site platform or SEO plugin.", "Confirm it is available at /sitemap.xml.", "Add a 'Sitemap:' line to robots.txt."],
    verification: "Open /sitemap.xml in a browser, then re-run this audit.",
    impact: 1.2,
  },
  indexable: {
    title: "Remove noindex from important pages",
    problem: "Some pages tell search engines not to index them.",
    businessImpact: "Pages marked noindex are excluded from search indexes that AI answer products draw on.",
    action: "Remove the noindex directive from pages customers should find.",
    effort: "Low",
    implementation: ["Check the SEO settings for each page listed in the evidence.", "Remove 'noindex' from the robots meta tag unless the page is meant to be private."],
    verification: "Re-run this audit; no analyzed page should carry noindex.",
    impact: 1.8,
  },
  server_rendered: {
    title: "Put the main content in the page HTML",
    problem: "The homepage has very little text until JavaScript runs.",
    businessImpact: "Most AI crawlers read raw HTML and do not run JavaScript, so they see an almost empty page.",
    action: "Render the main content on the server so it is present in the initial HTML.",
    effort: "High",
    implementation: ["Ask your developer to enable server-side rendering or static generation for public pages.", "If the site uses a page builder, make sure key text is not loaded by a script widget.", "Check the result with View Source, not the browser inspector."],
    verification: "Re-run this audit; the homepage HTML should contain at least 150 words.",
    impact: 2,
  },
  canonical: {
    title: "Add canonical tags",
    problem: "Some pages do not declare a canonical URL.",
    businessImpact: "Without canonicals, duplicate addresses for the same page can split signals between them.",
    action: "Add a self-referencing canonical tag to each page.",
    effort: "Low",
    implementation: ["Enable canonical URLs in your SEO plugin or site settings.", "Confirm each page's canonical points to its own preferred address."],
    verification: "Re-run this audit; every analyzed page should have a canonical tag.",
    impact: 0.6,
  },
  schema_present: {
    title: "Add JSON-LD structured data",
    problem: "The site has no valid JSON-LD structured data, or some of it is broken.",
    businessImpact: "Structured data states facts about the business in a form machines read directly instead of inferring from prose.",
    action: "Add valid JSON-LD to the homepage and key pages.",
    effort: "Medium",
    implementation: ["Start with a LocalBusiness block on the homepage.", "Fix any block reported as invalid JSON.", "Validate with the Schema.org validator before publishing."],
    verification: "Re-run this audit; JSON-LD blocks should be found with no parse errors.",
    impact: 1.5,
  },
  schema_business: {
    title: "Describe the business with LocalBusiness schema",
    problem: "No Organization or LocalBusiness schema was found.",
    businessImpact: "This is the single clearest machine-readable statement of who the business is, what it does, and where.",
    action: "Add a LocalBusiness JSON-LD block, using the most specific type available for your trade.",
    effort: "Medium",
    implementation: ["Choose the most specific schema.org type (for example Plumber, RoofingContractor, Dentist).", "Include name, telephone, address, url, opening hours, and areaServed.", "Use exactly the same name, address, and phone shown on the site and on your Google Business Profile."],
    verification: "Re-run this audit; business schema should be detected.",
    impact: 1.8,
  },
  schema_complete: {
    title: "Complete the business schema",
    problem: "The business schema is missing core details.",
    businessImpact: "Missing phone, address, or service-area fields leave gaps that answer engines fill from other sources, or not at all.",
    action: "Add the missing fields listed in the evidence.",
    effort: "Low",
    implementation: ["Edit the existing LocalBusiness block.", "Add each missing property with the exact details shown elsewhere on the site."],
    verification: "Re-run this audit; the schema completeness check should list no missing fields.",
    impact: 1.3,
  },
  schema_rich: {
    title: "Add supporting schema for services, FAQs, and reviews",
    problem: "The site has little or no supporting schema beyond the basics.",
    businessImpact: "Service and FAQ schema tie specific customer questions to specific answers on your site.",
    action: "Add Service schema to service pages and FAQPage schema where real FAQs exist.",
    effort: "Medium",
    implementation: ["Add Service schema to each service page.", "Add FAQPage schema only to pages that visibly show those questions and answers.", "Add BreadcrumbList schema to inner pages."],
    verification: "Re-run this audit; supporting schema types should be listed.",
    impact: 1,
  },
  titles: {
    title: "Write descriptive, unique page titles",
    problem: "Some page titles are missing, duplicated, too short, or too long.",
    businessImpact: "The title is the first thing a search system uses to decide what a page is about.",
    action: "Give every page a unique title naming the service and location.",
    effort: "Low",
    implementation: ["Use the pattern: Service in City | Business Name.", "Keep titles between 15 and 70 characters.", "Make sure no two pages share a title."],
    verification: "Re-run this audit; all analyzed pages should pass the title check.",
    impact: 1.2,
  },
  meta_descriptions: {
    title: "Add meta descriptions",
    problem: "Some pages have no meta description or a very short one.",
    businessImpact: "Descriptions summarize a page for search systems and are often shown to customers as the snippet.",
    action: "Write a one- or two-sentence description for each key page.",
    effort: "Low",
    implementation: ["State what the page offers, where, and one reason to choose you.", "Aim for 120 to 160 characters."],
    verification: "Re-run this audit; each analyzed page should have a description of at least 50 characters.",
    impact: 0.8,
  },
  h1: {
    title: "Use one clear H1 on every page",
    problem: "Some pages have no H1 heading, or more than one.",
    businessImpact: "The H1 states the page's main topic. Missing or competing H1s make the topic ambiguous.",
    action: "Give each page a single H1 that names its topic.",
    effort: "Low",
    implementation: ["Make the main headline the only H1.", "Change other large headings to H2.", "Include the service and location where natural."],
    verification: "Re-run this audit; every analyzed page should have exactly one H1.",
    impact: 0.9,
  },
  service_pages: {
    title: "Create a dedicated page for each service",
    problem: "Services are not covered by their own pages.",
    partialProblem: "Only some services have a dedicated page among the pages we read.",
    businessImpact: "When a customer asks an AI assistant for a specific service, a page devoted to that service is far easier to match and cite than one line in a list.",
    action: "Build one page per core service with real detail.",
    effort: "High",
    implementation: ["List your top revenue services.", "For each, write a page covering what is included, typical timelines, service area, and common questions.", "Link every service page from the main navigation or a services hub."],
    verification: "Re-run this audit; at least three dedicated service pages should be detected.",
    impact: 1.8,
  },
  content_depth: {
    title: "Expand thin pages",
    problem: "Key pages contain very little text.",
    businessImpact: "A page with a few sentences gives an answer engine nothing specific to quote or rely on.",
    action: "Add specific, useful detail to the thin pages listed in the evidence.",
    effort: "Medium",
    implementation: ["Describe the process, materials, pricing factors, and service area in your own words.", "Answer the questions customers actually ask on the phone.", "Aim for at least 300 words of real substance on service pages."],
    verification: "Re-run this audit; median page length should rise above 250 words.",
    impact: 1.4,
  },
  location_content: {
    title: "State your service area in titles and headings",
    problem: "The city or area you serve is missing from most titles and headings.",
    businessImpact: "Local questions name a place. Pages that never state the place are hard to match to them.",
    action: "Add your primary city or service area to key titles and H1 headings.",
    effort: "Low",
    implementation: ["Add the city to the homepage title and H1.", "Add it to each service page title.", "List the towns you serve on a service-area page, without duplicating near-identical pages per town."],
    verification: "Re-run this audit; the location should appear in the title or H1 of at least two pages.",
    impact: 1.5,
  },
  about_contact: {
    title: "Add About and Contact pages",
    problem: "The homepage does not link to both an About page and a Contact page.",
    businessImpact: "These pages establish who is behind the business and how to reach it, which both customers and answer engines look for.",
    action: "Create the missing page and link it from the main navigation.",
    effort: "Low",
    implementation: ["Write an About page covering who owns the business, how long it has operated, and where.", "Add a Contact page with phone, email or form, address, and hours."],
    verification: "Re-run this audit; both pages should be detected from the homepage.",
    impact: 0.9,
  },
  name_consistent: {
    title: "Make the business name consistent",
    problem: "The business name is unclear or missing from most page titles.",
    partialProblem: "Page titles do not use the full business name consistently.",
    businessImpact: "A consistent name across pages and listings lets systems recognize every mention as the same business.",
    action: "Use one exact business name everywhere.",
    effort: "Low",
    implementation: ["Add the name to the end of each page title.", "Set og:site_name to the same name.", "Match the name used on your Google Business Profile exactly."],
    verification: "Re-run this audit; the name should appear in most page titles.",
    impact: 1,
  },
  phone: {
    title: "Show one phone number on every page",
    problem: "The phone number is missing, hard to find, or not clickable.",
    businessImpact: "Customers with urgent needs call. A missing or inconsistent number loses those calls and muddies your business identity.",
    action: "Put one primary phone number in the header and footer as a click-to-call link.",
    effort: "Low",
    implementation: ["Add the number to the site header and footer.", "Wrap it in a tel: link.", "Use the same number on your Google Business Profile and directory listings."],
    verification: "Re-run this audit; the number should appear on most pages with a click-to-call link.",
    impact: 1.3,
  },
  address_area: {
    title: "State your address or service area in structured data",
    problem: "No address or service area is declared in structured data.",
    businessImpact: "Location is how local recommendations are filtered. If it is not stated clearly, you may be left out of local answers.",
    action: "Add address and areaServed to your LocalBusiness schema and show them on the site.",
    effort: "Low",
    implementation: ["Add a PostalAddress to the business schema.", "List the cities or counties you serve under areaServed.", "Show the same details in the footer."],
    verification: "Re-run this audit; the address check should read from structured data.",
    impact: 1.4,
  },
  contact_method: {
    title: "Add a contact form or email link",
    problem: "We found no contact form and no email link.",
    businessImpact: "Visitors who are not ready to call have no way to become a lead.",
    action: "Add a short contact or quote-request form.",
    effort: "Low",
    implementation: ["Add a form asking for name, phone or email, and what they need.", "Place it on the Contact page and on each service page."],
    verification: "Re-run this audit; a contact form or email link should be detected.",
    impact: 1,
  },
  reviews: {
    title: "Show real customer reviews on the site",
    problem: "No review or testimonial content was detected.",
    partialProblem: "Reviews are shown on the site, but there is no rating data in structured data for machines to read.",
    businessImpact: "Reviews are a primary signal of quality when a system decides which business to recommend.",
    action: "Display genuine customer reviews and ask recent customers for more.",
    effort: "Medium",
    implementation: ["Add a reviews section with real, attributable customer feedback.", "Link to your Google Business Profile reviews.", "Set up a simple routine for asking each completed job for a review. Never write or buy reviews."],
    verification: "Re-run this audit; review content should be detected.",
    partialImplementation: ["Mark up the reviews already shown on the page with Review schema, matching the visible text exactly.", "Only include an aggregate rating if the page shows the same rating and count to visitors.", "Link to your Google Business Profile reviews. Never write or buy reviews."],
    partialVerification: "Re-run this audit; review or rating data should be detected in structured data.",
    impact: 1.4,
  },
  credentials: {
    title: "State your licenses, insurance, and guarantees",
    problem: "The site does not mention licensing, insurance, certification, or guarantees.",
    businessImpact: "These are the facts customers ask about before hiring, and the facts answer engines look for when vouching for a business.",
    action: "State the credentials you actually hold, with license numbers where applicable.",
    effort: "Low",
    implementation: ["Add license numbers and insurance status to the footer and About page.", "List manufacturer certifications and warranties you offer.", "Only state credentials that are current and true."],
    verification: "Re-run this audit; credential terms should be detected.",
    impact: 1.1,
  },
  profiles: {
    title: "Link to your business profiles",
    problem: "The site links to few or no external profiles.",
    businessImpact: "Links to your profiles help systems connect your website to your reviews and listings elsewhere.",
    action: "Link to your Google Business Profile and active social or directory profiles.",
    effort: "Low",
    implementation: ["Add profile links to the footer.", "List the same addresses under sameAs in your business schema."],
    verification: "Re-run this audit; at least two profile links should be detected.",
    impact: 0.8,
  },
  tenure: {
    title: "Tell customers how long you have been in business",
    problem: "The site says nothing about years in business or ownership.",
    businessImpact: "Experience is a common deciding factor and an easy fact for answer engines to repeat.",
    action: "Add a factual statement about your history.",
    effort: "Low",
    implementation: ["Add the founding year and ownership to the About page and homepage.", "Keep it factual; do not round up."],
    verification: "Re-run this audit; an experience statement should be detected.",
    impact: 0.7,
  },
  privacy: {
    title: "Link a privacy policy",
    problem: "No privacy policy link was found.",
    businessImpact: "A privacy policy is a baseline trust signal and is legally required in many places when you collect contact details.",
    action: "Publish a privacy policy and link it in the footer.",
    effort: "Low",
    implementation: ["Write or generate a policy that reflects what you actually collect.", "Link it from the footer of every page."],
    verification: "Re-run this audit; a privacy link should be detected.",
    impact: 0.5,
  },
  question_headings: {
    title: "Answer customer questions directly on the page",
    problem: "Few or no headings are phrased as the questions customers ask.",
    businessImpact: "AI assistants answer questions. Content written as a question followed by a direct answer is the easiest to match and quote.",
    action: "Add a short FAQ section to each service page.",
    effort: "Medium",
    implementation: ["Write down the questions customers ask on calls.", "Use each question as a heading and answer it in two to four sentences.", "Start each answer with the answer itself, then add detail."],
    verification: "Re-run this audit; at least five question-style headings should be found.",
    impact: 1.6,
  },
  faq_schema: {
    title: "Mark up FAQs with FAQPage schema",
    problem: "FAQ content is not marked up with FAQPage schema.",
    businessImpact: "Schema makes each question-and-answer pair unambiguous to machines.",
    action: "Add FAQPage JSON-LD to pages that show FAQs.",
    effort: "Low",
    implementation: ["Add FAQPage schema matching the visible questions and answers word for word.", "Validate before publishing."],
    verification: "Re-run this audit; FAQPage schema should be detected.",
    impact: 0.9,
  },
  scannable: {
    title: "Use lists and tables for key facts",
    problem: "Most pages present information only as paragraphs.",
    businessImpact: "Lists and tables make facts such as services, prices, and service areas easy to extract accurately.",
    action: "Convert suitable content into lists or tables.",
    effort: "Low",
    implementation: ["List the services included on each service page.", "Use a table for pricing tiers or comparisons where you have them."],
    verification: "Re-run this audit; more pages should use lists or tables.",
    impact: 0.6,
  },
  heading_hierarchy: {
    title: "Structure pages with H2 sections",
    problem: "Many pages lack a clear heading structure.",
    businessImpact: "Headings divide a page into topics that can be understood and quoted independently.",
    action: "Break each page into sections with descriptive H2 headings.",
    effort: "Low",
    implementation: ["Add at least two H2 sections under each page's H1.", "Make each heading describe the section's content."],
    verification: "Re-run this audit; most pages should have an H1 with at least two H2s.",
    impact: 0.7,
  },
};

function toRecommendation(check: CheckResult): Recommendation | null {
  const template = TEMPLATES[check.id];
  if (!template || check.status === "pass") return null;
  const lost = check.max - check.earned;
  const partial = check.earned > 0;
  const weight = lost * template.impact;
  return {
    id: `rec_${check.id}`,
    checkId: check.id,
    title: template.title,
    problem: partial && template.partialProblem ? template.partialProblem : template.problem,
    evidence: check.evidence,
    businessImpact: template.businessImpact,
    action: template.action,
    effort: template.effort,
    priority: (check.id === "server_rendered" && check.earned === 0) || weight >= 4 ? "High" : weight >= 1.8 ? "Medium" : "Low",
    implementation: partial && template.partialImplementation ? template.partialImplementation : template.implementation,
    verification: partial && template.partialVerification ? template.partialVerification : template.verification,
    pointsAvailable: Math.round(lost * 10) / 10,
  };
}

/** Recommendations are derived only from failed or partial checks, ordered by weighted impact. */
export function buildRecommendations(readiness: ReadinessScore): Recommendation[] {
  return readiness.checks
    .map((check) => ({ check, rec: toRecommendation(check) }))
    .filter((x): x is { check: CheckResult; rec: Recommendation } => x.rec !== null)
    .sort((a, b) => {
      // An empty HTML page causes most other findings, so it always leads.
      const emptyA = a.check.id === "server_rendered" && a.check.earned === 0;
      const emptyB = b.check.id === "server_rendered" && b.check.earned === 0;
      if (emptyA !== emptyB) return emptyA ? -1 : 1;
      const wa = (a.check.max - a.check.earned) * TEMPLATES[a.check.id].impact;
      const wb = (b.check.max - b.check.earned) * TEMPLATES[b.check.id].impact;
      return wb - wa;
    })
    .map((x) => x.rec);
}
