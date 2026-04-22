# PulsePeak Release Checklist

This checklist is for the current V1 soft launch build.

## Environment

Set these before launch:

- `PORT`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Optional Stripe fallback values:

- `STRIPE_PREMIUM_PRICE_CENTS`
- `STRIPE_PREMIUM_CURRENCY`

## Stripe Setup

Before opening access to paying users:

- Confirm the live or test Stripe product is the monthly Premium plan
- Confirm `STRIPE_PRICE_ID` points to the correct recurring price
- Confirm Checkout success URL returns to `/billing/success`
- Confirm Checkout cancel URL returns to `/billing/cancel`
- Confirm the Billing Portal is enabled in Stripe
- Confirm the webhook endpoint is registered and signed
- Confirm Stripe forwards to `/api/webhook` in local and deployed testing

## Required Webhook Events

Subscribe Stripe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Important:

- Premium entitlement must come from webhook-confirmed backend state
- Redirect success alone is not enough

## Pre-Launch Test Flows

Run these before soft launch:

1. New user
   - register
   - complete onboarding
   - land on tailored dashboard
   - verify coach, modules, and weekly plan preview match profile

2. Free user
   - open weekly plan preview
   - open coach
   - open progress
   - verify upgrade prompts appear only in free-user surfaces

3. Movement system
   - open a workout movement reference
   - open a mobility movement reference
   - verify image-backed movement media renders
   - verify a no-media movement uses the polished fallback state

4. Upgrade flow
   - click `Unlock full plan`
   - verify Stripe Checkout opens
   - complete payment in test mode
   - return to `/billing/success`
   - verify premium unlock persists after reload
   - verify webhook delivery succeeds against `/api/webhook`

5. Premium user
   - open full weekly plan
   - open coach
   - open progress
   - verify no free-user upgrade prompts remain

6. Billing portal
   - open `Billing & subscription`
   - verify portal opens
   - verify payment method update and cancellation path are available

7. Returning user
   - log out
   - log back in
   - verify data, tier, preferences, and theme persist

## Post-Launch Checks

After soft launch:

- Monitor Stripe webhook delivery status
- Confirm no subscription events are failing signature validation
- Confirm new users finish onboarding successfully
- Confirm dashboard loads cleanly with empty and active accounts
- Confirm weekly plan gating matches free vs premium state
- Confirm movement detail modals continue rendering on desktop and mobile

## Known Limitations

- Persistence is still JSON-file based and is not ideal for high-concurrency production use
- Some movements still use the polished fallback media state until more assets are added
- `invoice.payment_failed` currently downgrades access to `free` with `past_due`
- There is no grace-period billing policy yet
- There is no full in-app billing history page yet

## Recommended Launch Commands

```bash
npm install
npm run build
npm start
```

Open:

- `http://127.0.0.1:3001/`

## Soft Launch Exit Criteria

PulsePeak is ready for soft launch when:

- build passes
- onboarding completes cleanly
- dashboard modules adapt correctly
- free upgrade prompts behave correctly
- Stripe Checkout opens correctly
- webhook-driven premium access persists correctly
- premium weekly plan, coach, progress, and movement instruction flows all work
