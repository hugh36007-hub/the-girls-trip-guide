-- Align the bookings kind constraint with the plan-item types exposed by the Girls UI.
-- Preserve legacy 'stay' rows while allowing the current 'hotel' and 'activity' values.

alter table public.bookings
  drop constraint if exists bookings_kind_check;

alter table public.bookings
  add constraint bookings_kind_check
  check (
    kind = any (
      array[
        'flight'::text,
        'stay'::text,
        'hotel'::text,
        'transfer'::text,
        'activity'::text,
        'other'::text
      ]
    )
  );
