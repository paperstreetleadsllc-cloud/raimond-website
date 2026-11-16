import type { Metadata } from "next";
import { AuthForm, AuthLink } from "@/components/AuthForm";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      action={requestPasswordReset}
      title="Reset your password"
      intro="Enter your email and we'll send you a reset link."
      submitLabel="Send reset link"
      fields={["email"]}
      footer={<p><AuthLink href="/login">Back to log in</AuthLink></p>}
    />
  );
}
