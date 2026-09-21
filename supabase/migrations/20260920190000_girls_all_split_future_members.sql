-- Keep Girls bookings marked "all" aligned with the confirmed trip group.
-- This is deliberately product-scoped so Boys data and behaviour cannot drift.

create or replace function public.girls_sync_all_split_booking_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'confirmed' then
    return new;
  end if;

  if not exists (
    select 1
    from public.trips t
    where t.id = new.trip_id
      and t.product_key = 'girls'
  ) then
    return new;
  end if;

  insert into public.booking_participants (booking_id, trip_id, member_id)
  select b.id, b.trip_id, new.id
  from public.bookings b
  where b.trip_id = new.trip_id
    and b.split_mode = 'all'
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists girls_sync_all_split_booking_member on public.trip_members;
create trigger girls_sync_all_split_booking_member
after insert or update of status on public.trip_members
for each row
when (new.status = 'confirmed')
execute function public.girls_sync_all_split_booking_member();

-- Repair existing Girls-only "all" splits when this migration is applied.
insert into public.booking_participants (booking_id, trip_id, member_id)
select b.id, b.trip_id, m.id
from public.bookings b
join public.trips t on t.id = b.trip_id and t.product_key = 'girls'
join public.trip_members m on m.trip_id = b.trip_id and m.status = 'confirmed'
where b.split_mode = 'all'
on conflict do nothing;

revoke all on function public.girls_sync_all_split_booking_member() from public, anon, authenticated;
