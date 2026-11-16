import { servesNationwide } from "./business";
import { industryByKey } from "./industries";
import type { BusinessProfile, ProviderStatus, SearchPrompt } from "./types";

const an = (noun: string) => (/^[aeiou]/i.test(noun) || /^hvac/i.test(noun) ? "an" : "a");

/**
 * Generates the customer questions that would be tested against AI search
 * providers. Built only from what was detected on the site; if the industry is
 * unknown, no questions are invented.
 */
export function generatePrompts(business: BusinessProfile): SearchPrompt[] {
  const industry = business.industry ? industryByKey(business.industry.key) : undefined;
  if (!industry) return [];

  // Customers of a country-wide business do not ask about its office town.
  const nationwide = servesNationwide(business);
  const city = nationwide ? null : (business.locations?.value[0] ?? null);
  const where = nationwide ? "in the US" : city ? `in ${city}` : "near me";
  const services = business.services.map((s) => s.name).slice(0, 3);
  const out: SearchPrompt[] = [];
  const add = (question: string, intent: SearchPrompt["intent"]) => {
    if (!out.some((p) => p.question === question)) out.push({ question, intent });
  };

  add(`Who is the best ${industry.noun} ${where}?`, "local");
  add(`Which ${industry.noun} ${where} has the best reviews?`, "comparison");
  add(`How do I choose ${an(industry.noun)} ${industry.noun}?`, "informational");

  for (const service of services) {
    add(`Who offers ${service} ${where}?`, "local");
    add(`How much does ${service} cost${city ? ` in ${city}` : ""}?`, "commercial");
  }
  if (services.length === 0) {
    add(`How much does ${an(industry.noun)} ${industry.noun} charge${city ? ` in ${city}` : ""}?`, "commercial");
  }

  if (industry.urgent) {
    const emergency = business.services.find((s) => s.name.startsWith("emergency"))?.name;
    add(
      emergency
        ? `Who offers ${emergency} ${where} right now?`
        : `Which ${industry.noun} ${where} offers same-day service?`,
      "urgent",
    );
  }

  if (business.name) {
    add(`Is ${business.name.value} a good ${industry.noun}${city ? ` in ${city}` : ""}?`, "comparison");
  }
  return out.slice(0, 10);
}

/**
 * Phase 2 measures website readiness only. No provider is queried, so every
 * provider is reported as not measured rather than given an estimated figure.
 */
export function providerStatuses(): ProviderStatus[] {
  const note = "Not currently measured";
  return [
    { key: "chatgpt_search", name: "ChatGPT Search", status: "not_measured", note },
    { key: "google_ai_overviews", name: "Google AI Overviews", status: "not_measured", note },
    { key: "google_ai_mode", name: "Google AI Mode", status: "not_measured", note },
    { key: "perplexity", name: "Perplexity", status: "not_measured", note },
    { key: "copilot", name: "Microsoft Copilot", status: "not_measured", note },
    { key: "grok", name: "Grok", status: "not_measured", note },
    { key: "claude", name: "Claude", status: "not_measured", note },
  ];
}
