import Stripe from "stripe";

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

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  annual: process.env.STRIPE_PRICE_ID_ANNUAL ?? "",
} as const;

export type BillingInterval = keyof typeof STRIPE_PRICE_IDS;
