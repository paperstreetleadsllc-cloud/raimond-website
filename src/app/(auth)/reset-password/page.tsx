import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getVerifiedUser } from "@/lib/auth";
import { updatePassword } from "../actions";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // Reached through a verified recovery link, which signs the user in.
  if (!(await getVerifiedUser().catch(() => null))) redirect("/login?m=link");
  return <AuthForm action={updatePassword} title="Choose a new password" submitLabel="Save password" fields={["new-password"]} />;
}
