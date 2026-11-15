import { NextResponse } from "next/server";
import { UnauthenticatedError } from "@/lib/auth";
import { BillingError } from "@/lib/billing/service";
import { BillingNotConfiguredError } from "@/lib/billing/stripe";
import { AuthNotConfiguredError } from "@/lib/supabase/env";

export function billingErrorResponse(err: unknown, event: string) {
  if (err instanceof UnauthenticatedError) return NextResponse.json({ error: "Please log in.", code: "UNAUTHENTICATED" }, { status: 401 });
  if (err instanceof BillingError) return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  if (err instanceof BillingNotConfiguredError || err instanceof AuthNotConfiguredError) {
    console.error(JSON.stringify({ event: "billing_not_configured", detail: err.message }));
    return NextResponse.json({ error: "Billing is not available yet.", code: "BILLING_UNAVAILABLE" }, { status: 503 });
  }
  console.error(JSON.stringify({ event, detail: String(err) }));
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
