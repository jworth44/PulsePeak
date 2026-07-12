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
- `PULSEPEAK_DB_PATH=/data/pulsepeak-db.json`

`render.yaml` now mounts a 1 GB persistent disk at `/data` and points
`PULSEPEAK_DB_PATH` there, so user data **survives deploys and restarts**.
The store auto-creates the directory and seeds an empty DB on first boot —
no manual setup needed. Render disks require a paid instance (Starter+);
a free web service cannot mount one.

For a throwaway demo with no data retention you can override
`PULSEPEAK_DB_PATH=/tmp/pulsepeak-db.json` (ephemeral), but the persistent
`/data` default is correct for anything real.

## Stripe webhook

Point the Stripe webhook at:

- `https://your-render-service.onrender.com/api/webhook`

The app also supports the legacy path:

- `https://your-render-service.onrender.com/api/stripe/webhook`
