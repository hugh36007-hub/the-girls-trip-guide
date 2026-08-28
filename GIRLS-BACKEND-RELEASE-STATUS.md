# Girls backend release status — 2026-08-28

## Current architecture

The Girls app uses the existing Supabase project without sharing product state:

- every Girls trip is created with `trips.product_key = 'girls'`;
- list, load, create and code-join paths enforce the Girls product key;
- trip/member RLS and trip-scoped storage paths continue to isolate each private trip;
- Girls communication jobs use only `girls_ready`, `girls_scheduled` and `girls_failed`;
- the Boys worker consumes only the Boys `ready`/`scheduled` states;
- Girls checkout verifies both the authenticated owner and `product_key = 'girls'`.

This preserves the established data model while preventing the Girls front end and
workers from reading or processing Boys product rows.

## Completed hardening

- Removed legacy `trips.plan` access shortcuts from the Girls client and shared
  communication queue. Paid access now depends on active entitlements.
- Changed Girls booking and expense saves to the atomic `save_booking` and
  `save_expense` RPCs, preventing partial parent/participant records.
- Added trip scoping to client update/delete operations.
- Changed media deletion to verify storage deletion before removing its database row.
- Deferred media URL signing until the Evidence tab is opened; URLs hydrate in
  six-item batches, with the first 18 prepared for fast scrolling.
- Source-controlled all five deployed Girls Edge Functions and the OTP security
  migration so production can be reproduced.
- Revoked client execution of private Girls helpers.
- Retained per-address OTP throttling and contained the Resend key in Supabase Vault.
- Fixed duplicate invitation queueing so a directly delivered Girls invitation cannot
  remain queued for a second worker delivery.

## Email release gate — passed

`thegirlstripguide.com` is verified in Resend and sending is enabled. The restricted
Girls Resend key is present in Supabase Vault as `gtg_resend_api_key`.

Live delivery verification completed successfully:

- Girls OTP: delivered;
- Girls invitation: delivered;
- Girls scheduled-worker message: delivered through `girls-process-communications`.

The Girls cron `gtg-process-communications` is now active every five minutes. The Boys
cron `btg-process-communications` remains active and unchanged. A final enablement
migration is source-controlled as `20260828153000_enable_girls_communications.sql`.

## Payments

Girls checkout is authenticated, owner-scoped and requires `product_key = 'girls'` in
both the trip lookup and Stripe metadata. The shared Stripe webhook accepts only
`boys` or `girls` product keys and verifies that the checkout trip, purchaser and
stored trip product key all agree before granting entitlements.

## Rollback

The pre-wiring remote backup remains:

`backup/pre-full-app-wire-20260828`

The release changes do not alter Boys trip rows, Boys email statuses, Boys Edge
Functions or Boys cron configuration.
