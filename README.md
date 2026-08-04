# Latter House Life Planner

A daily planner (tasks, habits, journal) built with Next.js, with two
Stripe-powered paid tiers.

- **Free**: daily tasks, up to 3 habits.
- **Basic ($4.99/mo or $49.99/yr)**: unlimited habits.
- **Premium ($9.99/mo or $99.99/yr)**: unlimited habits + journaling.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Clerk](https://clerk.com) for authentication — plan status is stored
  on the Clerk user's metadata, so no separate database is needed.
- [Stripe](https://stripe.com) Checkout + Customer Portal for billing.
  Planner data (tasks/habits/journal) is stored in the browser's
  `localStorage` to keep hosting costs at zero for this early-stage app.

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` from your
     [Clerk dashboard](https://dashboard.clerk.com).
   - `STRIPE_SECRET_KEY` from your
     [Stripe dashboard](https://dashboard.stripe.com/acct_1TTFvBBVXT4fIGfv/apikeys)
     ("Latter House Life sandbox" account).
   - `STRIPE_PRICE_ID_BASIC_MONTHLY` / `STRIPE_PRICE_ID_BASIC_ANNUAL` /
     `STRIPE_PRICE_ID_PREMIUM_MONTHLY` / `STRIPE_PRICE_ID_PREMIUM_ANNUAL` —
     already created for you (see `.env.example`); replace if you change
     pricing.
   - `STRIPE_WEBHOOK_SECRET` — run `stripe listen --forward-to
     localhost:3000/api/stripe/webhook` locally and use the secret it
     prints, or grab it from the Dashboard once a hosted webhook endpoint
     is configured pointing at `/api/stripe/webhook`.
2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## How the subscription flow works

1. A signed-in user picks a plan and interval (e.g. Basic $4.99/mo, or
   Premium $99.99/yr) on `/dashboard`, which calls
   `POST /api/stripe/checkout` to create a Stripe Checkout Session and
   redirects them to it.
2. Stripe sends webhook events to `POST /api/stripe/webhook` for
   `customer.subscription.created` / `.updated` / `.deleted` and
   `invoice.payment_failed`. The handler reads the subscription's price ID,
   maps it back to `"basic"` or `"premium"`, and stores it as
   `publicMetadata.plan` on the Clerk user (and the Stripe customer/
   subscription IDs in `privateMetadata`) — cleared back to `null` if the
   subscription isn't active.
3. Basic/Premium users can click "Manage billing" to open the Stripe
   Customer Portal (`POST /api/stripe/portal`) to update payment methods,
   change plans, or cancel.

## Deploying

Deploy to any Next.js host (e.g. [Vercel](https://vercel.com/new) or
[Netlify](https://www.netlify.com), both have free tiers). After
deploying, add a Stripe webhook endpoint in the
[Dashboard](https://dashboard.stripe.com/webhooks) pointing at
`https://<your-domain>/api/stripe/webhook`, subscribed to
`customer.subscription.created`, `customer.subscription.updated`,
`customer.subscription.deleted`, and `invoice.payment_failed`.
