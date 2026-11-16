import { NextResponse, type NextRequest } from "next/server";
import { sameOrigin } from "@/lib/http";
import { createSessionClient } from "@/lib/supabase/server";

/** POST only, so another site cannot log a visitor out with a link or image tag. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    /* already signed out */
  }
  return NextResponse.redirect(new URL("/login?m=signedout", request.url), { status: 303 });
}
