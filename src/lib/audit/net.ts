import dns from "node:dns";
import { isIP } from "node:net";
import { Agent, ProxyAgent, fetch as undiciFetch, type Dispatcher } from "undici";
import { AuditError, type FetchOptions, type FetchResult, type Fetcher } from "./types";
import { assertPublicHttpUrl } from "./url";

/** Product token matched against robots.txt groups. */
export const ROBOTS_TOKEN = "RAimondAIBot";

export const USER_AGENT =
  "RAimondAIBot/0.1 (+https://raimondai.com/bot; website audit requested by a visitor)";

const V4_BLOCKS: [number, number, number, number, number][] = [
  [0, 0, 0, 0, 8], // "this" network
  [10, 0, 0, 0, 8], // private
  [100, 64, 0, 0, 10], // carrier-grade NAT
  [127, 0, 0, 0, 8], // loopback
  [169, 254, 0, 0, 16], // link-local, includes cloud metadata 169.254.169.254
  [172, 16, 0, 0, 12], // private
  [192, 0, 0, 0, 24], // IETF protocol assignments
  [192, 0, 2, 0, 24], // documentation
  [192, 88, 99, 0, 24], // 6to4 relay
  [192, 168, 0, 0, 16], // private
  [198, 18, 0, 0, 15], // benchmarking
  [198, 51, 100, 0, 24], // documentation
  [203, 0, 113, 0, 24], // documentation
  [224, 0, 0, 0, 4], // multicast
  [240, 0, 0, 0, 4], // reserved + broadcast
];

function v4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

function isBlockedV4(ip: string): boolean {
  const n = v4ToInt(ip);
  if (n === null) return true;
  return V4_BLOCKS.some(([a, b, c, d, bits]) => {
    const base = ((a * 256 + b) * 256 + c) * 256 + d;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return ((n & mask) >>> 0) === ((base & mask) >>> 0);
  });
}

/** Expands an IPv6 address into 8 16-bit groups, or null when malformed. */
function expandV6(ip: string): number[] | null {
  let s = ip.toLowerCase();
  const zone = s.indexOf("%");
  if (zone !== -1) s = s.slice(0, zone);
  // Embedded IPv4 tail, e.g. ::ffff:10.0.0.1
  const lastColon = s.lastIndexOf(":");
  const tail = s.slice(lastColon + 1);
  if (tail.includes(".")) {
    const n = v4ToInt(tail);
    if (n === null) return null;
    s = `${s.slice(0, lastColon + 1)}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? head.length !== 8 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  const out = groups.map((g) => (/^[0-9a-f]{1,4}$/.test(g) ? parseInt(g, 16) : NaN));
  return out.some(Number.isNaN) ? null : out;
}

function isBlockedV6(ip: string): boolean {
  const g = expandV6(ip);
  if (!g) return true;
  const embedded = () => `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
  if (g.slice(0, 7).every((x) => x === 0)) return true; // :: and ::1
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) return isBlockedV4(embedded()); // v4-mapped
  if (g.slice(0, 6).every((x) => x === 0)) return true; // deprecated v4-compatible
  if (g[0] === 0x64 && g[1] === 0xff9b) return true; // NAT64 (well-known and local-use)
  if ((g[0] & 0xfe00) === 0xfc00) return true; // unique local fc00::/7
  if ((g[0] & 0xffc0) === 0xfe80) return true; // link-local fe80::/10
  if ((g[0] & 0xffc0) === 0xfec0) return true; // deprecated site-local
  if ((g[0] & 0xff00) === 0xff00) return true; // multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
  if (g[0] === 0x2001 && g[1] === 0) return true; // Teredo
  if (g[0] === 0x2002) return true; // 6to4, embeds an arbitrary IPv4
  return false;
}

/** True when an address must never be contacted on behalf of a visitor. */
export function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isBlockedV4(ip);
  if (kind === 6) return isBlockedV6(ip);
  return true;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number,
) => void;

/**
 * DNS lookup used for the actual socket connection. Because the check runs on
 * the addresses the socket will connect to, a hostname cannot pass validation
 * with one answer and connect with another (DNS rebinding).
 */
export function guardedLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: LookupCallback,
): void {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, []);
    const list = addresses as dns.LookupAddress[];
    if (list.length === 0 || list.some((a) => isBlockedAddress(a.address))) {
      const blocked = new Error(`Refusing to connect to non-public address for ${hostname}`);
      (blocked as NodeJS.ErrnoException).code = "EBLOCKEDADDRESS";
      return callback(blocked, []);
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

let cachedDispatcher: Dispatcher | null = null;

function getDispatcher(): Dispatcher {
  if (cachedDispatcher) return cachedDispatcher;
  const devProxy = process.env.AUDIT_EGRESS_PROXY;
  if (devProxy) {
    // Local development only: some sandboxes have no direct egress. The proxy
    // resolves DNS itself, so connection-time address checks cannot run.
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw new Error("AUDIT_EGRESS_PROXY must not be set in production.");
    }
    cachedDispatcher = new ProxyAgent({ uri: devProxy });
    return cachedDispatcher;
  }
  cachedDispatcher = new Agent({
    connect: { lookup: guardedLookup as never, timeout: 5000 },
    headersTimeout: 10_000,
    bodyTimeout: 10_000,
  });
  return cachedDispatcher;
}

const MAX_REDIRECTS = 5;

function classifyError(err: unknown): AuditError {
  const e = err as { name?: string; code?: string; cause?: { code?: string; message?: string } };
  const code = e?.cause?.code ?? e?.code ?? "";
  if (err instanceof AuditError) return err;
  if (code === "EBLOCKEDADDRESS") {
    return new AuditError("BLOCKED_ADDRESS", "That address does not point to a public website.");
  }
  if (e?.name === "TimeoutError" || e?.name === "AbortError" || /TIMEOUT/i.test(code)) {
    return new AuditError("TIMEOUT", "The website took too long to respond.");
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return new AuditError("UNREACHABLE", "We couldn't find that domain. Check the spelling.");
  }
  return new AuditError("UNREACHABLE", "We couldn't connect to that website.");
}

/**
 * Fetches a public URL with SSRF protections: per-hop URL validation,
 * connection-time DNS checks, manual redirect handling, a hard timeout, and a
 * cap on the decompressed response size.
 */
export const safeFetch: Fetcher = async (url: string, opts: FetchOptions): Promise<FetchResult> => {
  const started = Date.now();
  const signal = AbortSignal.timeout(opts.timeoutMs);
  const redirects: string[] = [];
  let current = assertPublicHttpUrl(url).toString();

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await undiciFetch(current, {
        method: "GET",
        redirect: "manual",
        signal,
        dispatcher: getDispatcher(),
        headers: {
          "user-agent": USER_AGENT,
          accept: opts.accept ?? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
          "accept-language": "en-US,en;q=0.8",
        },
      });

      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        await res.body?.cancel().catch(() => undefined);
        if (hop === MAX_REDIRECTS) {
          throw new AuditError("UNREACHABLE", "The website redirected too many times.");
        }
        const next = new URL(res.headers.get("location") as string, current).toString();
        current = assertPublicHttpUrl(next).toString();
        redirects.push(current);
        continue;
      }

      const chunks: Uint8Array[] = [];
      let bytes = 0;
      let truncated = false;
      if (res.body) {
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > opts.maxBytes) {
            truncated = true;
            chunks.push(value.subarray(0, value.byteLength - (bytes - opts.maxBytes)));
            bytes = opts.maxBytes;
            await reader.cancel().catch(() => undefined);
            break;
          }
          chunks.push(value);
        }
      }
      return {
        requestedUrl: url,
        finalUrl: current,
        status: res.status,
        contentType: (res.headers.get("content-type") ?? "").toLowerCase(),
        body: Buffer.concat(chunks).toString("utf8"),
        bytes,
        truncated,
        redirects,
        elapsedMs: Date.now() - started,
      };
    }
    throw new AuditError("UNREACHABLE", "The website redirected too many times.");
  } catch (err) {
    throw classifyError(err);
  }
};
