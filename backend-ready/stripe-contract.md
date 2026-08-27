# Full Trip / Stripe contract

Full Trip is £24.99 one-off for one trip.

## Checkout creation

Server-side only:
1. Require an authenticated user.
2. Load the trip and confirm the authenticated user is the organiser.
3. Reject creation if the trip already has an active or valid pending Full Trip purchase.
4. Create the Stripe Checkout Session with server-owned product/price configuration.
5. Attach stable metadata such as `trip_id`, `organiser_id` and an internal purchase id.
6. Persist pending purchase state server-side.

Never trust a browser-supplied trip owner, amount, currency or activation flag.

## Return route

`/payment/return` is presentation only. It may show that Stripe redirected the user back, but it must not be the source of truth for activating Full Trip.

## Webhook

The webhook is authoritative for payment state. Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`, match the event to the stored purchase/trip and update state idempotently.

Handle at minimum:
- checkout/payment completed;
- payment failed/expired where relevant;
- refund/reversal if supported by the commercial policy.

Webhook processing must be safe to run more than once for the same event.

## Duplicate protection

Enforce duplicate protection in the database/server layer, not only in the UI. A race between two browser tabs must not create two chargeable active/pending purchases for one trip.

## Browser exposure

Browser-safe: Stripe publishable key only.

Server-only: Stripe secret key, webhook secret and any Supabase service-role credential.
