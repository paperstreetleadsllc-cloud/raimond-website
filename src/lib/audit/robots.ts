import type { AiCrawlerAccess } from "./types";

interface Rule {
  allow: boolean;
  path: string;
}
interface Group {
  agents: string[];
  rules: Rule[];
}

export interface RobotsFile {
  groups: Group[];
  sitemaps: string[];
}

/**
 * Crawlers that feed AI search and answer products. "Search" agents decide
 * whether a site can be retrieved and cited; "training" agents do not affect
 * live answers and are reported for information only.
 */
export const AI_CRAWLERS: { agent: string; operator: string; purpose: string; search: boolean }[] = [
  { agent: "OAI-SearchBot", operator: "OpenAI", purpose: "ChatGPT search results", search: true },
  { agent: "ChatGPT-User", operator: "OpenAI", purpose: "Pages fetched when a ChatGPT user asks", search: true },
  { agent: "PerplexityBot", operator: "Perplexity", purpose: "Perplexity search index", search: true },
  { agent: "Claude-SearchBot", operator: "Anthropic", purpose: "Claude search results", search: true },
  { agent: "Googlebot", operator: "Google", purpose: "Google Search, AI Overviews and AI Mode", search: true },
  { agent: "Bingbot", operator: "Microsoft", purpose: "Bing and Microsoft Copilot", search: true },
  { agent: "GPTBot", operator: "OpenAI", purpose: "Model training", search: false },
  { agent: "ClaudeBot", operator: "Anthropic", purpose: "Model training", search: false },
  { agent: "Google-Extended", operator: "Google", purpose: "Gemini training control", search: false },
];

export function parseRobots(text: string): RobotsFile {
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/).slice(0, 5000)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }
    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    if ((field === "allow" || field === "disallow") && current) {
      // An empty Disallow means "allow everything" and carries no rule.
      if (value) current.rules.push({ allow: field === "allow", path: value });
      lastWasAgent = false;
      continue;
    }
    lastWasAgent = false;
  }
  return { groups, sitemaps };
}

function patternToRegExp(pattern: string): RegExp {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

function groupFor(robots: RobotsFile, userAgent: string): Group | null {
  const ua = userAgent.toLowerCase();
  const specific = robots.groups.filter((g) => g.agents.some((a) => a !== "*" && ua.includes(a)));
  if (specific.length) {
    // Merge every group that names this agent, as RFC 9309 requires.
    return { agents: [ua], rules: specific.flatMap((g) => g.rules) };
  }
  const wildcard = robots.groups.filter((g) => g.agents.includes("*"));
  return wildcard.length ? { agents: ["*"], rules: wildcard.flatMap((g) => g.rules) } : null;
}

/** Longest matching rule wins; Allow wins a tie (RFC 9309). */
export function isAllowed(robots: RobotsFile, userAgent: string, path: string): boolean {
  const group = groupFor(robots, userAgent);
  if (!group) return true;
  let best: Rule | null = null;
  for (const rule of group.rules) {
    if (!patternToRegExp(rule.path).test(path)) continue;
    if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) {
      best = rule;
    }
  }
  return best ? best.allow : true;
}

export function aiCrawlerAccess(robots: RobotsFile): AiCrawlerAccess[] {
  return AI_CRAWLERS.map((c) => ({
    agent: c.agent,
    operator: c.operator,
    purpose: c.purpose,
    allowed: isAllowed(robots, c.agent, "/"),
  }));
}

export function parseSitemap(xml: string): { isIndex: boolean; urls: string[] } {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const urls: string[] = [];
  const re = /<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) && urls.length < 2000) {
    urls.push(m[1].replace(/&amp;/g, "&").trim());
  }
  return { isIndex, urls };
}
