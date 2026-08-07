import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { getStripe, planForPriceId } from "@/lib/stripe";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const value = invoice.parent?.subscription_details?.subscription;
  return typeof value === "string" ? value : value?.id;
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

async function syncSubscription(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerkUserId;
  if (!clerkUserId) return;

  const active = ACTIVE_STATUSES.has(subscription.status);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = active ? (planForPriceId(priceId) ?? null) : null;

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { plan, stripeStatus: subscription.status },
    privateMetadata: {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe signature or webhook secret" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (subscriptionId) {
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
