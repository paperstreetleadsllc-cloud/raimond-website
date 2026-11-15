import { isIP } from "node:net";
import { AuditError } from "./types";

const BLOCKED_SUFFIXES = [
  ".local",
  ".localhost",
  ".internal",
  ".intranet",
  ".lan",
  ".home",
  ".corp",
  ".home.arpa",
  ".test",
  ".invalid",
  ".example",
  ".onion",
];

/**
 * Validates a URL we are about to request. Applied to the user's input and to
 * every redirect hop. DNS-level checks happen separately at connection time.
 */
export function assertPublicHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new AuditError("INVALID_URL", "That doesn't look like a valid web address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new AuditError("INVALID_URL", "Only http and https addresses can be audited.");
  }
  if (url.username || url.password) {
    throw new AuditError("INVALID_URL", "Addresses containing credentials are not accepted.");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new AuditError("BLOCKED_ADDRESS", "Only standard web ports are supported.");
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  // The URL parser canonicalises numeric forms (2130706433, 0x7f.1, [::1]) into
  // IP literals, so rejecting every IP literal also covers those encodings.
  const bare = host.startsWith("[") ? host.slice(1, -1) : host;
  if (isIP(bare)) {
    throw new AuditError("BLOCKED_ADDRESS", "Please enter a website domain, not an IP address.");
  }
  if (!host.includes(".") || host === "localhost") {
    throw new AuditError("BLOCKED_ADDRESS", "Please enter a public website domain.");
  }
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new AuditError("BLOCKED_ADDRESS", "That domain is not a public website.");
  }
  if (!/^[a-z0-9.-]+$/.test(host) || host.length > 253) {
    throw new AuditError("INVALID_URL", "That domain contains unsupported characters.");
  }
  return url;
}

/** Turns what a visitor typed into a canonical start URL. */
export function normalizeInputUrl(input: string): string {
  let raw = (input ?? "").trim();
  if (!raw || raw.length > 2048) {
    throw new AuditError("INVALID_URL", "Please enter your website address.");
  }
  if (/\s/.test(raw)) {
    throw new AuditError("INVALID_URL", "Web addresses can't contain spaces.");
  }
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^[^/]+:\d+/.test(raw)) {
      throw new AuditError("INVALID_URL", "Only http and https addresses can be audited.");
    }
    raw = `https://${raw}`;
  }
  const url = assertPublicHttpUrl(raw);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  // Audits always start from the site root: the product audits a business, not a page.
  url.pathname = "/";
  url.search = "";
  return url.toString();
}

/** Key used for de-duplicating audits of the same site. */
export function siteKey(normalizedUrl: string): string {
  return new URL(normalizedUrl).hostname.replace(/^www\./, "");
}

export function sameSite(a: string, b: string): boolean {
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, "");
  try {
    return strip(new URL(a).hostname) === strip(new URL(b).hostname);
  } catch {
    return false;
  }
}
