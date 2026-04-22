# PulsePeak Staging Deploy

## Recommended staging host

Use a single Render web service with the included `render.yaml`.

Why this is the cleanest path:
- the frontend already builds to `dist`
- the Express server already serves `dist`
- the frontend already calls `/api` on the same origin
- Stripe return URLs can stay on the same host

## Build and start

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/api/health`

## Required environment variables

- `APP_ORIGIN`
- `CORS_ALLOWED_ORIGINS`
- `PULSEPEAK_DB_PATH`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Suggested staging values

- `APP_ORIGIN=https://your-render-service.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://your-render-service.onrender.com`
- `PULSEPEAK_DB_PATH=/tmp/pulsepeak-db.json`

`/tmp/pulsepeak-db.json` is the lowest-manual-work staging path. It is fine for staging, but data is ephemeral and can reset on restart or redeploy.

If you want persistent staging data later, point `PULSEPEAK_DB_PATH` to a mounted disk path instead.

## Stripe webhook

Point the Stripe webhook at:

- `https://your-render-service.onrender.com/api/webhook`

The app also supports the legacy path:

- `https://your-render-service.onrender.com/api/stripe/webhook`
