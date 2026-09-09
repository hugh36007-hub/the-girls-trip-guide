# Invitation premature-confirmation audit — 9 September 2026

Scope: historic confirmed `trip_members` rows in the shared Trip Guide Supabase project. No rows were changed or revoked.

## Method

The pre-remediation acceptance functions assigned `opened_at` and `confirmed_at` from the same timestamp before the authentication return completed. Rows where `status='confirmed'`, `confirmed_at IS NOT NULL`, and `opened_at = confirmed_at` therefore form a conservative legacy-pattern review set. This pattern is evidence that the old acceptance path was used; it is not, by itself, proof that the user failed to authenticate successfully afterwards.

## Results

- Confirmed Boys memberships: 7 total; 4 match the legacy pattern.
- Confirmed Girls memberships: 3 total; 2 match the legacy pattern.
- All 6 review-set rows have an `invite_accepted` audit event.
- No historic membership was revoked, downgraded or otherwise modified.

| Product | Member ID | Trip ID | Confirmed at (UTC) | Invite-accepted audit |
| --- | --- | --- | --- | --- |
| boys | `c40f978f-dc9a-4116-aeb7-4b2fb64b5348` | `c90020ad-29b1-4564-baa3-0e5e8948c5e3` | 2026-09-04 11:03:23.485 | yes |
| boys | `05dbaf83-589c-43fd-9c6a-ccef20b8b1c8` | `bbb51115-bac8-42e8-96ae-6541a22406a2` | 2026-09-05 20:49:51.456 | yes |
| boys | `2383e207-2388-4b87-9eb1-008368730fb4` | `d9b0cfe6-b819-4d69-b328-d033225e317c` | 2026-09-07 19:30:19.759 | yes |
| girls | `67fd25fc-d2f3-4c63-b1ac-3a89f82abd1a` | `811ccc62-f7a5-4196-a6b8-75e502a1505a` | 2026-09-07 19:31:49.446 | yes |
| boys | `96567a87-9153-403d-8922-9fb08e2f265a` | `d9b0cfe6-b819-4d69-b328-d033225e317c` | 2026-09-09 09:16:26.232 | yes |
| girls | `6d9df7c7-951c-4c20-ba66-6adca2f3ea45` | `811ccc62-f7a5-4196-a6b8-75e502a1505a` | 2026-09-09 18:34:45.902 | yes |

## Recommendation

Do not automatically revoke these memberships. If a user reports an access discrepancy, review the relevant member row, Auth identity, invitation event and product membership together. The hardened protocol prevents new pending invitations from becoming confirmed until authenticated finalisation succeeds.
