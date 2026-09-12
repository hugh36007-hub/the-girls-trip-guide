-- Prevent concurrent Full Trip checkout requests from creating more than one pending Stripe purchase per trip.
-- Existing paid/refunded history remains unrestricted so legitimate repurchases continue to work.
create unique index if not exists purchases_one_pending_stripe_per_trip_idx
  on public.purchases (trip_id)
  where provider = 'stripe' and status = 'pending';
