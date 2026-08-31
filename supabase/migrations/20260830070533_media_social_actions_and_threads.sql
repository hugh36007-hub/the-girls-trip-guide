alter table public.media add column if not exists visibility_state text not null default 'visible';
alter table public.media add column if not exists removed_by uuid references auth.users(id) on delete set null;
alter table public.media add column if not exists removed_at timestamptz;
alter table public.media add column if not exists hidden_by uuid references auth.users(id) on delete set null;
alter table public.media add column if not exists hidden_at timestamptz;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='media_visibility_state_check' and conrelid='public.media'::regclass) then
    alter table public.media add constraint media_visibility_state_check check (visibility_state in ('visible','removed_pending_owner'));
  end if;
end $$;

alter table public.trip_chat_messages add column if not exists media_id uuid references public.media(id) on delete set null;

create index if not exists media_trip_album_visibility_idx on public.media(trip_id,album,visibility_state,created_at desc);
create index if not exists trip_chat_messages_media_idx on public.trip_chat_messages(media_id,created_at);

drop policy if exists media_select_paid_member on public.media;
create policy media_select_paid_member on public.media for select to authenticated using (
  public.trip_has_evidence_access(trip_id)
  and (visibility_state='visible' or public.is_trip_organiser(trip_id))
  and (
    album='evidence'
    or (album='vault' and public.trip_has_vault_access(trip_id) and public.has_active_vault_session(trip_id))
  )
);

drop policy if exists media_delete_paid_creator_or_owner on public.media;
create policy media_delete_paid_creator_or_owner on public.media for delete to authenticated using (
  public.trip_has_evidence_access(trip_id)
  and public.is_trip_organiser(trip_id)
  and (
    album='evidence'
    or (album='vault' and public.trip_has_vault_access(trip_id) and public.has_active_vault_session(trip_id))
  )
);

create or replace function public.soft_remove_media(p_media_id uuid)
returns public.media
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_media public.media;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  select * into v_media from public.media where id=p_media_id;
  if v_media.id is null then raise exception 'Media not found'; end if;
  if not public.is_trip_member(v_media.trip_id) then raise exception 'Trip membership required'; end if;
  if not public.trip_has_evidence_access(v_media.trip_id) then raise exception 'Evidence access required'; end if;
  update public.media set visibility_state='removed_pending_owner', removed_by=v_uid, removed_at=now() where id=p_media_id returning * into v_media;
  return v_media;
end;
$$;

create or replace function public.restore_removed_media(p_media_id uuid)
returns public.media
language plpgsql
security definer
set search_path=''
as $$
declare
  v_media public.media;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  select * into v_media from public.media where id=p_media_id;
  if v_media.id is null then raise exception 'Media not found'; end if;
  if not public.is_trip_organiser(v_media.trip_id) then raise exception 'Album owner required'; end if;
  update public.media set visibility_state='visible', removed_by=null, removed_at=null where id=p_media_id returning * into v_media;
  return v_media;
end;
$$;

create or replace function public.hide_media_in_vault(p_media_id uuid)
returns public.media
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_media public.media;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  select * into v_media from public.media where id=p_media_id;
  if v_media.id is null then raise exception 'Media not found'; end if;
  if not public.is_trip_member(v_media.trip_id) then raise exception 'Trip membership required'; end if;
  if not public.trip_has_vault_access(v_media.trip_id) then raise exception 'Hidden Gallery access required'; end if;
  update public.media set album='vault', hidden_by=v_uid, hidden_at=now(), visibility_state='visible', removed_by=null, removed_at=null where id=p_media_id returning * into v_media;
  return v_media;
end;
$$;

create or replace function public.send_trip_media_chat_message(p_trip_id uuid, p_media_id uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_member uuid;
  v_id uuid;
  v_message text := btrim(coalesce(p_message,''));
  v_media public.media;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if char_length(v_message) < 1 or char_length(v_message) > 1000 then raise exception 'Message must be 1 to 1000 characters'; end if;
  select tm.id into v_member from public.trip_members tm where tm.trip_id=p_trip_id and tm.user_id=v_uid limit 1;
  if v_member is null then raise exception 'Trip membership required'; end if;
  select * into v_media from public.media where id=p_media_id and trip_id=p_trip_id;
  if v_media.id is null then raise exception 'Media not found'; end if;
  if v_media.visibility_state <> 'visible' and not public.is_trip_organiser(p_trip_id) then raise exception 'Media is not available'; end if;
  if v_media.album='vault' and not (public.trip_has_vault_access(p_trip_id) and public.has_active_vault_session(p_trip_id)) then raise exception 'Hidden Gallery unlock required'; end if;
  insert into public.trip_chat_messages(trip_id,sender_user_id,sender_member_id,message,media_id)
  values (p_trip_id,v_uid,v_member,v_message,p_media_id)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.soft_remove_media(uuid) to authenticated;
grant execute on function public.restore_removed_media(uuid) to authenticated;
grant execute on function public.hide_media_in_vault(uuid) to authenticated;
grant execute on function public.send_trip_media_chat_message(uuid,uuid,text) to authenticated;
grant select(media_id) on public.trip_chat_messages to authenticated;
