export type PlanKey = "monitor" | "growth" | "authority";

export const PLAN_KEYS: PlanKey[] = ["monitor", "growth", "authority"];

const ENV_BY_PLAN: Record<PlanKey, string> = {
  monitor: "STRIPE_PRICE_MONITOR",
  growth: "STRIPE_PRICE_GROWTH",
  authority: "STRIPE_PRICE_AUTHORITY",
};

/**
 * The only prices checkout will ever use. The browser sends a plan name; the
 * server looks up the Stripe Price ID here. A price ID from the browser is never used.
 */
export function priceAllowlist(env: NodeJS.ProcessEnv = process.env): Partial<Record<PlanKey, string>> {
  const out: Partial<Record<PlanKey, string>> = {};
  for (const plan of PLAN_KEYS) {
    const id = env[ENV_BY_PLAN[plan]]?.trim();
    if (id && /^price_[A-Za-z0-9]+$/.test(id)) out[plan] = id;
  }
  return out;
}

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && (PLAN_KEYS as string[]).includes(value);
}

export function planForPrice(priceId: string | null | undefined, env: NodeJS.ProcessEnv = process.env): PlanKey | null {
  if (!priceId) return null;
  const allow = priceAllowlist(env);
  return PLAN_KEYS.find((plan) => allow[plan] === priceId) ?? null;
}
