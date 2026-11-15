import type { Metadata } from "next";
import { AuthForm, AuthLink } from "@/components/AuthForm";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthForm
      action={signUp}
      title="Create your account"
      intro="We'll email you a link to confirm your address."
      submitLabel="Create account"
      fields={["email", "new-password"]}
      footer={<p>Already have an account? <AuthLink href="/login">Log in</AuthLink></p>}
    />
  );
}
