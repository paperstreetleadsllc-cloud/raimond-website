import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm, AuthLink } from "@/components/AuthForm";
import { getVerifiedUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/auth-rules";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

const MESSAGES: Record<string, string> = {
  link: "That link is invalid or has expired. Log in, or request a new link.",
  signedout: "You have been logged out.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; m?: string }> }) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (await getVerifiedUser().catch(() => null)) redirect(next);
  return (
    <AuthForm
      action={signIn}
      title="Log in"
      intro={params.m ? MESSAGES[params.m] : undefined}
      submitLabel="Log in"
      fields={["email", "password"]}
      next={next}
      footer={
        <>
          <p><AuthLink href="/forgot-password">Forgot your password?</AuthLink></p>
          <p>New here? <AuthLink href="/signup">Create an account</AuthLink></p>
        </>
      }
    />
  );
}
