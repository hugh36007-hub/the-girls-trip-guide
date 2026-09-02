-- Launch hardening shared by the Boys and Girls products.

create or replace function public.soft_remove_media(p_media_id uuid)
returns public.media
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_media public.media;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;

  select * into v_media
  from public.media
  where id = p_media_id;

  if v_media.id is null then raise exception 'Media not found'; end if;
  if not public.is_trip_member(v_media.trip_id) then raise exception 'Trip membership required'; end if;
  if not public.trip_has_evidence_access(v_media.trip_id) then raise exception 'Evidence access required'; end if;
  if v_media.created_by is distinct from v_uid and not public.is_trip_organiser(v_media.trip_id) then
    raise exception 'Only the uploader or organiser can remove this media';
  end if;

  update public.media
     set visibility_state = 'removed_pending_owner',
         removed_by = v_uid,
         removed_at = now()
   where id = p_media_id
   returning * into v_media;

  return v_media;
end;
$function$;

revoke all on function public.soft_remove_media(uuid) from public, anon;
grant execute on function public.soft_remove_media(uuid) to authenticated;

create or replace function private.has_full_comms_access(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select public.is_trip_organiser(p_trip_id)
    and exists (
      select 1
      from public.trip_entitlements te
      where te.trip_id = p_trip_id
        and te.active = true
        and te.entitlement in ('full_trip', 'full_comms')
    );
$function$;

revoke all on function private.has_full_comms_access(uuid) from public, anon;
grant execute on function private.has_full_comms_access(uuid) to authenticated;

drop policy if exists communication_settings_insert_owner on public.communication_settings;
drop policy if exists communication_settings_update_owner on public.communication_settings;
drop policy if exists communication_settings_delete_owner on public.communication_settings;

create policy communication_settings_insert_paid_owner
on public.communication_settings for insert to authenticated
with check (private.has_full_comms_access(trip_id));

create policy communication_settings_update_paid_owner
on public.communication_settings for update to authenticated
using (private.has_full_comms_access(trip_id))
with check (private.has_full_comms_access(trip_id));

create policy communication_settings_delete_paid_owner
on public.communication_settings for delete to authenticated
using (private.has_full_comms_access(trip_id));

drop policy if exists expense_participants_manage_owner on public.expense_participants;

create policy expense_participants_insert_owner
on public.expense_participants for insert to authenticated
with check (public.is_trip_organiser(trip_id));

create policy expense_participants_update_owner
on public.expense_participants for update to authenticated
using (public.is_trip_organiser(trip_id))
with check (public.is_trip_organiser(trip_id));

create policy expense_participants_delete_owner
on public.expense_participants for delete to authenticated
using (public.is_trip_organiser(trip_id));

create index if not exists owner_control_operations_target_id_idx on private.owner_control_operations(target_id);
create index if not exists email_delivery_events_communication_id_idx on public.email_delivery_events(communication_id);
create index if not exists media_hidden_by_idx on public.media(hidden_by);
create index if not exists media_removed_by_idx on public.media(removed_by);
create index if not exists trip_chat_messages_sender_member_id_idx on public.trip_chat_messages(sender_member_id);
create index if not exists trip_poll_options_trip_id_idx on public.trip_poll_options(trip_id);
create index if not exists trip_poll_votes_trip_id_idx on public.trip_poll_votes(trip_id);
create index if not exists trip_poll_votes_voter_member_id_idx on public.trip_poll_votes(voter_member_id);
create index if not exists trip_poll_votes_voter_user_id_idx on public.trip_poll_votes(voter_user_id);
create index if not exists trip_polls_created_by_member_id_idx on public.trip_polls(created_by_member_id);
create index if not exists trip_polls_created_by_user_id_idx on public.trip_polls(created_by_user_id);
