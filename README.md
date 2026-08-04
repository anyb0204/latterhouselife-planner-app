# Latter House Life Planner

A daily planner (tasks, habits, journal) built with Next.js, with a
Stripe-powered Premium subscription.

- **Free**: daily tasks, up to 3 habits.
- **Premium ($5/mo or $50/yr)**: unlimited habits + journaling.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Clerk](https://clerk.com) for authentication — premium status is stored
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
   - `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_ANNUAL` — already created
     for you (see `.env.example`); replace if you change pricing.
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

1. A signed-in user clicks "$5/month" or "$50/year" on `/dashboard`, which
   calls `POST /api/stripe/checkout` to create a Stripe Checkout Session
   and redirects them to it.
2. On successful payment, Stripe sends webhook events to
   `POST /api/stripe/webhook`, which sets `publicMetadata.premium = true`
   on the Clerk user (and stores the Stripe customer/subscription IDs in
   `privateMetadata`).
3. `customer.subscription.updated` / `.deleted` and
   `invoice.payment_failed` keep that status in sync as the subscription
   changes.
4. Premium users can click "Manage billing" to open the Stripe Customer
   Portal (`POST /api/stripe/portal`) to update payment methods, change
   plans, or cancel.

## Deploying

Deploy to any Next.js host (e.g. [Vercel](https://vercel.com/new) or
[Netlify](https://www.netlify.com), both have free tiers). After
deploying, add a Stripe webhook endpoint in the
[Dashboard](https://dashboard.stripe.com/webhooks) pointing at
`https://<your-domain>/api/stripe/webhook`, subscribed to
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`, and `invoice.payment_failed`.
