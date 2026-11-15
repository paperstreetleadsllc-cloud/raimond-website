/**
 * Runs the audit engine against a real website from the command line.
 *   npm run audit:site -- https://example-business.com [--json]
 */
import { runAudit } from "../src/lib/audit/pipeline";
import { AuditError } from "../src/lib/audit/types";

async function main() {
  const [target, flag] = process.argv.slice(2);
  if (!target) {
    console.error("Usage: npm run audit:site -- <url> [--json]");
    process.exit(2);
  }
  try {
    const result = await runAudit(target);
    if (flag === "--json") {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    const b = result.business;
    console.log(`\nSite:        ${result.finalUrl}`);
    console.log(`Business:    ${b.name?.value ?? "not determined"}`);
    console.log(`Industry:    ${b.industry?.value ?? "not determined"}${b.industry ? `  (${b.industry.source})` : ""}`);
    console.log(`Location:    ${b.locations?.value.slice(0, 3).join("; ") ?? "not determined"}`);
    console.log(`Services:    ${b.services.map((s) => s.name).join(", ") || "none detected"}`);
    console.log(`Pages:       ${result.stats.pagesAnalyzed} analyzed, ${result.stats.requests} requests, ${(result.stats.bytesDownloaded / 1024).toFixed(0)} KB, ${result.stats.durationMs} ms`);
    console.log(`Readiness:   ${result.readiness.score}/100`);
    for (const c of result.readiness.categories) console.log(`  ${c.label.padEnd(38)} ${c.earned.toFixed(1)}/${c.max}`);
    console.log(`Top recommendations:`);
    for (const r of result.recommendations.slice(0, 3)) console.log(`  [${r.priority}] ${r.title}\n      ${r.evidence[0]}`);
    console.log(`Questions:   ${result.prompts.length} generated`);
    console.log(`Paid API cost: $${result.stats.paidApiCostUsd.toFixed(2)}\n`);
  } catch (err) {
    if (err instanceof AuditError) {
      console.error(`AUDIT FAILED [${err.code}]: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}

main();
