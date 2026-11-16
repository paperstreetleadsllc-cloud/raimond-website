import dns from "node:dns";
import { describe, expect, it } from "vitest";
import { guardedLookup, isBlockedAddress, safeFetch } from "@/lib/audit/net";
import { AuditError } from "@/lib/audit/types";
import { normalizeInputUrl, siteKey } from "@/lib/audit/url";

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof AuditError ? e.code : "OTHER";
  }
  return "OK";
};

describe("URL validation", () => {
  it("accepts and normalizes valid business URLs", () => {
    expect(normalizeInputUrl("exampleplumbingcompany.com")).toBe("https://exampleplumbingcompany.com/");
    expect(normalizeInputUrl("  HTTPS://WWW.Example-Roofing.com/services?x=1#top ")).toBe("https://www.example-roofing.com/");
    expect(normalizeInputUrl("http://example-hvac.com")).toBe("http://example-hvac.com/");
    expect(siteKey("https://www.example-roofing.com/")).toBe("example-roofing.com");
  });

  it.each(["", "   ", "not a url", "ftp://example.com", "javascript:alert(1)", "mailto:a@b.com", "file:///etc/passwd", "https://", "http://exa mple.com", "x".repeat(3000)])(
    "rejects invalid input %j",
    (input) => expect(code(() => normalizeInputUrl(input))).toBe("INVALID_URL"),
  );

  it.each([
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://2130706433", // decimal form of 127.0.0.1
    "http://0x7f.0.0.1",
    "http://017700000001",
    "http://[::1]",
    "http://[::ffff:169.254.169.254]",
    "http://169.254.169.254/latest/meta-data/", // cloud metadata
    "http://10.0.0.5",
    "http://192.168.1.1",
    "http://metadata.google.internal",
    "http://printer.local",
    "http://intranet",
    "https://example.com:8443",
    "https://example.com:22",
  ])("blocks SSRF target %s", (input) => expect(code(() => normalizeInputUrl(input))).toBe("BLOCKED_ADDRESS"));

  it("rejects embedded credentials", () => {
    expect(code(() => normalizeInputUrl("https://user:pass@example.com"))).toBe("INVALID_URL");
  });
});

describe("address blocking", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.0.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "255.255.255.255", "::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "::ffff:10.0.0.1", "::ffff:7f00:1", "64:ff9b::a00:1", "2002:a00:1::", "not-an-ip"])(
    "blocks %s",
    (ip) => expect(isBlockedAddress(ip)).toBe(true),
  );

  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.0.1", "172.32.0.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"])("allows public address %s", (ip) =>
    expect(isBlockedAddress(ip)).toBe(false),
  );

  it("refuses at connection time when a hostname resolves to a private address", async () => {
    // "localhost" stands in for an attacker domain whose DNS answer is internal.
    const err = await new Promise<NodeJS.ErrnoException | null>((resolve) =>
      guardedLookup("localhost", { all: true } as dns.LookupOptions, (e) => resolve(e)),
    );
    expect(err?.code).toBe("EBLOCKEDADDRESS");
  });

  it("safeFetch rejects blocked URLs before any request", async () => {
    await expect(safeFetch("http://127.0.0.1:80/", { timeoutMs: 1000, maxBytes: 1000 })).rejects.toMatchObject({ code: "BLOCKED_ADDRESS" });
    await expect(safeFetch("http://169.254.169.254/", { timeoutMs: 1000, maxBytes: 1000 })).rejects.toMatchObject({ code: "BLOCKED_ADDRESS" });
  });
});
