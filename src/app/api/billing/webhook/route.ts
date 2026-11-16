import { NextResponse, type NextRequest } from "next/server";
import { billingDeps } from "@/lib/billing/context";
import { handleWebhookEvent, type WebhookEvent } from "@/lib/billing/service";
import { BillingNotConfiguredError, getStripe } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Receives Stripe events. Nothing is trusted until the signature is verified against the raw body. */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: WebhookEvent;
  try {
    const raw = await req.text();
    event = (await getStripe().webhooks.constructEventAsync(raw, signature, secret)) as unknown as WebhookEvent;
  } catch (err) {
    if (err instanceof BillingNotConfiguredError) return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const outcome = await handleWebhookEvent(event, billingDeps());
    console.log(JSON.stringify({ event: "stripe_webhook", id: event.id, type: event.type, outcome }));
    return NextResponse.json({ received: true, outcome });
  } catch (err) {
    console.error(JSON.stringify({ event: "stripe_webhook_error", id: event.id, type: event.type, detail: String(err) }));
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
