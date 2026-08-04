import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const value = invoice.parent?.subscription_details?.subscription;
  return typeof value === "string" ? value : value?.id;
}

async function setPremiumStatus(
  clerkUserId: string,
  premium: boolean,
  stripeStatus: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { premium, stripeStatus },
    ...(stripeCustomerId || stripeSubscriptionId
      ? { privateMetadata: { stripeCustomerId, stripeSubscriptionId } }
      : {}),
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
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.client_reference_id;
      if (clerkUserId && session.mode === "subscription") {
        await setPremiumStatus(
          clerkUserId,
          true,
          "active",
          session.customer as string | undefined,
          session.subscription as string | undefined,
        );
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const clerkUserId = subscription.metadata?.clerkUserId;
      if (clerkUserId) {
        const premium = ["active", "trialing"].includes(subscription.status);
        await setPremiumStatus(
          clerkUserId,
          premium,
          subscription.status,
          subscription.customer as string,
          subscription.id,
        );
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (subscriptionId) {
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const clerkUserId = subscription.metadata?.clerkUserId;
        if (clerkUserId) {
          const premium = ["active", "trialing"].includes(subscription.status);
          await setPremiumStatus(clerkUserId, premium, subscription.status);
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
