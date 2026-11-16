import { NextResponse, type NextRequest } from "next/server";
import { toPublicAudit } from "@/lib/service";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const audit = await getStore().getAudit(id);
    if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toPublicAudit(audit), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(JSON.stringify({ event: "audit_read_error", detail: String(err) }));
    return NextResponse.json({ error: "Could not load this audit." }, { status: 500 });
  }
}
