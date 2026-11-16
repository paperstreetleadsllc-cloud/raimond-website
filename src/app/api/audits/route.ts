import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuditError } from "@/lib/audit/types";
import { clientIp, sameOrigin } from "@/lib/http";
import { getVerifiedUser } from "@/lib/auth";
import { processAudit, RateLimitError, requestAudit, saveAuditForUser } from "@/lib/service";
import { StoreNotConfiguredError } from "@/lib/store";

export const runtime = "nodejs";
// The crawl budget is 40 s; this leaves room to save the result.
export const maxDuration = 60;

const Body = z.object({
  url: z.string().min(1).max(2048),
  // Honeypot: real visitors never fill this hidden field.
  company_website: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter your website address." }, { status: 400 });
  }
  if (parsed.data.company_website) {
    // Looks like a bot. Respond as if accepted, without doing any work.
    return NextResponse.json({ id: "00000000-0000-4000-8000-000000000000" }, { status: 202 });
  }

  try {
    const { audit, reused } = await requestAudit(parsed.data.url, clientIp(req));
    if (!reused) after(() => processAudit(audit.id));
    // Signed-in visitors get the audit saved to their dashboard. The id comes
    // from the verified session; nothing in the request body is trusted for it.
    const user = await getVerifiedUser().catch(() => null);
    if (user) await saveAuditForUser(user.id, audit.id);
    return NextResponse.json({ id: audit.id, reused }, { status: 202 });
  } catch (err) {
    if (err instanceof AuditError) return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    if (err instanceof RateLimitError) return NextResponse.json({ error: err.message }, { status: 429 });
    if (err instanceof StoreNotConfiguredError) {
      console.error(JSON.stringify({ event: "store_not_configured" }));
      return NextResponse.json({ error: "Audits are temporarily unavailable. Please try again soon." }, { status: 503 });
    }
    console.error(JSON.stringify({ event: "audit_request_error", detail: String(err) }));
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
