import "server-only";
import type { User } from "@supabase/supabase-js";
import { createSessionClient } from "./supabase/server";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthenticatedError";
  }
}

/**
 * The signed-in user, verified with Supabase Auth on every call.
 * Returns null for missing, expired, or tampered sessions.
 */
export async function getVerifiedUser(): Promise<User | null> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireUser(): Promise<User> {
  const user = await getVerifiedUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}
