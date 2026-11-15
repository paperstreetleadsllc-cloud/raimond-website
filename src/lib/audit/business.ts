import { INDUSTRIES, type Industry } from "./industries";
import type { BusinessProfile, PageData, SchemaItem } from "./types";

const BUSINESS_TYPE = /(LocalBusiness|Organization|Corporation|Contractor|Business|Store|Service|Agency|Agent|Plumber|Electrician|Dentist|Physician|Attorney|Restaurant|Clinic|AutoRepair)$/;
const NON_BUSINESS = /^(WebSite|WebPage|BreadcrumbList|ListItem|ImageObject|SearchAction|Person|Article|BlogPosting|FAQPage|Question|Answer|Review|Rating|AggregateRating|Offer|Product|PostalAddress|ContactPoint|OfferCatalog|Service)$/;

export function isBusinessSchema(item: SchemaItem): boolean {
  return item.types.some((t) => !NON_BUSINESS.test(t) && BUSINESS_TYPE.test(t));
}

export function businessSchemaItems(pages: PageData[]): SchemaItem[] {
  return pages.flatMap((p) => p.schema).filter(isBusinessSchema);
}

function count(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  const re = new RegExp(`(?<![a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`, "g");
  return (haystack.match(re) ?? []).length;
}

function detectName(pages: PageData[], siteHost: string): BusinessProfile["name"] {
  const home = pages[0];
  const schemaName = businessSchemaItems(pages).find((s) => s.name)?.name;
  if (schemaName) return { value: schemaName, source: "structured data on the site" };
  if (home?.ogSiteName) return { value: home.ogSiteName, source: "the site's og:site_name tag" };

  const title = home?.title ?? "";
  if (title) {
    const parts = title.split(/\s[|–—-]\s|\s?[|–—:]\s/).map((p) => p.trim()).filter(Boolean);
    const domainCore = siteHost.replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9]/g, "");
    const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matching = parts.find((p) => {
      const s = squash(p);
      return s.length > 2 && (domainCore.includes(s) || s.includes(domainCore));
    });
    if (matching) return { value: matching, source: "the homepage title, matched to the domain" };
    if (parts.length > 1) {
      // Brand names usually sit at the end of a title and are the shortest segment.
      const last = parts[parts.length - 1];
      if (last.split(" ").length <= 6) return { value: last, source: "the homepage title" };
    }
  }
  return null;
}

function detectIndustry(pages: PageData[]): { industry: Industry; source: string } | null {
  const allTypes = new Set(pages.flatMap((p) => p.schema.flatMap((s) => s.types)));
  const bySchema = INDUSTRIES.find((i) => i.schemaTypes.some((t) => allTypes.has(t)));
  if (bySchema) {
    const type = bySchema.schemaTypes.find((t) => allTypes.has(t));
    return { industry: bySchema, source: `structured data type "${type}"` };
  }

  const home = pages[0];
  if (!home) return null;
  const fields: [string, number][] = [
    [home.title.toLowerCase(), 6],
    [home.h1.join(" ").toLowerCase(), 5],
    [home.metaDescription.toLowerCase(), 4],
    [home.h2.join(" ").toLowerCase(), 2],
    [home.internalLinks.map((l) => l.text).join(" ").toLowerCase(), 2],
  ];
  const body = pages.map((p) => p.text ?? "").join(" ");

  const scored = INDUSTRIES.map((industry) => {
    let score = 0;
    const hits: string[] = [];
    for (const kw of industry.keywords) {
      let kwScore = 0;
      for (const [text, weight] of fields) kwScore += Math.min(count(text, kw), 2) * weight;
      kwScore += Math.min(count(body, kw), 8);
      if (kwScore > 0) hits.push(kw);
      score += kwScore;
    }
    return { industry, score, hits };
  }).sort((a, b) => b.score - a.score);

  const [top, second] = scored;
  // Require a clear signal and a clear winner; otherwise say we don't know.
  if (!top || top.score < 12 || top.hits.length < 2) return null;
  if (second && second.score > top.score * 0.75) return null;
  return {
    industry: top.industry,
    source: `repeated terms on the site: ${top.hits.slice(0, 4).join(", ")}`,
  };
}

function detectServices(pages: PageData[], industry: Industry | null): BusinessProfile["services"] {
  if (!industry) return [];
  const found = new Map<string, string>();
  for (const service of industry.services) {
    for (const page of pages) {
      const headings = [...page.h1, ...page.h2, page.title].join(" ").toLowerCase();
      const links = page.internalLinks.map((l) => `${l.text} ${l.href}`).join(" ").toLowerCase().replace(/[-_/]/g, " ");
      if (count(headings, service) > 0 || count(links, service) > 0 || count(page.text ?? "", service) >= 2) {
        found.set(service, page.url);
        break;
      }
    }
  }
  return [...found.entries()].map(([name, foundOn]) => ({ name, foundOn })).slice(0, 12);
}

function detectLocations(pages: PageData[]): BusinessProfile["locations"] {
  const business = businessSchemaItems(pages);
  const withAddress = business.find((s) => s.locality);
  if (withAddress?.locality) {
    const primary = [withAddress.locality, withAddress.region].filter(Boolean).join(", ");
    const served = business.flatMap((s) => s.areaServed).filter((a) => a && a !== primary);
    return {
      value: [...new Set([primary, ...served])].slice(0, 6),
      source: "the address in the site's structured data",
    };
  }
  const served = [...new Set(business.flatMap((s) => s.areaServed))];
  if (served.length) return { value: served.slice(0, 6), source: "areaServed in the site's structured data" };

  const tally = new Map<string, number>();
  pages.forEach((page, i) => {
    page.cityMentions.forEach((city, rank) => {
      // Homepage mentions and each page's most frequent city count for more.
      tally.set(city, (tally.get(city) ?? 0) + (i === 0 ? 3 : 1) + (rank === 0 ? 1 : 0));
    });
  });
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0 || ranked[0][1] < 3) return null;
  return {
    value: ranked.slice(0, 5).map(([city]) => city),
    source: "city and state names repeated in the site's text",
  };
}

function detectPhone(pages: PageData[]): string | null {
  const schemaPhone = businessSchemaItems(pages).find((s) => s.telephone)?.telephone;
  const digits = schemaPhone?.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits && digits.length === 10) return digits;
  const tally = new Map<string, number>();
  for (const page of pages) for (const p of page.phones) tally.set(p, (tally.get(p) ?? 0) + 1);
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? null;
}

/** Builds the business profile from extracted page data. Nothing is guessed. */
export function detectBusiness(pages: PageData[], siteHost: string): BusinessProfile {
  const detected = detectIndustry(pages);
  return {
    name: detectName(pages, siteHost),
    industry: detected
      ? { value: detected.industry.label, key: detected.industry.key, source: detected.source }
      : null,
    services: detectServices(pages, detected?.industry ?? null),
    locations: detectLocations(pages),
    phone: detectPhone(pages),
  };
}
