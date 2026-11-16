import { businessSchemaItems } from "./business";
import { AI_CRAWLERS } from "./robots";
import type {
  BusinessProfile,
  CategoryKey,
  CategoryScore,
  CheckResult,
  CrawlResult,
  PageData,
  ReadinessScore,
} from "./types";


const LOCATION_PATH = /\/(service-areas?|areas?-we-serve|areas?|locations?|cities|where-we-serve)(\/|$)/i;

const NAME_FILLER = new Set([
  "llc", "inc", "incorporated", "co", "corp", "corporation", "company", "ltd", "pllc", "pc", "the", "and", "of",
  "services", "service", "solutions", "group", "plumbing", "plumbers", "roofing", "roofers", "hvac", "heating",
  "cooling", "air", "conditioning", "electric", "electrical", "electricians", "landscaping", "lawn", "care",
  "construction", "contracting", "contractors", "remodeling", "painting", "cleaning", "restoration", "flooring",
  "dental", "dentistry", "law", "firm", "auto", "repair", "pest", "control",
]);

/** The distinctive part of a business name, lower-cased; empty if nothing distinctive remains. */
export function coreBusinessName(name: string): string {
  const words = name.toLowerCase().replace(/[^a-z0-9&' -]/g, " ").split(/\s+/).filter(Boolean);
  const core = words.filter((w) => !NAME_FILLER.has(w));
  const joined = core.join(" ");
  return joined.length >= 4 ? joined : "";
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * Scoring configuration. Category weights are the product's initial
 * assumptions, not validated predictors of AI ranking, so they are data:
 * pass a different config to rescore without touching the checks.
 */
export interface ScoringConfig {
  categories: Record<CategoryKey, { label: string; max: number }>;
  /** Relative weight of each check inside its category. */
  checks: Record<string, number>;
}

export const DEFAULT_SCORING: ScoringConfig = {
  categories: {
    technical: { label: "Technical accessibility", max: 20 },
    structuredData: { label: "Structured data quality", max: 15 },
    content: { label: "Content relevance and completeness", max: 25 },
    identity: { label: "Business identity consistency", max: 15 },
    trust: { label: "Trust and credibility signals", max: 15 },
    aiStructure: { label: "AI-friendly content structure", max: 10 },
  },
  checks: {
    https: 3,
    response_time: 2,
    robots_txt: 2,
    ai_crawlers: 4,
    sitemap: 3,
    indexable: 2,
    server_rendered: 3,
    canonical: 1,
    schema_present: 4,
    schema_business: 4,
    schema_complete: 4,
    schema_rich: 3,
    titles: 4,
    meta_descriptions: 3,
    h1: 3,
    service_pages: 5,
    content_depth: 4,
    location_content: 3,
    about_contact: 3,
    name_consistent: 4,
    phone: 4,
    address_area: 4,
    contact_method: 3,
    reviews: 4,
    credentials: 3,
    profiles: 3,
    tenure: 3,
    privacy: 2,
    question_headings: 4,
    faq_schema: 2,
    scannable: 2,
    heading_hierarchy: 2,
  },
};

interface RawCheck {
  id: string;
  category: CategoryKey;
  label: string;
  ratio: number;
  evidence: string[];
}

const pct = (n: number, d: number) => (d === 0 ? 0 : n / d);
const short = (url: string) => {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "homepage" : u.pathname;
  } catch {
    return url;
  }
};
const listPages = (pages: PageData[], max = 4) => {
  const names = pages.slice(0, max).map((p) => short(p.url));
  return names.join(", ") + (pages.length > max ? ` and ${pages.length - max} more` : "");
};
const fmtPhone = (d: string) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;

function runChecks(crawl: CrawlResult, business: BusinessProfile): RawCheck[] {
  const pages = crawl.pages;
  const home = pages[0];
  const n = pages.length;
  const out: RawCheck[] = [];
  const add = (id: string, category: CategoryKey, label: string, ratio: number, evidence: string[]) =>
    out.push({ id, category, label, ratio: Math.max(0, Math.min(1, ratio)), evidence });

  // ---- Technical accessibility ------------------------------------------
  const isHttps = crawl.finalUrl.startsWith("https://");
  add("https", "technical", "Site loads over HTTPS", isHttps ? 1 : 0, [
    isHttps ? `Homepage resolved to ${crawl.finalUrl}` : `Homepage resolved to an insecure address: ${crawl.finalUrl}`,
  ]);

  const ms = home.elapsedMs;
  add("response_time", "technical", "Homepage responds quickly", ms <= 1500 ? 1 : ms <= 3000 ? 0.5 : 0, [
    `Our request for the homepage HTML completed in ${ms} ms (target: under 1,500 ms). This is one sample from our server, not a full speed test.`,
  ]);

  add(
    "robots_txt",
    "technical",
    "robots.txt is present",
    crawl.robots.status === "found" ? 1 : 0,
    [crawl.robots.status === "found" ? "robots.txt was found and parsed." : `No usable robots.txt at ${crawl.origin}/robots.txt (HTTP ${crawl.robots.httpStatus ?? "no response"}).`],
  );

  const searchAgents = AI_CRAWLERS.filter((c) => c.search).map((c) => c.agent);
  const searchAccess = crawl.robots.aiCrawlers.filter((c) => searchAgents.includes(c.agent));
  const blocked = searchAccess.filter((c) => !c.allowed);
  add("ai_crawlers", "technical", "AI search crawlers are allowed", pct(searchAccess.length - blocked.length, searchAccess.length), [
    blocked.length === 0
      ? `robots.txt does not block any of the ${searchAccess.length} AI search crawlers we check (${searchAgents.join(", ")}).`
      : `robots.txt blocks: ${blocked.map((b) => `${b.agent} (${b.purpose})`).join("; ")}.`,
  ]);

  add("sitemap", "technical", "XML sitemap is available", crawl.sitemap.found ? 1 : 0, [
    crawl.sitemap.found
      ? `Sitemap found at ${crawl.sitemap.url} listing ${crawl.sitemap.urlCount} URLs in the files we read.`
      : `No sitemap declared in robots.txt and none found at ${crawl.origin}/sitemap.xml.`,
  ]);

  const noindexPages = pages.filter((p) => p.noindex);
  add("indexable", "technical", "Key pages are indexable", pct(n - noindexPages.length, n), [
    noindexPages.length === 0
      ? `None of the ${n} pages analyzed carry a noindex directive.`
      : `noindex found on: ${listPages(noindexPages)}.`,
  ]);

  add("server_rendered", "technical", "Content is present in the page HTML", home.wordCount >= 150 ? 1 : home.wordCount >= 60 ? 0.5 : 0, [
    `The homepage HTML contains ${home.wordCount} words before any JavaScript runs. Most AI crawlers do not run JavaScript, so text that only appears after scripts load is invisible to them.`,
  ]);

  const withCanonical = pages.filter((p) => p.canonical);
  add("canonical", "technical", "Pages declare a canonical URL", pct(withCanonical.length, n), [
    `${withCanonical.length} of ${n} pages analyzed have a canonical tag.`,
  ]);

  // ---- Structured data ---------------------------------------------------
  const blocks = pages.reduce((s, p) => s + p.schemaBlocks, 0);
  const parseErrors = pages.reduce((s, p) => s + p.schemaParseErrors, 0);
  const pagesWithSchema = pages.filter((p) => p.schema.length > 0);
  add(
    "schema_present",
    "structuredData",
    "Valid JSON-LD structured data",
    blocks === 0 ? 0 : parseErrors > 0 ? 0.5 : pagesWithSchema.length >= Math.ceil(n / 2) ? 1 : 0.7,
    [
      blocks === 0
        ? `No JSON-LD structured data found on the ${n} pages analyzed.`
        : `${blocks} JSON-LD block(s) across ${pagesWithSchema.length} of ${n} pages${parseErrors ? `; ${parseErrors} could not be parsed (invalid JSON)` : ", all valid JSON"}.`,
    ],
  );

  const biz = businessSchemaItems(pages);
  const best = [...biz].sort(
    (a, b) =>
      [b.name, b.telephone, b.locality || b.streetAddress, b.url].filter(Boolean).length -
      [a.name, a.telephone, a.locality || a.streetAddress, a.url].filter(Boolean).length,
  )[0];
  add("schema_business", "structuredData", "Business described with LocalBusiness or Organization schema", biz.length ? 1 : 0, [
    biz.length
      ? `Found business schema of type ${[...new Set(biz.flatMap((b) => b.types))].slice(0, 4).join(", ")}.`
      : "No Organization or LocalBusiness schema found, so machines have no structured statement of who this business is.",
  ]);

  const fields: [string, boolean][] = best
    ? [
        ["name", Boolean(best.name)],
        ["telephone", Boolean(best.telephone)],
        ["address", Boolean(best.locality || best.streetAddress)],
        ["url", Boolean(best.url)],
        ["hours or area served", best.hasOpeningHours || best.areaServed.length > 0],
      ]
    : [];
  const present = fields.filter(([, ok]) => ok).map(([k]) => k);
  const missing = fields.filter(([, ok]) => !ok).map(([k]) => k);
  add("schema_complete", "structuredData", "Business schema includes core details", best ? pct(present.length, fields.length) : 0, [
    best
      ? `Business schema includes: ${present.join(", ") || "nothing"}.${missing.length ? ` Missing: ${missing.join(", ")}.` : ""}`
      : "Not applicable until business schema exists.",
  ]);

  const allTypes = new Set(pages.flatMap((p) => p.schema.flatMap((s) => s.types)));
  const rich = ["FAQPage", "Service", "Review", "AggregateRating", "BreadcrumbList", "Product", "Offer"].filter((t) => allTypes.has(t));
  const hasRating = biz.some((b) => b.hasAggregateRating || b.hasReview);
  if (hasRating && !rich.includes("AggregateRating")) rich.push("ratings on the business entity");
  add("schema_rich", "structuredData", "Supporting schema (FAQ, services, reviews, breadcrumbs)", Math.min(1, rich.length / 2), [
    rich.length ? `Supporting schema found: ${rich.join(", ")}.` : "No FAQPage, Service, Review, or BreadcrumbList schema found.",
  ]);

  // ---- Content relevance and completeness -------------------------------
  const goodTitles = pages.filter((p) => p.title.length >= 15 && p.title.length <= 70);
  const noTitle = pages.filter((p) => !p.title);
  const uniqueTitles = new Set(pages.map((p) => p.title.toLowerCase()).filter(Boolean)).size;
  add("titles", "content", "Descriptive, unique page titles", pct(goodTitles.length, n) * (uniqueTitles >= pages.length - noTitle.length ? 1 : 0.7), [
    `${goodTitles.length} of ${n} pages have a title between 15 and 70 characters; ${uniqueTitles} distinct titles across ${n} pages.`,
    ...(noTitle.length ? [`Missing title on: ${listPages(noTitle)}.`] : []),
  ]);

  const goodMeta = pages.filter((p) => p.metaDescription.length >= 50);
  add("meta_descriptions", "content", "Meta descriptions on key pages", pct(goodMeta.length, n), [
    `${goodMeta.length} of ${n} pages have a meta description of at least 50 characters.`,
    ...(goodMeta.length < n ? [`Missing or too short on: ${listPages(pages.filter((p) => p.metaDescription.length < 50))}.`] : []),
  ]);

  const oneH1 = pages.filter((p) => p.h1.length === 1);
  add("h1", "content", "One clear H1 heading per page", pct(oneH1.length, n), [
    `${oneH1.length} of ${n} pages have exactly one H1.`,
    ...(oneH1.length < n
      ? [`${pages.filter((p) => p.h1.length === 0).length} page(s) have no H1 and ${pages.filter((p) => p.h1.length > 1).length} have more than one.`]
      : []),
  ]);

  const servicePagesFound = pages.slice(1).filter((p) => {
    // A city or service-area page is about a place, not a single service.
    if (LOCATION_PATH.test(new URL(p.url).pathname)) return false;
    const hay = `${p.url} ${p.title} ${p.h1.join(" ")}`.toLowerCase().replace(/[-_/]/g, " ");
    return business.services.some((s) => hay.includes(s.name)) || /\b(repair|installation|replacement|maintenance)\b/.test(hay);
  });
  const serviceHub = pages.slice(1).some((p) => /\/(services?|what-we-do)(\/|$)/i.test(new URL(p.url).pathname));
  add(
    "service_pages",
    "content",
    "Dedicated pages for individual services",
    servicePagesFound.length >= 3 ? 1 : servicePagesFound.length >= 1 ? 0.6 : serviceHub ? 0.3 : 0,
    [
      servicePagesFound.length
        ? `${plural(servicePagesFound.length, "dedicated service page")} among the ${plural(n, "page")} analyzed: ${listPages(servicePagesFound)}.`
        : serviceHub
          ? "A general services page exists, but we found no pages dedicated to a single service among the pages analyzed."
          : `No dedicated service pages found among the ${plural(n, "page")} analyzed.`,
    ],
  );

  const words = pages.map((p) => p.wordCount).sort((a, b) => a - b);
  const median = words[Math.floor(words.length / 2)] ?? 0;
  const thin = pages.filter((p) => p.wordCount < 150);
  add("content_depth", "content", "Pages have substantive content", median >= 400 ? 1 : median >= 250 ? 0.7 : median >= 120 ? 0.4 : 0, [
    `Median page length is ${median} words across ${n} pages.`,
    ...(thin.length ? [`Thin pages (under 150 words): ${listPages(thin)}.`] : []),
  ]);

  const primaryCity = business.locations?.value[0]?.split(",")[0]?.toLowerCase() ?? "";
  const cityInTitleOrH1 = primaryCity
    ? pages.filter((p) => `${p.title} ${p.h1.join(" ")}`.toLowerCase().includes(primaryCity)).length
    : 0;
  add("location_content", "content", "Service location stated in titles and headings", !primaryCity ? 0 : cityInTitleOrH1 >= 2 ? 1 : cityInTitleOrH1 === 1 ? 0.6 : 0.3, [
    primaryCity
      ? `"${business.locations?.value[0]}" appears in the title or H1 of ${cityInTitleOrH1} of ${n} pages.`
      : "We could not determine a service location from the site's content or structured data.",
  ]);

  const linkPaths = home.internalLinks.map((l) => `${l.href} ${l.text}`.toLowerCase());
  const hasAbout = linkPaths.some((l) => /\babout|our story|who we are|our team\b/.test(l));
  const hasContact = linkPaths.some((l) => /\bcontact|get in touch\b/.test(l));
  add("about_contact", "content", "About and Contact pages", (Number(hasAbout) + Number(hasContact)) / 2, [
    `Homepage links to an About page: ${hasAbout ? "yes" : "no"}. Contact page: ${hasContact ? "yes" : "no"}.`,
  ]);

  // ---- Business identity consistency ------------------------------------
  const name = business.name?.value ?? "";
  const nameInTitles = name ? pages.filter((p) => p.title.toLowerCase().includes(name.toLowerCase())).length : 0;
  // Sites often shorten the name in titles ("Flow Pros" for "Flow Pros Plumbing").
  const shortName = coreBusinessName(name);
  const shortInTitles =
    shortName && shortName !== name.toLowerCase() ? pages.filter((p) => p.title.toLowerCase().includes(shortName)).length : 0;
  const nameRatio = !name
    ? 0
    : pct(nameInTitles, n) >= 0.5
      ? 1
      : pct(shortInTitles, n) >= 0.5
        ? 0.8
        : nameInTitles > 0 || shortInTitles > 0
          ? 0.6
          : 0.4;
  add("name_consistent", "identity", "Business name is clear and consistent", nameRatio, [
    name
      ? `Business name "${name}" identified from ${business.name?.source}; the full name appears in ${nameInTitles} of ${plural(n, "page title")}.` +
        (shortInTitles > nameInTitles ? ` A shorter form, "${shortName}", appears in ${shortInTitles}.` : "")
      : "We could not identify a business name from structured data, the og:site_name tag, or the homepage title.",
  ]);

  const phoneTally = new Map<string, number>();
  for (const p of pages) for (const ph of p.phones) phoneTally.set(ph, (phoneTally.get(ph) ?? 0) + 1);
  const phonesRanked = [...phoneTally.entries()].sort((a, b) => b[1] - a[1]);
  const pagesWithPhone = pages.filter((p) => p.phones.length > 0).length;
  const anyTel = pages.some((p) => p.hasTelLink);
  add(
    "phone",
    "identity",
    "Phone number is visible and consistent",
    phonesRanked.length === 0 ? 0 : (pct(pagesWithPhone, n) >= 0.6 ? 0.7 : 0.4) + (anyTel ? 0.3 : 0),
    [
      phonesRanked.length === 0
        ? "No phone number found in the text or links of the pages analyzed."
        : `Most frequent number ${fmtPhone(phonesRanked[0][0])} appears on ${phonesRanked[0][1]} of ${n} pages; ${phonesRanked.length} distinct number(s) found. Click-to-call link: ${anyTel ? "yes" : "no"}.`,
    ],
  );

  const schemaAddress = biz.find((b) => b.locality || b.streetAddress);
  add("address_area", "identity", "Address or service area is stated", schemaAddress ? 1 : business.locations ? 0.6 : 0, [
    schemaAddress
      ? `Address in structured data: ${[schemaAddress.streetAddress, schemaAddress.locality, schemaAddress.region].filter(Boolean).join(", ")}.`
      : business.locations
        ? `Location inferred from ${business.locations.source}: ${business.locations.value.slice(0, 3).join("; ")}. Not stated in structured data.`
        : "No address or service area found in structured data or page text.",
  ]);

  const anyEmail = pages.some((p) => p.emails.length > 0);
  const anyForm = pages.some((p) => p.hasForm);
  const booking = pages.find((p) => p.bookingProvider)?.bookingProvider ?? null;
  const writtenWays = Number(anyForm || Boolean(booking)) + Number(anyEmail);
  add("contact_method", "identity", "Email, contact form or online booking available", writtenWays === 2 ? 1 : writtenWays === 1 ? 0.7 : 0, [
    `Contact form found: ${anyForm ? "yes" : "no"}. Online booking link found: ${booking ? `yes (${booking})` : "no"}. Email address link found: ${anyEmail ? "yes" : "no"}.`,
  ]);

  // ---- Trust and credibility --------------------------------------------
  const reviewPages = pages.filter((p) => p.trustSignals.reviews);
  add("reviews", "trust", "Customer reviews or testimonials on the site", hasRating ? 1 : reviewPages.length ? 0.7 : 0, [
    hasRating
      ? "Review or rating data is present in structured data."
      : reviewPages.length
        ? `Review or testimonial wording found on: ${listPages(reviewPages)}. No rating data in structured data.`
        : "No review or testimonial content detected on the pages analyzed.",
  ]);

  const credentials = [...new Set(pages.flatMap((p) => p.trustSignals.licensing))];
  add("credentials", "trust", "Licensing, insurance, or guarantees mentioned", credentials.length >= 2 ? 1 : credentials.length === 1 ? 0.5 : 0, [
    credentials.length ? `Terms found on the site: ${credentials.join(", ")}.` : "No mention of licensing, insurance, certification, or guarantees found.",
  ]);

  const profiles = [...new Set([...pages.flatMap((p) => p.socialLinks), ...biz.flatMap((b) => b.sameAs)].map((u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      return u;
    }
  }))];
  add("profiles", "trust", "Links to external profiles", profiles.length >= 2 ? 1 : profiles.length === 1 ? 0.5 : 0, [
    profiles.length ? `Links to: ${profiles.slice(0, 6).join(", ")}.` : "No links to social, review, or directory profiles found.",
  ]);

  const tenure = [...new Set(pages.flatMap((p) => p.trustSignals.tenure))];
  add("tenure", "trust", "Experience and ownership signals", tenure.length >= 2 ? 1 : tenure.length === 1 ? 0.6 : 0, [
    tenure.length ? `Found: ${tenure.slice(0, 4).map((t) => `"${t}"`).join(", ")}.` : "No statements about years in business, founding date, or ownership found.",
  ]);

  const privacy = pages.some((p) => p.hasPrivacyLink);
  add("privacy", "trust", "Privacy policy is linked", privacy ? 1 : 0, [privacy ? "A privacy policy link was found." : "No privacy policy link found."]);

  // ---- AI-friendly content structure ------------------------------------
  const questions = [...new Set(pages.flatMap((p) => p.questionHeadings))];
  add("question_headings", "aiStructure", "Content answers customer questions directly", questions.length >= 5 ? 1 : questions.length >= 2 ? 0.6 : questions.length === 1 ? 0.3 : 0, [
    questions.length
      ? `${questions.length} question-style heading(s) found, e.g. "${questions[0]}".`
      : "No question-style headings found. AI answer engines favor content that states a question and answers it directly.",
  ]);

  add("faq_schema", "aiStructure", "FAQ content marked up with FAQPage schema", allTypes.has("FAQPage") ? 1 : 0, [
    allTypes.has("FAQPage") ? "FAQPage schema found." : "No FAQPage schema found.",
  ]);

  const scannable = pages.filter((p) => p.listCount > 0 || p.tableCount > 0);
  add("scannable", "aiStructure", "Lists and tables make facts easy to extract", pct(scannable.length, n), [
    `${scannable.length} of ${n} pages use lists or tables.`,
  ]);

  const structured = pages.filter((p) => p.h1.length >= 1 && p.h2.length >= 2);
  add("heading_hierarchy", "aiStructure", "Pages use a clear heading hierarchy", pct(structured.length, n), [
    `${structured.length} of ${n} pages have an H1 with at least two H2 sections beneath it.`,
  ]);

  return out;
}

/** Scores a crawl. Every point traces back to a check with evidence. */
export function scoreReadiness(
  crawl: CrawlResult,
  business: BusinessProfile,
  config: ScoringConfig = DEFAULT_SCORING,
): ReadinessScore {
  const raw = runChecks(crawl, business);
  const checks: CheckResult[] = [];
  const categories: CategoryScore[] = [];

  for (const key of Object.keys(config.categories) as CategoryKey[]) {
    const { label, max } = config.categories[key];
    const inCategory = raw.filter((c) => c.category === key && (config.checks[c.id] ?? 0) > 0);
    const totalWeight = inCategory.reduce((s, c) => s + config.checks[c.id], 0);
    let earnedTotal = 0;
    for (const c of inCategory) {
      const checkMax = totalWeight ? (config.checks[c.id] / totalWeight) * max : 0;
      const earned = checkMax * c.ratio;
      earnedTotal += earned;
      checks.push({
        ...c,
        status: c.ratio >= 0.95 ? "pass" : c.ratio <= 0.05 ? "fail" : "partial",
        max: Math.round(checkMax * 10) / 10,
        earned: Math.round(earned * 10) / 10,
      });
    }
    categories.push({ key, label, max, earned: Math.round(earnedTotal * 10) / 10 });
  }

  const total = categories.reduce((s, c) => s + c.earned, 0);
  return { score: Math.round(total), categories, checks };
}
