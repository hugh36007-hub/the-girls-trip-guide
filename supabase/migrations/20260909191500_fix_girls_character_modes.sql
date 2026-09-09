alter table public.communication_settings
  drop constraint if exists communication_settings_character_mode_check;

alter table public.communication_settings
  add constraint communication_settings_character_mode_check
  check (character_mode in (
    'coach-auto','coach','freddy','mickey','charlie',
    'grace-auto','grace','ava','lola','seb'
  ));

update public.communication_settings cs
set character_mode = 'grace-auto'
from public.trips t
where t.id = cs.trip_id
  and t.product_key = 'girls'
  and cs.character_mode in ('coach-auto','coach','freddy','mickey','charlie');

create or replace function public.handle_new_trip()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  profile_name text;
  profile_email text;
begin
  select nullif(p.display_name,''), p.email
  into profile_name, profile_email
  from public.profiles p
  where p.id = new.owner_id;

  insert into public.trip_members (
    trip_id, user_id, name, email, role, status, confirmed_at
  ) values (
    new.id,
    new.owner_id,
    coalesce(profile_name, 'Organiser'),
    profile_email,
    'organiser',
    'confirmed',
    now()
  )
  on conflict (trip_id, user_id) do nothing;

  insert into public.communication_settings (trip_id, character_mode)
  values (
    new.id,
    case when new.product_key = 'girls' then 'grace-auto' else 'coach-auto' end
  )
  on conflict (trip_id) do nothing;

  return new;
end;
$function$;
