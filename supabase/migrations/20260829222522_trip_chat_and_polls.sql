create table if not exists public.trip_chat_messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  sender_member_id uuid not null references public.trip_members(id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists trip_chat_messages_trip_created_idx on public.trip_chat_messages (trip_id, created_at desc);

create table if not exists public.trip_polls (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_by_member_id uuid not null references public.trip_members(id) on delete cascade,
  question text not null check (char_length(btrim(question)) between 3 and 160),
  status text not null default 'open' check (status in ('open','closed')),
  closes_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trip_polls_trip_created_idx on public.trip_polls (trip_id, created_at desc);

create table if not exists public.trip_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.trip_polls(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 80),
  sort_order integer not null check (sort_order between 0 and 20),
  created_at timestamptz not null default now(),
  unique (poll_id, sort_order)
);
create index if not exists trip_poll_options_poll_idx on public.trip_poll_options (poll_id, sort_order);

create table if not exists public.trip_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.trip_polls(id) on delete cascade,
  option_id uuid not null references public.trip_poll_options(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  voter_user_id uuid not null references auth.users(id) on delete cascade,
  voter_member_id uuid not null references public.trip_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_user_id)
);
create index if not exists trip_poll_votes_poll_idx on public.trip_poll_votes (poll_id);
create index if not exists trip_poll_votes_option_idx on public.trip_poll_votes (option_id);

alter table public.trip_chat_messages enable row level security;
alter table public.trip_polls enable row level security;
alter table public.trip_poll_options enable row level security;
alter table public.trip_poll_votes enable row level security;

drop policy if exists trip_chat_messages_select_member on public.trip_chat_messages;
create policy trip_chat_messages_select_member on public.trip_chat_messages for select to authenticated using (public.is_trip_member(trip_id));
drop policy if exists trip_polls_select_member on public.trip_polls;
create policy trip_polls_select_member on public.trip_polls for select to authenticated using (public.is_trip_member(trip_id));
drop policy if exists trip_poll_options_select_member on public.trip_poll_options;
create policy trip_poll_options_select_member on public.trip_poll_options for select to authenticated using (public.is_trip_member(trip_id));
drop policy if exists trip_poll_votes_select_member on public.trip_poll_votes;
create policy trip_poll_votes_select_member on public.trip_poll_votes for select to authenticated using (public.is_trip_member(trip_id));

revoke all on public.trip_chat_messages from anon, authenticated;
revoke all on public.trip_polls from anon, authenticated;
revoke all on public.trip_poll_options from anon, authenticated;
revoke all on public.trip_poll_votes from anon, authenticated;
grant select on public.trip_chat_messages to authenticated;
grant select on public.trip_polls to authenticated;
grant select on public.trip_poll_options to authenticated;
grant select on public.trip_poll_votes to authenticated;

create or replace function public.send_trip_chat_message(p_trip_id uuid, p_message text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_member uuid; v_id uuid; v_message text := btrim(coalesce(p_message,''));
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if char_length(v_message) < 1 or char_length(v_message) > 1000 then raise exception 'Message must be 1 to 1000 characters'; end if;
  select tm.id into v_member from public.trip_members tm where tm.trip_id=p_trip_id and tm.user_id=v_uid limit 1;
  if v_member is null then raise exception 'Trip membership required'; end if;
  insert into public.trip_chat_messages(trip_id,sender_user_id,sender_member_id,message) values(p_trip_id,v_uid,v_member,v_message) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.create_trip_poll(p_trip_id uuid,p_question text,p_options text[],p_closes_at timestamptz default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_member uuid; v_poll uuid; v_question text := btrim(coalesce(p_question,'')); v_option text; v_seen text[] := array[]::text[]; i integer;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  select tm.id into v_member from public.trip_members tm where tm.trip_id=p_trip_id and tm.user_id=v_uid limit 1;
  if v_member is null then raise exception 'Trip membership required'; end if;
  if char_length(v_question) < 3 or char_length(v_question) > 160 then raise exception 'Poll question must be 3 to 160 characters'; end if;
  if coalesce(array_length(p_options,1),0) < 2 or array_length(p_options,1) > 6 then raise exception 'Choose between 2 and 6 options'; end if;
  if p_closes_at is not null and p_closes_at <= now() then raise exception 'Poll closing time must be in the future'; end if;
  insert into public.trip_polls(trip_id,created_by_user_id,created_by_member_id,question,closes_at) values(p_trip_id,v_uid,v_member,v_question,p_closes_at) returning id into v_poll;
  for i in 1..array_length(p_options,1) loop
    v_option := btrim(coalesce(p_options[i],''));
    if char_length(v_option) < 1 or char_length(v_option) > 80 then raise exception 'Poll options must be 1 to 80 characters'; end if;
    if lower(v_option) = any(v_seen) then raise exception 'Poll options must be different'; end if;
    v_seen := array_append(v_seen,lower(v_option));
    insert into public.trip_poll_options(poll_id,trip_id,label,sort_order) values(v_poll,p_trip_id,v_option,i-1);
  end loop;
  return v_poll;
end; $$;

create or replace function public.cast_trip_poll_vote(p_poll_id uuid,p_option_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_trip uuid; v_member uuid; v_status text; v_closes timestamptz;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  select p.trip_id,p.status,p.closes_at into v_trip,v_status,v_closes from public.trip_polls p where p.id=p_poll_id;
  if v_trip is null then raise exception 'Poll not found'; end if;
  if v_status <> 'open' or (v_closes is not null and v_closes <= now()) then raise exception 'This poll is closed'; end if;
  select tm.id into v_member from public.trip_members tm where tm.trip_id=v_trip and tm.user_id=v_uid limit 1;
  if v_member is null then raise exception 'Trip membership required'; end if;
  if not exists(select 1 from public.trip_poll_options o where o.id=p_option_id and o.poll_id=p_poll_id and o.trip_id=v_trip) then raise exception 'Invalid poll option'; end if;
  insert into public.trip_poll_votes(poll_id,option_id,trip_id,voter_user_id,voter_member_id) values(p_poll_id,p_option_id,v_trip,v_uid,v_member)
  on conflict (poll_id,voter_user_id) do update set option_id=excluded.option_id,voter_member_id=excluded.voter_member_id,created_at=now();
end; $$;

create or replace function public.set_trip_poll_status(p_poll_id uuid,p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_trip uuid; v_creator uuid; v_status text := lower(btrim(coalesce(p_status,'')));
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if v_status not in ('open','closed') then raise exception 'Invalid poll status'; end if;
  select p.trip_id,p.created_by_user_id into v_trip,v_creator from public.trip_polls p where p.id=p_poll_id;
  if v_trip is null then raise exception 'Poll not found'; end if;
  if v_creator <> v_uid and not public.is_trip_organiser(v_trip) then raise exception 'Only the poll creator or organiser can change this poll'; end if;
  update public.trip_polls set status=v_status,updated_at=now() where id=p_poll_id;
end; $$;

revoke all on function public.send_trip_chat_message(uuid,text) from public;
revoke all on function public.create_trip_poll(uuid,text,text[],timestamptz) from public;
revoke all on function public.cast_trip_poll_vote(uuid,uuid) from public;
revoke all on function public.set_trip_poll_status(uuid,text) from public;
grant execute on function public.send_trip_chat_message(uuid,text) to authenticated;
grant execute on function public.create_trip_poll(uuid,text,text[],timestamptz) to authenticated;
grant execute on function public.cast_trip_poll_vote(uuid,uuid) to authenticated;
grant execute on function public.set_trip_poll_status(uuid,text) to authenticated;

do $$ begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='trip_chat_messages') then execute 'alter publication supabase_realtime add table public.trip_chat_messages'; end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='trip_polls') then execute 'alter publication supabase_realtime add table public.trip_polls'; end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='trip_poll_votes') then execute 'alter publication supabase_realtime add table public.trip_poll_votes'; end if;
  end if;
end $$;
