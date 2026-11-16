/** Public Supabase settings. The anon key is designed to be exposed; RLS protects the data. */
export function supabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    this.name = "AuthNotConfiguredError";
  }
}

/**
 * Base URL for links we generate (email confirmations, Stripe return URLs).
 * Always derived from server configuration, never from the request.
 */
export function siteUrl(): string {
  if (process.env.VERCEL_ENV === "preview") {
    const host = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
    if (host) return `https://${host}`;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
