import type { PromptIntent } from "../audit/types";
import type { ObservationAnalysis, RawObservation, VisibilitySummary } from "./types";

/** Sites that list businesses rather than being one. Never counted as competitors. */
const DIRECTORIES = [
  "yelp.com", "angi.com", "homeadvisor.com", "thumbtack.com", "bbb.org", "google.com", "facebook.com",
  "instagram.com", "linkedin.com", "youtube.com", "reddit.com", "nextdoor.com", "houzz.com", "tripadvisor.com",
  "yellowpages.com", "mapquest.com", "wikipedia.org", "x.com", "twitter.com", "tiktok.com", "expertise.com",
  "forbes.com", "bobvila.com", "thisoldhouse.com", "porch.com", "buildzoom.com", "homeguide.com", "gaf.com",
];

const LEGAL_SUFFIX = /[,.]?\s+(llc|l\.l\.c\.|inc|inc\.|incorporated|co|co\.|corp|corp\.|corporation|company|ltd|ltd\.|pllc|pc|p\.c\.)\.?$/i;

const squash = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

export function normalizeBusinessName(name: string): string {
  let n = name.trim();
  while (LEGAL_SUFFIX.test(n)) n = n.replace(LEGAL_SUFFIX, "");
  return squash(n);
}

export function hostOf(url: string): string | null {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

const sameOrSubdomain = (host: string, site: string) => host === site || host.endsWith(`.${site}`);
const isDirectory = (host: string) => DIRECTORIES.some((d) => sameOrSubdomain(host, d));

/** Names presented as options: the lead text of list items, and bold phrases. */
function namedOptions(answer: string): string[] {
  const out: string[] = [];
  for (const line of answer.split("\n")) {
    const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      const bold = item[1].match(/^\*\*(.+?)\*\*/) ?? item[1].match(/^__(.+?)__/);
      const lead = bold ? bold[1] : item[1].split(/\s[–—-]\s|:\s|\s\(/)[0];
      out.push(lead);
    }
    for (const m of line.matchAll(/\*\*(.+?)\*\*/g)) out.push(m[1]);
  }
  return out
    .map((s) => s.replace(/\[(.+?)\]\(.*?\)/g, "$1").replace(/\[\d+\]/g, "").replace(/[*_`]/g, "").trim().replace(/[:.]$/, ""))
    .filter((s) => s.length >= 3 && s.length <= 60 && /^[A-Z0-9]/.test(s) && s.split(" ").length <= 7);
}

const PROVIDER_SEEKING: PromptIntent[] = ["local", "urgent", "comparison"];

/**
 * Analyzes one recorded answer.
 *
 * - mentioned: the business name (legal suffixes ignored) or its domain appears in the answer text.
 * - cited: at least one cited source URL is on the business's own domain.
 * - recommended: narrow on purpose. The question asked for a provider, and the
 *   business is presented as one of the answer's named options (a list item or
 *   bold name). A passing mention in prose does not count.
 */
export function analyzeObservation(
  obs: Pick<RawObservation, "answerText" | "citations" | "intent">,
  business: { name: string | null; siteUrl: string },
): ObservationAnalysis {
  const site = hostOf(business.siteUrl) ?? "";
  const name = business.name ? normalizeBusinessName(business.name) : "";
  const text = ` ${squash(obs.answerText)} `;
  const nameHit = name.length >= 3 && text.includes(` ${name} `);
  const domainHit = site.length > 0 && obs.answerText.toLowerCase().includes(site);

  const options = [...new Set(namedOptions(obs.answerText))];
  const isUs = (option: string) => name.length >= 3 && normalizeBusinessName(option).includes(name);
  const presentedAsOption = options.some(isUs);

  const citedHosts = obs.citations.map((u) => ({ url: u, host: hostOf(u) })).filter((c): c is { url: string; host: string } => c.host !== null);
  const citedUrls = citedHosts.filter((c) => site && sameOrSubdomain(c.host, site)).map((c) => c.url);

  return {
    mentioned: nameHit || domainHit,
    recommended: PROVIDER_SEEKING.includes(obs.intent) && presentedAsOption,
    cited: citedUrls.length > 0,
    citedUrls,
    namedCompetitors: PROVIDER_SEEKING.includes(obs.intent) ? options.filter((o) => !isUs(o)).slice(0, 15) : [],
    citedCompetitorDomains: [...new Set(citedHosts.map((c) => c.host).filter((h) => !(site && sameOrSubdomain(h, site)) && !isDirectory(h)))].slice(0, 15),
  };
}

/** Aggregates observations per provider. Rates are null, never 0, when nothing was tested. */
export function summarize(observations: (RawObservation & { analysis: ObservationAnalysis })[]): VisibilitySummary[] {
  const byProvider = new Map<string, typeof observations>();
  for (const o of observations) byProvider.set(o.provider, [...(byProvider.get(o.provider) ?? []), o]);
  return [...byProvider.entries()].map(([provider, list]) => {
    const n = list.length;
    const rate = (pick: (a: ObservationAnalysis) => boolean) => (n ? list.filter((o) => pick(o.analysis)).length / n : null);
    const times = list.map((o) => o.observedAt).sort();
    return {
      provider,
      promptsTested: n,
      mentionRate: rate((a) => a.mentioned),
      recommendationRate: rate((a) => a.recommended),
      citationRate: rate((a) => a.cited),
      firstObservedAt: times[0] ?? null,
      lastObservedAt: times[times.length - 1] ?? null,
    };
  });
}
