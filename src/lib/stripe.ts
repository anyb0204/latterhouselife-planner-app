import Stripe from "stripe";
import type { PlanTier } from "./premium";

let cachedStripe: Stripe | null = null;

// Constructed lazily (on first use) rather than at module load, so routes
// that import this file don't crash the build when secrets aren't present
// in the build environment.
export function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }
  cachedStripe = new Stripe(secretKey, {
    apiVersion: "2026-07-29.dahlia",
  });
  return cachedStripe;
}

export type BillingInterval = "monthly" | "annual";

export const STRIPE_PRICE_IDS: Record<PlanTier, Record<BillingInterval, string>> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_ID_BASIC_ANNUAL ?? "",
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL ?? "",
  },
};

export function planForPriceId(priceId: string | null | undefined): PlanTier | undefined {
  if (!priceId) return undefined;
  return (Object.keys(STRIPE_PRICE_IDS) as PlanTier[]).find(
    (plan) =>
      STRIPE_PRICE_IDS[plan].monthly === priceId ||
      STRIPE_PRICE_IDS[plan].annual === priceId,
  );
}
