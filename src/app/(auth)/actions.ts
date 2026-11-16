"use server";

import { redirect } from "next/navigation";
import { normalizeEmail, passwordProblem, safeNextPath } from "@/lib/auth-rules";
import { siteUrl } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export interface FormState {
  error?: string;
  notice?: string;
}

const GENERIC = "Something went wrong. Please try again.";

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normalizeEmail(form.get("email"));
  const password = String(form.get("password") ?? "");
  if (!email) return { error: "Enter a valid email address." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl()}/auth/confirm` },
    });
    if (error && error.code === "weak_password") return { error: "Choose a stronger password." };
    if (error && error.status === 429) return { error: "Too many attempts. Please wait a few minutes." };
    if (error && error.code !== "user_already_exists") {
      console.error(JSON.stringify({ event: "signup_error", code: error.code }));
      return { error: GENERIC };
    }
  } catch (err) {
    console.error(JSON.stringify({ event: "signup_exception", detail: String(err) }));
    return { error: GENERIC };
  }
  // Same message whether or not the address already has an account.
  return { notice: "Check your email for a link to confirm your account." };
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normalizeEmail(form.get("email"));
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(form.get("next"));
  if (!email || !password) return { error: "Enter your email and password." };

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status === 429) return { error: "Too many attempts. Please wait a few minutes." };
      return { error: "Incorrect email or password. If you just signed up, confirm your email first." };
    }
  } catch (err) {
    console.error(JSON.stringify({ event: "signin_exception", detail: String(err) }));
    return { error: GENERIC };
  }
  redirect(next);
}

export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normalizeEmail(form.get("email"));
  if (!email) return { error: "Enter a valid email address." };
  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password` });
    if (error?.status === 429) return { error: "Too many attempts. Please wait a few minutes." };
  } catch (err) {
    console.error(JSON.stringify({ event: "reset_request_exception", detail: String(err) }));
    return { error: GENERIC };
  }
  return { notice: "If that address has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  try {
    const supabase = await createSessionClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { error: "This reset link has expired. Request a new one." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.code === "same_password" ? "Choose a password you haven't used here before." : "Could not update the password. Request a new reset link." };
    // End every other session so a stolen session cannot outlive the reset.
    await supabase.auth.signOut({ scope: "others" });
  } catch (err) {
    console.error(JSON.stringify({ event: "password_update_exception", detail: String(err) }));
    return { error: GENERIC };
  }
  redirect("/dashboard?password=updated");
}
