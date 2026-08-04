import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getStripe, STRIPE_PRICE_IDS, type BillingInterval } from "@/lib/stripe";
import type { PlannerPrivateMetadata } from "@/lib/premium";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const interval = body.interval as BillingInterval;
  const priceId = STRIPE_PRICE_IDS[interval];
  if (!priceId) {
    return NextResponse.json(
      { error: "interval must be 'monthly' or 'annual'" },
      { status: 400 },
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { stripeCustomerId } = (user.privateMetadata ?? {}) as PlannerPrivateMetadata;
  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;

  const origin = req.nextUrl.origin;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: primaryEmail }),
    client_reference_id: userId,
    subscription_data: {
      metadata: { clerkUserId: userId },
    },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
