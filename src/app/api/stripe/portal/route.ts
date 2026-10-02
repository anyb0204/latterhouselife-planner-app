import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import type { PlannerPrivateMetadata } from "@/lib/premium";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { stripeCustomerId } = (user.privateMetadata ?? {}) as PlannerPrivateMetadata;

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found for this user yet" },
      { status: 400 },
    );
  }

  const origin = req.nextUrl.origin;
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
