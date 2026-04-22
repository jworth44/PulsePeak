# Stripe Setup

This app uses Stripe Checkout for upgrading to Premium, Stripe Billing Portal for subscription management, and a signed webhook for backend entitlement sync.

## Required Stripe product and price

Create one recurring monthly Stripe price for the Premium subscription.

Recommended setup:
- Product name: `Premium Plan`
- Billing model: recurring monthly subscription
- One active price ID used by the app

The app expects a single price in Stripe and reads it from `STRIPE_PRICE_ID`.

## Required environment variables

Set these in your local or deployed environment:

```env
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_key
```

Notes:
- `STRIPE_SECRET_KEY` stays backend-only
- `VITE_STRIPE_PUBLISHABLE_KEY` is frontend-safe
- `STRIPE_WEBHOOK_SECRET` must match the webhook endpoint signing secret from Stripe
- `STRIPE_PRICE_ID` should point to the monthly Premium price

## Webhook endpoint configuration

Configure this endpoint in Stripe:

```text
https://your-domain.com/api/webhook
```

Use the signing secret from that webhook endpoint as `STRIPE_WEBHOOK_SECRET`.

Compatibility note:
- `POST /api/webhook` is now the canonical path for Stripe forwarding and local testing
- `POST /api/stripe/webhook` remains available as a safe compatibility alias

For local testing with Stripe CLI, use:

```bash
stripe.exe listen --forward-to localhost:3001/api/webhook
```

The webhook must send these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## What the webhook updates

Stripe webhook processing updates these user fields:
- `tier`
- `subscriptionStatus`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `currentPeriodEnd`

Premium entitlement is based on backend state, not the browser redirect.

Current entitlement rule:
- Premium if `tier === "premium"`
- Premium if `subscriptionStatus === "active"`
- Premium if `subscriptionStatus === "trialing"`

## Billing portal

The app exposes a `Manage Subscription` button for users with a billing profile or Premium access.

That opens Stripe Billing Portal so the user can:
- update payment method
- cancel the subscription

## How to test

### Successful checkout
1. Sign in as a free user.
2. Open the weekly plan preview.
3. Choose `Unlock full plan`.
4. Complete Stripe Checkout with a valid test card.
5. Confirm Stripe returns to `/billing/success`.
6. Confirm the webhook upgrades the user.
7. Refresh the app and confirm the user stays Premium.

Expected user state:
- `tier: "premium"`
- `subscriptionStatus: "active"` or `trialing`
- weekly plan opens without preview messaging

### Billing portal
1. Sign in as a Premium user.
2. Select `Manage Subscription`.
3. Confirm Stripe Billing Portal opens.
4. Confirm payment method management is available.

### Cancellation
1. Open `Manage Subscription`.
2. Cancel the subscription in Stripe Billing Portal.
3. Wait for the webhook to deliver `customer.subscription.deleted`.
4. Refresh the app.

Expected user state:
- `tier: "free"`
- `subscriptionStatus: "canceled"`
- weekly plan returns to locked preview behavior

### Payment failure
1. Trigger a failed invoice/payment in Stripe test mode.
2. Wait for `invoice.payment_failed` webhook delivery.
3. Refresh the app.

Expected user state:
- `tier: "free"`
- `subscriptionStatus: "past_due"`
- weekly plan is locked again

## Current behavior decisions

- `invoice.payment_failed` currently downgrades the user to `free` and sets `subscriptionStatus` to `past_due`
- There is no grace period right now
- Browser return from Stripe does not grant Premium on its own
- Webhook processing is idempotent and ignores duplicate event IDs

## Success checklist

Stripe is correctly configured when:
- checkout session creation works
- billing portal opens
- webhook deliveries succeed with signature verification
- duplicate webhook retries do not re-process the same event
- auth session reload reflects the latest subscription state
- Premium UI stays unlocked after reload for active subscriptions
