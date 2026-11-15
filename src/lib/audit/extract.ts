import * as cheerio from "cheerio";
import type { PageData, PageLink, SchemaItem } from "./types";
import { sameSite } from "./url";

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "youtube.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "yelp.com",
  "nextdoor.com",
  "bbb.org",
  "angi.com",
  "homeadvisor.com",
  "houzz.com",
  "g.page",
  "google.com/maps",
  "maps.app.goo.gl",
];

const US_STATES =
  "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC";
const CITY_STATE = new RegExp(
  `\\b((?:[A-Z][a-z]+\\.?)(?:[ -][A-Z][a-z]+){0,2}),\\s(${US_STATES})\\b`,
  "g",
);
// Words that the city pattern picks up from sentence starts rather than place names.
const NOT_A_CITY = /^(Suite|Ste|Unit|Floor|Box|Street|St|Ave|Avenue|Road|Rd|Blvd|Drive|Dr|Lane|Ln|Way|Hwy|Highway|Court|Ct|Pkwy|Parkway|Place|Pl|Building|Bldg|Call|Visit|Contact|Serving|In|From|Near|And|Or|The|Of)\b/;

const PHONE = /(?:\+?1[\s.-]?)?\(?([2-9]\d{2})\)?[\s.-]?([2-9]\d{2})[\s.-]?(\d{4})\b/g;

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? digits : null;
}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function str(v: unknown): string | undefined {
  if (typeof v === "string") return clean(v) || undefined;
  if (typeof v === "number") return String(v);
  if (v && typeof v === "object" && typeof (v as { name?: unknown }).name === "string") {
    return clean((v as { name: string }).name) || undefined;
  }
  return undefined;
}

function toSchemaItem(node: Record<string, unknown>): SchemaItem | null {
  const types = asArray(node["@type"] as string | string[]).filter((t) => typeof t === "string");
  if (types.length === 0) return null;
  const address = asArray(node.address as unknown)[0];
  const addr = address && typeof address === "object" ? (address as Record<string, unknown>) : {};
  return {
    types,
    name: str(node.name),
    telephone: str(node.telephone),
    url: str(node.url),
    email: str(node.email),
    streetAddress: typeof address === "string" ? clean(address) : str(addr.streetAddress),
    locality: str(addr.addressLocality),
    region: str(addr.addressRegion),
    postalCode: str(addr.postalCode),
    areaServed: asArray(node.areaServed as unknown)
      .map((a) => str(a))
      .filter((a): a is string => Boolean(a))
      .slice(0, 30),
    sameAs: asArray(node.sameAs as unknown).filter((s): s is string => typeof s === "string").slice(0, 20),
    hasOpeningHours: Boolean(node.openingHours || node.openingHoursSpecification),
    hasAggregateRating: Boolean(node.aggregateRating),
    hasReview: Boolean(node.review),
  };
}

function collectSchema(value: unknown, out: SchemaItem[], depth = 0): void {
  if (!value || depth > 6 || out.length > 60) return;
  if (Array.isArray(value)) {
    for (const v of value) collectSchema(v, out, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  const node = value as Record<string, unknown>;
  const item = toSchemaItem(node);
  if (item) out.push(item);
  if (node["@graph"]) collectSchema(node["@graph"], out, depth + 1);
  for (const key of ["mainEntity", "publisher", "provider", "author", "itemListElement"]) {
    if (node[key] && typeof node[key] === "object") collectSchema(node[key], out, depth + 1);
  }
}

/** Extracts everything the audit needs from one HTML document. No network access. */
export function extractPage(
  url: string,
  html: string,
  meta: { status: number; elapsedMs: number; bytes: number },
): PageData {
  const $ = cheerio.load(html);

  // Structured data first, before script tags are removed.
  const schema: SchemaItem[] = [];
  let schemaParseErrors = 0;
  let schemaBlocks = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    schemaBlocks++;
    try {
      collectSchema(JSON.parse(raw), schema);
    } catch {
      schemaParseErrors++;
    }
  });

  const title = clean($("head > title").first().text() || $("title").first().text());
  const metaDescription = clean($('meta[name="description" i]').attr("content"));
  const robotsMeta = clean(
    $('meta[name="robots" i]').attr("content") ?? $('meta[name="googlebot" i]').attr("content"),
  ).toLowerCase();
  const canonicalRaw = clean($('link[rel="canonical" i]').attr("href"));
  let canonical = "";
  try {
    canonical = canonicalRaw ? new URL(canonicalRaw, url).toString() : "";
  } catch {
    canonical = "";
  }

  const internal = new Map<string, PageLink>();
  const socialLinks = new Set<string>();
  const phones = new Set<string>();
  const emails = new Set<string>();
  let externalLinkCount = 0;
  let hasTelLink = false;
  let hasPrivacyLink = false;

  $("a[href]").each((_, el) => {
    const href = clean($(el).attr("href"));
    const text = clean($(el).text()).slice(0, 120);
    if (!href || href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) return;
    if (href.toLowerCase().startsWith("tel:")) {
      hasTelLink = true;
      const p = normalizePhone(href.slice(4));
      if (p) phones.add(p);
      return;
    }
    if (href.toLowerCase().startsWith("mailto:")) {
      const e = href.slice(7).split("?")[0].trim().toLowerCase();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) emails.add(e);
      return;
    }
    let abs: URL;
    try {
      abs = new URL(href, url);
    } catch {
      return;
    }
    if (abs.protocol !== "http:" && abs.protocol !== "https:") return;
    if (sameSite(abs.toString(), url)) {
      abs.hash = "";
      const key = abs.toString();
      if (/privacy/i.test(key) || /privacy/i.test(text)) hasPrivacyLink = true;
      if (!internal.has(key)) internal.set(key, { href: key, text });
    } else {
      externalLinkCount++;
      const full = `${abs.hostname.replace(/^www\./, "")}${abs.pathname}`;
      if (SOCIAL_HOSTS.some((h) => full.includes(h))) socialLinks.add(abs.toString());
    }
  });

  const h1 = $("h1").map((_, el) => clean($(el).text())).get().filter(Boolean).slice(0, 10);
  const h2 = $("h2").map((_, el) => clean($(el).text())).get().filter(Boolean).slice(0, 60);
  const h3 = $("h3").map((_, el) => clean($(el).text())).get().filter(Boolean).slice(0, 80);
  const questionHeadings = [...h2, ...h3].filter((h) => h.endsWith("?") && h.length > 12).slice(0, 25);

  const imagesTotal = $("img").length;
  const imagesWithAlt = $("img").filter((_, el) => clean($(el).attr("alt")).length > 0).length;
  const hasForm = $("form").filter((_, el) => $(el).find("input, textarea, select").length > 1).length > 0;
  const listCount = $("main ul, main ol, article ul, article ol").length || $("ul, ol").length;
  const tableCount = $("table").length;

  $("script, style, noscript, svg, template, iframe").remove();
  const visible = clean($("body").text());
  const wordCount = visible ? visible.split(" ").filter((w) => /[a-z0-9]/i.test(w)).length : 0;

  for (const m of visible.matchAll(PHONE)) {
    const p = normalizePhone(m[0]);
    if (p) phones.add(p);
    if (phones.size >= 6) break;
  }

  const cityCounts = new Map<string, number>();
  for (const m of `${title}. ${visible}`.matchAll(CITY_STATE)) {
    const city = m[1].trim();
    if (NOT_A_CITY.test(city)) continue;
    const key = `${city}, ${m[2]}`;
    cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
  }
  const cityMentions = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 12);

  const lower = visible.toLowerCase();
  const licensing = ["licensed", "insured", "bonded", "certified", "accredited", "bbb", "warranty", "guarantee"].filter(
    (w) => new RegExp(`\\b${w}\\b`).test(lower),
  );
  const tenure: string[] = [];
  const since = lower.match(/\b(?:since|established in|est\.?|founded in)\s+((?:19|20)\d{2})\b/);
  if (since) tenure.push(since[0]);
  const years = lower.match(/\b(?:over\s+)?\d{1,3}\+?\s+years(?:\s+of)?\s+(?:experience|in business|serving)/);
  if (years) tenure.push(years[0]);
  if (/\bfamily[- ]owned\b/.test(lower)) tenure.push("family owned");
  if (/\blocally[- ]owned\b/.test(lower)) tenure.push("locally owned");

  return {
    url,
    status: meta.status,
    elapsedMs: meta.elapsedMs,
    bytes: meta.bytes,
    title,
    metaDescription,
    canonical,
    noindex: /\bnoindex\b/.test(robotsMeta),
    lang: clean($("html").attr("lang")),
    hasViewport: $('meta[name="viewport" i]').length > 0,
    h1,
    h2,
    h3Count: h3.length,
    wordCount,
    ogSiteName: clean($('meta[property="og:site_name" i]').attr("content")),
    schema,
    schemaParseErrors,
    schemaBlocks,
    internalLinks: [...internal.values()].slice(0, 400),
    externalLinkCount,
    socialLinks: [...socialLinks].slice(0, 15),
    phones: [...phones],
    emails: [...emails].slice(0, 5),
    hasTelLink,
    hasForm,
    hasPrivacyLink,
    imagesTotal,
    imagesWithAlt,
    questionHeadings,
    listCount,
    tableCount,
    cityMentions,
    trustSignals: {
      reviews: /\b(reviews?|testimonials?|what our (?:customers|clients) say|5[- ]star)\b/.test(lower),
      licensing,
      tenure,
    },
    text: lower.slice(0, 20_000),
  };
}
