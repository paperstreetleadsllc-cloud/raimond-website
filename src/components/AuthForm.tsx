"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/(auth)/actions";

interface Props {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  title: string;
  submitLabel: string;
  fields: ("email" | "password" | "new-password")[];
  next?: string;
  footer?: React.ReactNode;
  intro?: string;
}

export function AuthForm({ action, title, submitLabel, fields, next, footer, intro }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-md p-7 sm:p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {intro ? <p className="mt-2 text-slate-600">{intro}</p> : null}
        {state.notice ? (
          <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-900">{state.notice}</p>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            {next ? <input type="hidden" name="next" value={next} /> : null}
            {fields.includes("email") ? (
              <label className="block text-sm font-medium text-ink">
                Email
                <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base" />
              </label>
            ) : null}
            {fields.includes("password") ? (
              <label className="block text-sm font-medium text-ink">
                Password
                <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base" />
              </label>
            ) : null}
            {fields.includes("new-password") ? (
              <label className="block text-sm font-medium text-ink">
                Password
                <input name="password" type="password" required minLength={10} autoComplete="new-password" aria-describedby="pw-hint" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base" />
                <span id="pw-hint" className="mt-1 block text-xs font-normal text-slate-500">At least 10 characters, with a letter and a number.</span>
              </label>
            ) : null}
            {state.error ? <p role="alert" className="text-sm text-rose-700">{state.error}</p> : null}
            <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Working…" : submitLabel}</button>
          </form>
        )}
        {footer ? <div className="mt-6 space-y-2 text-sm text-slate-600">{footer}</div> : null}
      </div>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="font-medium text-teal-ink underline-offset-4 hover:underline">{children}</Link>;
}
