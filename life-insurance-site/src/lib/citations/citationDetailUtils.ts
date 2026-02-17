export type CitationMatch = {
  rank?: number;
  url: string;
  matchedDomain?: string;
};

export function formatRank(rank?: number): string {
  return typeof rank === "number" && Number.isFinite(rank) ? `#${rank}` : "n/a";
}

export function parseCitationMatches(value: unknown): CitationMatch[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): CitationMatch | null => {
      if (!isObjectRecord(item)) return null;

      const urlRaw = typeof item.url === "string" ? item.url.trim() : "";
      if (!urlRaw) return null;

      const rank = typeof item.rank === "number" && Number.isFinite(item.rank) ? item.rank : undefined;
      const matchedDomainRaw = typeof item.matchedDomain === "string" ? item.matchedDomain.trim() : "";
      const matchedDomain = matchedDomainRaw ? matchedDomainRaw : undefined;

      return { rank, url: urlRaw, matchedDomain };
    })
    .filter((item): item is CitationMatch => item !== null);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
