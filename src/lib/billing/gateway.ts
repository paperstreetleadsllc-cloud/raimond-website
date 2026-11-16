import "server-only";
import type Stripe from "stripe";
import type { StripeGateway, SubscriptionSnapshot } from "./service";

/** Adapts the Stripe SDK to the small interface the billing service needs. */
export function stripeGateway(stripe: Stripe): StripeGateway {
  return {
    async createCustomer({ userId, email }) {
      const customer = await stripe.customers.create(
        { email: email ?? undefined, metadata: { supabase_user_id: userId } },
        { idempotencyKey: `raimondai-customer-${userId}` },
      );
      return { id: customer.id, livemode: customer.livemode };
    },

    async getCustomerOwner(customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) return null;
        return { userId: customer.metadata?.supabase_user_id ?? null };
      } catch {
        return null;
      }
    },

    async createCheckoutSession({ customerId, priceId, userId, plan, successUrl, cancelUrl }) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: userId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: { metadata: { supabase_user_id: userId, plan } },
        metadata: { supabase_user_id: userId, plan },
      });
      return { id: session.id, url: session.url };
    },

    async createPortalSession({ customerId, returnUrl }) {
      const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
      return { url: portal.url };
    },

    async listSubscriptions(customerId) {
      const list = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
      return list.data.map((sub): SubscriptionSnapshot => {
        const item = sub.items.data[0];
        return {
          id: sub.id,
          status: sub.status,
          created: sub.created,
          priceId: item?.price?.id ?? null,
          currentPeriodEnd: item?.current_period_end ?? null,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          livemode: sub.livemode,
        };
      });
    },
  };
}
