import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AuthNotConfiguredError, supabasePublicEnv } from "./env";

/**
 * Supabase client bound to the visitor's session cookies. It carries the
 * visitor's own permissions, so every query is subject to row-level security.
 */
export async function createSessionClient() {
  const env = supabasePublicEnv();
  if (!env) throw new AuthNotConfiguredError();
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies; the proxy refreshes sessions instead.
        }
      },
    },
  });
}
