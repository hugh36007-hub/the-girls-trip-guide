# Supabase schema and RLS contract

This is a design contract for the backend developer. It is intentionally not an executable migration.

## Core entities

### profiles
- `id` — auth user id.
- `email` — normalised account email.
- `display_name`.
- timestamps.

RLS: a user may read/update only their own profile except where a deliberately limited trip-member projection is required.

### trips
- `id`.
- `organiser_id` — auth user id, immutable except through an explicit transfer flow.
- `name`.
- `start_date`, `end_date`.
- `status` — draft/active/closed.
- `full_trip_status` — none/pending/active/refunded/expired.
- timestamps.

RLS: trip members may read their trip. Only the organiser may mutate privileged trip settings. Crew must not be able to edit organiser identity/account fields.

### trip_members
- `id`.
- `trip_id`.
- `user_id` nullable until accepted.
- `email` invitation target.
- `role` — organiser/member.
- `attendance_status`.
- invitation status/timestamps.

Constraints:
- one organiser membership per trip.
- prevent duplicate active membership for the same trip/user or trip/email.

RLS: members can read membership for trips they belong to. Organiser manages invitations and member state. Member self-service should be limited to fields the product explicitly allows.

### destinations / travel_segments / stays / trip_items
Store the planning data used by Free Trip: destinations, dates, flights, accommodation and other itinerary items.

RLS: trip members can read. Writes follow product intent; organiser has final authority. If crew editing is enabled for selected fields, define those columns/actions explicitly rather than granting broad table writes.

### expenses / expense_splits / payments
Store trip expenses and group splits, not payment-card data.

RLS: trip members can read relevant balances. Expense creation/update rules must be explicit. Purchase/payment-provider state for Full Trip is organiser/server controlled.

### invitations
- token hash, never store a reusable plaintext token if avoidable.
- trip id.
- invited email/member id.
- expiry, accepted/revoked timestamps.

RLS/API rule: invitation resolution must reveal only the intended trip context and must not create broad unauthenticated read access.

### full_trip_purchases
- `trip_id` unique for active/pending purchase state as appropriate.
- organiser id.
- Stripe checkout/session/payment identifiers.
- status.
- amount/currency.
- webhook timestamps.

Security:
- browser cannot activate Full Trip by writing this table.
- webhook/server action is authoritative.
- reject duplicate active/pending purchase attempts.

### media
- trip id.
- uploader id.
- storage key.
- mime/type/size.
- created timestamp.
- retention/expiry timestamp.

RLS/storage policy: only authorised trip members can read; uploads require current trip membership and product entitlement. Deletion rights must be explicit. Full Trip entitlement must enforce the advertised 20 GB / 12 month product rules.

### communication_events
Track trigger code, resolved character, recipient, delivery channel, scheduled/sent status and deduplication key.

Rules:
- sender identity and selected character must match.
- honour quiet hours and cooldowns from the canonical communication policy.
- store provider delivery ids/status, not secret credentials.

## Mandatory migration behaviour

Every migration that creates a user-facing table must also define and test its RLS posture. Do not ship a migration that creates permissive policies and rely on a later manual hardening step.

Required negative tests include:
- member cannot update another member's profile;
- member cannot update organiser profile or privileged trip settings;
- non-member cannot read a trip by guessing an id;
- member of Trip A cannot read/write Trip B;
- browser client cannot activate Full Trip;
- invitation token cannot expose unrelated trips;
- storage object cannot be read by a non-member.
