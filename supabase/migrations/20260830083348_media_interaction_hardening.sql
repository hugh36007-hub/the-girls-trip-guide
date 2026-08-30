-- Serialize poll nudges and make media-thread comment retries idempotent.
alter table public.trip_chat_messages
  add column if not exists client_token uuid;

create unique index if not exists trip_chat_messages_sender_client_token_uidx
  on public.trip_chat_messages(sender_user_id, client_token)
  where client_token is not null;

create or replace function public.send_trip_media_chat_message_idempotent(
  p_trip_id uuid,
  p_media_id uuid,
  p_message text,
  p_client_token uuid
)
returns uuid
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_uid uuid := auth.uid();
  v_member uuid;
  v_id uuid;
  v_message text := btrim(coalesce(p_message,''));
  v_media public.media;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if p_client_token is null then raise exception 'Client token required'; end if;
  if char_length(v_message) < 1 or char_length(v_message) > 1000 then raise exception 'Message must be 1 to 1000 characters'; end if;

  select tm.id into v_member
  from public.trip_members tm
  where tm.trip_id=p_trip_id and tm.user_id=v_uid
  limit 1;
  if v_member is null then raise exception 'Trip membership required'; end if;

  select * into v_media
  from public.media
  where id=p_media_id and trip_id=p_trip_id;
  if v_media.id is null then raise exception 'Media not found'; end if;
  if v_media.visibility_state <> 'visible' and not public.is_trip_organiser(p_trip_id) then raise exception 'Media is not available'; end if;
  if v_media.album='vault' and not (public.trip_has_vault_access(p_trip_id) and public.has_active_vault_session(p_trip_id)) then raise exception 'Hidden Gallery unlock required'; end if;

  select m.id into v_id
  from public.trip_chat_messages m
  where m.sender_user_id=v_uid and m.client_token=p_client_token;
  if v_id is not null then return v_id; end if;

  insert into public.trip_chat_messages(trip_id,sender_user_id,sender_member_id,message,media_id,client_token)
  values (p_trip_id,v_uid,v_member,v_message,p_media_id,p_client_token)
  on conflict (sender_user_id,client_token) where client_token is not null do nothing
  returning id into v_id;

  if v_id is null then
    select m.id into v_id
    from public.trip_chat_messages m
    where m.sender_user_id=v_uid and m.client_token=p_client_token;
  end if;
  return v_id;
end;
$function$;

revoke all on function public.send_trip_media_chat_message_idempotent(uuid,uuid,text,uuid) from public, anon;
grant execute on function public.send_trip_media_chat_message_idempotent(uuid,uuid,text,uuid) to authenticated;

create or replace function public.send_trip_poll_nudge(p_poll_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_uid uuid := auth.uid();
  v_poll public.trip_polls%rowtype;
  v_member uuid;
  v_id uuid;
  v_last timestamptz;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  select * into v_poll from public.trip_polls where id=p_poll_id;
  if v_poll.id is null then raise exception 'Poll not found'; end if;
  if v_poll.status <> 'open' then raise exception 'This poll is closed'; end if;
  select tm.id into v_member from public.trip_members tm where tm.trip_id=v_poll.trip_id and tm.user_id=v_uid limit 1;
  if v_member is null then raise exception 'Trip membership required'; end if;
  if v_poll.created_by_user_id <> v_uid and not public.is_trip_organiser(v_poll.trip_id) then raise exception 'Only the poll creator or trip organiser can nudge this poll'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_poll_id::text,0));
  select max(created_at) into v_last from public.trip_chat_messages where poll_id=p_poll_id;
  if v_last is not null and v_last > now() - interval '2 minutes' then raise exception 'This poll was nudged recently'; end if;

  insert into public.trip_chat_messages(trip_id,sender_user_id,sender_member_id,message,poll_id)
  values(v_poll.trip_id,v_uid,v_member,'Poll reminder: '||v_poll.question,p_poll_id)
  returning id into v_id;
  return v_id;
end;
$function$;

revoke all on function public.send_trip_poll_nudge(uuid) from public, anon;
grant execute on function public.send_trip_poll_nudge(uuid) to authenticated;

