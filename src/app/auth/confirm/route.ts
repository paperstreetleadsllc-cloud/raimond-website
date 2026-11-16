import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth-rules";
import { createSessionClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["signup", "email", "recovery", "invite", "email_change", "magiclink"];

/**
 * Landing point for links in Supabase emails (account confirmation and
 * password recovery). Exchanges the one-time token for a session on the server.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const fail = NextResponse.redirect(new URL("/login?m=link", request.url));

  // Supabase's default email templates return a one-time code instead of a token hash.
  if (code && code.length <= 200 && !tokenHash) {
    try {
      const supabase = await createSessionClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return fail;
    } catch {
      return fail;
    }
    return NextResponse.redirect(new URL(safeNextPath(searchParams.get("next")), request.url));
  }
  if (!tokenHash || !type || !TYPES.includes(type) || tokenHash.length > 200) return fail;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return fail;
  } catch {
    return fail;
  }
  const next = type === "recovery" ? "/reset-password" : safeNextPath(searchParams.get("next"));
  return NextResponse.redirect(new URL(next, request.url));
}
