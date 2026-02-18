import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fastifyRawBody from "fastify-raw-body";
import Stripe from "stripe";
import { z } from "zod";
import { config } from "../lib/config.js";
import { BillingPlanSchema, BillingStatusSchema, type BillingPlan } from "../domain/types.js";
import type { AeoStore } from "../storage/store.js";

const checkoutSchema = z.object({
  email: z.string().email(),
  plan: BillingPlanSchema,
});

const portalQuerySchema = z.object({
  email: z.string().email(),
});

const planPriceMap: Record<BillingPlan, { amount: number; name: string }> = {
  starter: { amount: 4900, name: "AEO Starter" },
  pro: { amount: 14900, name: "AEO Pro" },
  agency: { amount: 39900, name: "AEO Agency" },
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const createStripeClient = (): Stripe => {
  if (!config.stripeSecretKey) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  return new Stripe(config.stripeSecretKey);
};

const parsePlanFromPrice = (priceNickname?: string | null): BillingPlan | undefined => {
  if (!priceNickname) {
    return undefined;
  }
  const normalized = priceNickname.toLowerCase();
  if (normalized.includes("starter")) {
    return "starter";
  }
  if (normalized.includes("agency")) {
    return "agency";
  }
  if (normalized.includes("pro")) {
    return "pro";
  }
  return undefined;
};

export const billingRoutes = (store: AeoStore): FastifyPluginAsync => {
  const plugin: FastifyPluginAsync = async (app) => {
    await app.register(fastifyRawBody, {
      field: "rawBody",
      global: false,
      encoding: "utf8",
      runFirst: true,
    });

    const createCheckoutSessionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = checkoutSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
      }

      try {
        const stripe = createStripeClient();
        const email = normalizeEmail(parsed.data.email);
        const existing = await store.getBillingCustomerByEmail(email);
        const customerId = existing?.customerId
          ? existing.customerId
          : (
              await stripe.customers.create({
                email,
              })
            ).id;

        const selectedPlan = planPriceMap[parsed.data.plan];
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: customerId,
          success_url: `${config.frontendAppUrl}/pricing?status=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${config.frontendAppUrl}/pricing?status=cancelled`,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: selectedPlan.amount,
                recurring: { interval: "month" },
                product_data: {
                  name: selectedPlan.name,
                },
              },
              quantity: 1,
            },
          ],
          customer_update: {
            name: "auto",
            address: "auto",
          },
          metadata: {
            email,
            plan: parsed.data.plan,
          },
        });

        await store.upsertBillingCustomer({
          email,
          customerId,
          status: "pending",
          plan: parsed.data.plan,
          checkoutSessionId: session.id,
          updatedAt: new Date().toISOString(),
        });

        return reply.status(201).send({
          data: {
            checkoutUrl: session.url,
            sessionId: session.id,
          },
        });
      } catch (error) {
        if (error instanceof Error && error.message === "STRIPE_NOT_CONFIGURED") {
          return reply.status(503).send({ error: "BILLING_NOT_CONFIGURED" });
        }
        throw error;
      }
    };

    const customerPortalHandler = async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = portalQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
      }

      try {
        const stripe = createStripeClient();
        const email = normalizeEmail(parsed.data.email);
        const billingCustomer = await store.getBillingCustomerByEmail(email);
        if (!billingCustomer?.customerId) {
          return reply.status(404).send({ error: "BILLING_CUSTOMER_NOT_FOUND" });
        }

        const portal = await stripe.billingPortal.sessions.create({
          customer: billingCustomer.customerId,
          return_url: `${config.frontendAppUrl}/pricing`,
        });

        return {
          data: {
            portalUrl: portal.url,
          },
        };
      } catch (error) {
        if (error instanceof Error && error.message === "STRIPE_NOT_CONFIGURED") {
          return reply.status(503).send({ error: "BILLING_NOT_CONFIGURED" });
        }
        throw error;
      }
    };

    const webhookHandler = async (request: FastifyRequest, reply: FastifyReply) => {
      const webhookSecret = config.stripeWebhookSecret ?? "";
      if (!webhookSecret) {
        return reply.status(503).send({ error: "WEBHOOK_NOT_CONFIGURED" });
      }

      let stripe: Stripe;
      try {
        stripe = createStripeClient();
      } catch {
        return reply.status(503).send({ error: "BILLING_NOT_CONFIGURED" });
      }

      const signatureHeader = request.headers["stripe-signature"];
      const signature = Array.isArray(signatureHeader)
        ? signatureHeader[0]
        : signatureHeader;
      if (!signature) {
        return reply.status(400).send({ error: "MISSING_SIGNATURE" });
      }

      const rawBodyField = (request as { rawBody?: string }).rawBody;
      const rawBody = typeof rawBodyField === "string" ? rawBodyField : "";
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature as string, webhookSecret);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid signature";
        return reply.status(400).send({ error: "INVALID_WEBHOOK_SIGNATURE", message });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = normalizeEmail(
          session.customer_details?.email ?? (session.metadata?.email ?? ""),
        );
        if (email) {
          await store.upsertBillingCustomer({
            email,
            customerId: typeof session.customer === "string" ? session.customer : undefined,
            subscriptionId:
              typeof session.subscription === "string" ? session.subscription : undefined,
            checkoutSessionId: session.id,
            plan:
              (session.metadata?.plan as BillingPlan | undefined) ??
              parsePlanFromPrice(session.metadata?.price_nickname),
            status: "active",
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted"
      ) {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : undefined;
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          const email =
            !customer.deleted && customer.email
              ? normalizeEmail(customer.email)
              : undefined;
          if (email) {
            const firstItem = subscription.items.data[0];
            const status = BillingStatusSchema.catch("none").parse(subscription.status);
            await store.upsertBillingCustomer({
              email,
              customerId,
              subscriptionId: subscription.id,
              plan: parsePlanFromPrice(firstItem?.price.nickname),
              priceId: firstItem?.price.id,
              status,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      /**
       * TODO(auth-migration):
       * - Replace email-keyed billing records with authenticated user IDs from Supabase.
       * - Store billing relationships in Postgres (user_id <-> stripe_customer_id).
       * - Restrict checkout/portal endpoints to the signed-in user only.
       */
      return reply.status(200).send({ received: true });
    };

    for (const path of ["/billing/create-checkout-session", "/v1/billing/create-checkout-session"]) {
      app.post(path, createCheckoutSessionHandler);
    }
    for (const path of ["/billing/customer-portal", "/v1/billing/customer-portal"]) {
      app.get(path, customerPortalHandler);
    }
    for (const path of ["/billing/webhook", "/v1/billing/webhook"]) {
      app.post(path, { config: { rawBody: true } }, webhookHandler);
    }
  };

  return plugin;
};
