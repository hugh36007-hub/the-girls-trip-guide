alter table public.trip_chat_messages add column if not exists poll_id uuid references public.trip_polls(id) on delete set null;
create index if not exists trip_chat_messages_poll_id_idx on public.trip_chat_messages(poll_id, created_at);

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
