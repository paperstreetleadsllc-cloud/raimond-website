import { describe, expect, it } from "vitest";
import { generateActionPlan } from "../plan.js";

describe("generateActionPlan deterministic snapshot", () => {
  it("returns stable action plan output for fixed site seed", () => {
    const plan = generateActionPlan({
      site: {
        id: "site_fixture_123",
        url: "https://example-insurance.test",
        businessName: "Example Insurance",
        vertical: "life insurance",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
      latestAudit: {
        id: "audit_fixture_123",
        siteId: "site_fixture_123",
        score: 58,
        totalScore: 58,
        status: "completed",
        findings: ["Weak trust intent and sparse comparison coverage."],
        topWinningQueries: [
          "life insurance quote near me",
          "best term life insurance pricing",
          "is example insurance licensed",
          "how does term life insurance work",
          "compare term life insurance providers",
        ],
        weakAreas: ["comparison", "trust-legitimacy"],
        competitorGap: "Competitor benchmark not connected yet.",
        recommendedActions: [
          "Expand comparison pages for top service lines.",
          "Publish trust and licensing proof near CTAs.",
        ],
        createdAt: "2026-02-10T00:00:00.000Z",
      },
      extractedEntities: ["Example Insurance", "New York", "Term Life", "Policy Review"],
      topQueries: [
        "life insurance quote near me",
        "best term life insurance pricing",
        "is example insurance licensed",
      ],
      nowIso: "2026-02-17T00:00:00.000Z",
    });

    expect({
      id: plan.id,
      summary: plan.summary,
      itemCount: plan.items.length,
      p0Count: plan.items.filter((item) => item.priority === "P0").length,
      titles: plan.items.map((item) => item.title).slice(0, 8),
      deliverableTypeCounts: plan.items.reduce<Record<string, number>>((acc, item) => {
        for (const deliverable of item.deliverables) {
          acc[deliverable.type] = (acc[deliverable.type] ?? 0) + 1;
        }
        return acc;
      }, {}),
    }).toMatchInlineSnapshot(`
      {
        "deliverableTypeCounts": {
          "copy": 7,
          "jsonld": 3,
          "outline": 10,
        },
        "id": "plan_32f6dabc809be981",
        "itemCount": 10,
        "p0Count": 4,
        "summary": "Example Insurance scored 58/100 in the latest audit. This plan prioritizes 4 P0 actions and 10 total tasks. Primary weak areas: comparison, trust-legitimacy.",
        "titles": [
          "Deploy FAQ schema for answer intent capture",
          "Add Organization and Service schema baseline",
          "Publish 10 long-tail query pages",
          "Launch paid ad messaging by query cluster",
          "Roll out a 7-day content sprint",
          "Resolve weak area coverage gaps",
          "Prioritize top winning query refreshes",
          "Build trust-proof section templates",
        ],
      }
    `);
  });
});
