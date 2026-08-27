# Deep-sweep resolution status

Baseline for rollback: `ground-zero-20260827` at commit `155f9a1482c3653e0acf8b170d25595853e992a9`.

## 1. `/create-trip` and `/full-trip` placeholders
**Deferred to backend connection.** The existing public noindex pages remain visually unchanged so the marketing build is not given fake functionality. Route intent and integration requirements are documented in this folder.

## 2. Missing authentication/dashboard/join/callback/payment-return routes
**Prepared, not implemented.** `route-contract.json` defines the required application route contract. Actual routes must be created in the backend/application framework.

## 3. No Supabase client/types/env/migrations
**Materially prepared.** Added `.env.example`, `supabase-client.example.ts`, `database.types.example.ts` and `supabase-schema-contract.md`. No real project credentials or executable migrations have been added before the Supabase project/schema is confirmed.

## 4. Communications are reference-only
**Resolved for handoff.** `communications-loader.cjs` makes the canonical communication libraries importable from Node and validates 39 lifecycle messages for Grace, Ava, Lola and Seb. The original canonical files remain unchanged.

## 5. Legal pages missing operator/data-controller identity
**Resolved.** Terms, Privacy and Cookie Policy now identify Storystone Ltd, company number 16922351, registered office 101 Cuffley Hill, Goffs Oak, Waltham Cross, EN7 5HB, England. Privacy identifies Storystone Ltd as data controller.

## 6. Boys backend security fixes must be preserved
**Prepared as a hard requirement.** `README.md`, `supabase-schema-contract.md` and `stripe-contract.md` lock the RLS, organiser-only write, webhook-authoritative activation and duplicate-purchase requirements into the handoff.

## 7. Contact form is mailto only
**Prepared, not implemented.** `support-contract.json` defines the server submission contract. The live contact page remains unchanged until a real server/email destination exists.

## 8. Cookie/privacy provider details
**Correctly deferred.** Policies remain provider-neutral until Supabase, Stripe, Resend and analytics are actually confirmed. They must be updated against the real data flow before launch.

## 9. Security headers
**Partially resolved safely.** Added HSTS, allowed first-party camera capability for future upload/camera features, retained existing security headers and reduced long-lived image caching during active development. Provider-specific CSP/connect-src rules remain deferred until real Supabase/Stripe origins are known.

## 10. Plain `the-gals.html` client route rule
**Still open.** Server redirect is already correct (`/the-gals.html` → `/the-gals`). The legacy client-side mapping inside `script.js` should be removed during the application-router migration. It is not being rewritten now because `script.js` also owns shared header/footer/mobile behaviour and unnecessary changes risk visual regressions.

## 11. Situation page legacy CSS
**Intentionally not touched.** The page has just completed detailed visual approval. Removing layered legacy CSS without full visual regression automation creates more risk than value at this handoff stage.

## 12. Unused deployment images
**Resolved.** Removed six unreferenced legacy How It Works source images totalling approximately 13.5 MB (about 12.8 MiB): master foreground, airport, beach, pool, road and sunset assets.

## 13. SEO metadata depends on JavaScript
**Prepared, not fully migrated.** Added `seo-manifest.json` containing static canonical page metadata for build/server rendering. Existing HTTP canonical Link headers remain in place. Moving all Open Graph/Twitter/JSON-LD into each HTML document should happen when the frontend is migrated into the backend/build pipeline rather than risking a manual duplicate-metadata rewrite across the approved static pages now.

## Net result

The marketing build has not been redesigned or structurally altered. The work completed here removes known repository waste, closes the legal identity gap, creates a safe secret/config contract, makes communications importable, and gives the backend developer explicit route, schema, RLS, Stripe and support contracts while preserving the approved frontend as the rollback baseline.
