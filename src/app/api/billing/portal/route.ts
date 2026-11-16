import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { billingDeps, toVerifiedUser } from "@/lib/billing/context";
import { openPortal } from "@/lib/billing/service";
import { sameOrigin } from "@/lib/http";
import { billingErrorResponse } from "../respond";

export const runtime = "nodejs";

/** Opens the Stripe billing portal for the signed-in user's own customer. Reads nothing from the request body. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const user = await requireUser();
    const { url } = await openPortal(toVerifiedUser(user), billingDeps());
    return NextResponse.json({ url });
  } catch (err) {
    return billingErrorResponse(err, "portal_error");
  }
}
