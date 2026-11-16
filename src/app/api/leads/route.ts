import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, sameOrigin } from "@/lib/http";
import { hashIp } from "@/lib/service";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

const Body = z.object({
  auditId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(120).optional(),
  company_website: z.string().max(200).optional(),
});

/**
 * Stores a request for the full report. It does not send any email: outbound
 * messages stay off until they are explicitly approved and configured.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (parsed.data.company_website) return NextResponse.json({ ok: true });

  try {
    const store = getStore();
    const audit = await store.getAudit(parsed.data.auditId);
    if (!audit) return NextResponse.json({ error: "Audit not found." }, { status: 404 });
    await store.saveLead({
      auditId: audit.id,
      email: parsed.data.email,
      name: parsed.data.name || null,
      ipHash: hashIp(clientIp(req)),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(JSON.stringify({ event: "lead_save_error", detail: String(err) }));
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 500 });
  }
}
