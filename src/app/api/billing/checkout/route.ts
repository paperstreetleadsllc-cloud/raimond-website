import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { billingDeps, toVerifiedUser } from "@/lib/billing/context";
import { startCheckout } from "@/lib/billing/service";
import { sameOrigin } from "@/lib/http";
import { billingErrorResponse } from "../respond";

export const runtime = "nodejs";

/**
 * Starts a subscription checkout for the signed-in user. The only input read
 * from the request is a plan name; the user, customer, price, and return URLs
 * all come from the server.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => null)) as { plan?: unknown } | null;
    const { url } = await startCheckout(toVerifiedUser(user), body?.plan, billingDeps());
    return NextResponse.json({ url });
  } catch (err) {
    return billingErrorResponse(err, "checkout_error");
  }
}
