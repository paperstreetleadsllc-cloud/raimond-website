import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { runAudit } from "@/lib/audit/pipeline";
import { Progress, Report } from "@/components/AuditView";
import { toPublicAudit } from "@/lib/service";
import type { AuditRecord } from "@/lib/store";
import { fakeSite, goodSite, weakSite, GOOD_ORIGIN, WEAK_ORIGIN } from "./fixtures";

vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

async function record(origin: string, site: ReturnType<typeof goodSite>): Promise<AuditRecord> {
  const result = await runAudit(origin, { fetcher: fakeSite(site) });
  const now = new Date().toISOString();
  return { id: "11111111-1111-4111-8111-111111111111", siteKey: "x", inputUrl: `${origin}/`, status: "completed", progress: null, result, error: null, ipHash: "h", createdAt: now, updatedAt: now };
}

describe("results dashboard", () => {
  it("renders a full report from real pipeline output", async () => {
    const html = renderToStaticMarkup(<Report audit={toPublicAudit(await record(GOOD_ORIGIN, goodSite()))} />);
    expect(html).toContain("Acme Plumbing");
    expect(html).toContain("AI Readiness Score");
    expect(html).toContain("Plumbing");
    expect(html).toContain("Tampa, FL");
    expect(html).toContain("Who is the best plumber in Tampa, FL?");
    expect(html).toContain("Technical accessibility");
  });

  it("labels every AI platform as not measured and shows no visibility percentage", async () => {
    const html = renderToStaticMarkup(<Report audit={toPublicAudit(await record(GOOD_ORIGIN, goodSite()))} />);
    expect(html.match(/Not currently measured/g)?.length).toBe(7);
    const platformSection = html.slice(html.indexOf('id="platforms"'), html.indexOf("Can AI crawlers read this site?"));
    expect(platformSection).not.toMatch(/\d+\s?%/);
  });

  it("renders a weak site honestly: unknown industry, no invented questions, three recommendations", async () => {
    const html = renderToStaticMarkup(<Report audit={toPublicAudit(await record(WEAK_ORIGIN, weakSite()))} />);
    expect(html).toContain("Not determined");
    expect(html).toContain("we have not generated questions rather than guess");
    expect(html.match(/priority<\/span>/g)?.length).toBe(3);
    expect(html).toMatch(/\d+ more recommendations? in the full report/);
  });

  it("renders progress from real stage data", () => {
    const now = new Date().toISOString();
    const audit = toPublicAudit({ id: "1", siteKey: "x", inputUrl: "https://x-example.com/", status: "running", progress: { stage: "crawl", stagesDone: ["validate", "robots"], pagesFetched: 3, pagesPlanned: 9 }, result: null, error: null, ipHash: "h", createdAt: now, updatedAt: now });
    const html = renderToStaticMarkup(<Progress audit={audit} />);
    expect(html).toContain("Fetching public pages (3 of 9)");
    expect(html).not.toMatch(/\d+\s?%/);
  });
});
