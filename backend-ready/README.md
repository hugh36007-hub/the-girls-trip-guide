# The Girls Trip Guide — Backend-ready handoff

This folder contains the original backend handoff contracts. The production Girls
app is now wired to the shared Supabase architecture with product-key isolation,
Girls-only Edge Functions and separate communication queue states. See
`../GIRLS-BACKEND-RELEASE-STATUS.md` for the current deployment status and the
deliberate Resend-domain hold.

## Rollback baseline

The protected pre-backend baseline is branch `ground-zero-20260827`, created from commit `155f9a1482c3653e0acf8b170d25595853e992a9` before this preparation work began.

If integration work causes regressions, compare or roll back to that branch rather than reconstructing the marketing build manually.

## Current frontend state

The public marketing routes are complete. `/create-trip` is the authenticated Girls
application and remains `noindex`; `/full-trip` is the product/checkout route. Email
delivery must remain held until `thegirlstripguide.com` is verified in Resend.

## Backend route contract

Implement these functional routes or equivalent application routes while preserving the public marketing URLs:

- `/create-trip` — organiser trip creation.
- `/login` — organiser/member authentication.
- `/join-trip` — invitation landing and join flow.
- `/auth/callback` — authentication or invitation callback.
- `/trip/:tripId` — authenticated trip dashboard.
- `/payment/return` — Stripe return/status page only; payment activation must not depend on this route.
- `/support` or API equivalent — server-side support request submission if the Contact page is upgraded from mailto.

See `route-contract.json` for machine-readable route intent.

## Required security controls — do not copy the old Boys backend without these

1. Hardened Supabase RLS must be part of migrations, not a manual production-only fix.
2. Organiser-only write rules for trip settings, owner profile fields, purchases and other privileged state.
3. Crew/member access must be read-only wherever the product intends it to be read-only.
4. Stripe verification must validate authenticated organiser identity server-side.
5. Stripe webhook activation is authoritative. Do not rely on a browser return redirect to activate Full Trip.
6. Prevent duplicate active/pending purchases for the same trip.
7. Service-role keys must never reach browser code.
8. Invitation links must resolve only the intended trip and member identity and must not grant broader access.
9. Upload/storage policies must scope reads and writes to authorised trip membership.
10. Keep payment-card data out of the application database; store only provider references/status required by the product.

## Service assumptions to confirm during wiring

- Supabase: EU-region project, authentication, Postgres and storage/R2 architecture as finally selected.
- Stripe: £24.99 one-off Full Trip purchase.
- Full Trip media promise: up to 20 GB for 12 months.
- Resend/email: sender identities for Grace, Ava, Lola, Seb and the system identity.
- Analytics: confirm provider before enabling optional tracking or updating cookie consent.

## Communications

Canonical communication source files remain at repository root:

- `communications-girls.js`
- `communications-girls-voices.js`
- `COMMUNICATIONS-GIRLS-HANDOVER.md`

Use `communications-loader.cjs` from this folder to import and validate the reference libraries in Node without changing the static marketing runtime. It validates that all four GALS contain 39 lifecycle messages.

## Environment

Copy `.env.example` into the backend project/environment configuration and replace placeholders with deployment values. Never commit real service-role, Stripe secret, webhook or Resend API keys.

## Legal/privacy integration checkpoint

Before backend launch, verify that Terms, Privacy and Cookies describe the actual providers and flows in production, especially authentication, storage, Stripe, Resend, analytics and retention. Provider names should not be added speculatively before the actual services are selected and configured.

## Pre-launch test gate

Do not call the backend connection complete until all of the following pass:

- fresh organiser account creation;
- invite sent, opened and joined on mobile;
- member access is correctly restricted;
- organiser-only settings cannot be changed by crew;
- Full Trip test purchase and webhook activation;
- duplicate purchase blocked;
- failed/cancelled payment path;
- media upload/read/delete permissions;
- 20 GB / 12 month product wording matches implementation;
- all four GALS sender identities and message selection verified;
- real email delivery test;
- support/privacy contact route tested;
- desktop and mobile regression sweep.
