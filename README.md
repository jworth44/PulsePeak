# PulsePeak Fitness

PulsePeak is a full-stack health and fitness app with authentication, a synced dashboard, meal logging, recovery tracking, and a structured workout system for both gym and home users.

## Current features

### Free
- Account creation and login
- Dashboard with calories, protein, hydration, recovery, and training metrics
- Meal logging with instant metric updates
- Recovery tracking for sleep and energy
- Gym and home workout preset library
- Workout detail modal before logging
- Workout filtering by environment and workout type
- Recent workouts and basic workout streak tracking
- Basic rule-based coaching and habits

### Premium foundation
- Personalized Weekly Plan premium feature
- Locked weekly plan preview for free users
- Session-only full plan preview flow
- Stripe Checkout upgrade flow
- Free vs premium feature boundaries shown in the UI

## Tech stack

- React + Vite frontend
- Express backend
- Local JSON persistence in `server/data/db.json`
- Playwright-based smoke test for end-to-end verification
- Stripe Checkout for Premium subscriptions

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Build the frontend:

```bash
npm run build
```

3. Start the app:

```bash
npm start
```

4. Open:

`http://127.0.0.1:3001/`

## Test on a phone over local Wi-Fi

Use the dev stack so Vite prints both the local and network URLs:

```bash
npm run dev
```

Look for output like:

```text
Local:   http://localhost:5173/
Network: http://192.168.1.42:5173/
```

Then open the `Network` URL on your phone while both devices are on the same Wi-Fi.

If Windows prompts for firewall access, allow Node on the private network so the phone can reach the dev server.

## Stripe setup

Add these environment variables before testing payments:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID` (optional if you want to use a dashboard-managed recurring price)
- `STRIPE_PREMIUM_PRICE_CENTS` (optional fallback if no price ID is provided)
- `STRIPE_PREMIUM_CURRENCY` (optional, defaults to `usd`)

If `STRIPE_PRICE_ID` is omitted, the app creates the monthly Premium Plan price inline using the fallback amount and currency.

## Workout flow

1. Open the dashboard
2. Filter workouts by:
   - environment: `Both`, `Gym`, `Home`
   - type: `All`, `Strength`, `Cardio`, `Mobility`
3. Click `View details` to inspect the full exercise list and equipment
4. Click `Log workout`
5. Watch the dashboard update:
   - total workout minutes
   - recent workouts
   - training streak

## Validation used in this project

The app has been validated with real runtime checks:
- backend starts successfully
- frontend builds successfully
- signup/login works
- meal logging works
- workout preset logging works
- dashboard metrics update
- workout details render in the UI
- weekly plan preview opens and closes cleanly
- premium weekly plan is gated for free users

## Notes

- This is still a prototype-grade persistence layer and uses local JSON storage.
- Stripe upgrade flow requires real Stripe test keys in the environment before checkout can be verified live.
