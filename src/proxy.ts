import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicEnv } from "@/lib/supabase/env";

const PROTECTED = ["/dashboard", "/reset-password"];

/**
 * Refreshes the Supabase session cookie and keeps signed-out visitors away
 * from account pages. This is a convenience layer only: every protected page
 * and API route verifies the user again on the server.
 */
export async function proxy(request: NextRequest) {
  const env = supabasePublicEnv();
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));
  if (!env) {
    return isProtected ? NextResponse.redirect(new URL("/login", request.url)) : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getUser() validates the token with Supabase Auth; it does not trust the cookie.
  const { data } = await supabase.auth.getUser();

  if (isProtected && !data.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    const redirect = NextResponse.redirect(login);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  // Only routes that depend on a session. Public marketing pages stay static and cacheable.
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/:path*"],
};
