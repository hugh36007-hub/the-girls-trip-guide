-- Full Trip crew can manage only their own profile photo without gaining broader trip_member update rights.

create or replace function public.set_own_trip_member_avatar(
  p_trip_id uuid,
  p_avatar_path text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member_id uuid;
  v_previous_path text;
  v_expected_prefix text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.trip_has_evidence_access(p_trip_id) then
    raise exception 'Full Trip access required.';
  end if;

  select tm.id, tm.avatar_path
    into v_member_id, v_previous_path
  from public.trip_members tm
  where tm.trip_id = p_trip_id
    and tm.user_id = auth.uid()
  limit 1;

  if v_member_id is null then
    raise exception 'Crew membership not found.';
  end if;

  v_expected_prefix := p_trip_id::text || '/avatars/' || v_member_id::text || '-';
  if p_avatar_path is null or left(p_avatar_path, length(v_expected_prefix)) <> v_expected_prefix then
    raise exception 'Invalid avatar path.';
  end if;

  update public.trip_members
  set avatar_path = p_avatar_path
  where id = v_member_id
    and trip_id = p_trip_id;

  return v_previous_path;
end;
$$;

revoke all on function public.set_own_trip_member_avatar(uuid, text) from public;
grant execute on function public.set_own_trip_member_avatar(uuid, text) to authenticated;

drop policy if exists documents_upload_paid_self_avatar on storage.objects;
create policy documents_upload_paid_self_avatar
on storage.objects
as permissive
for insert
to authenticated
with check (
  bucket_id = 'btg-documents'
  and (storage.foldername(name))[2] = 'avatars'
  and public.trip_has_evidence_access(((storage.foldername(name))[1])::uuid)
  and exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = ((storage.foldername(name))[1])::uuid
      and tm.user_id = auth.uid()
      and name like ((storage.foldername(name))[1]) || '/avatars/' || tm.id::text || '-%'
  )
);

drop policy if exists documents_delete_paid_self_avatar on storage.objects;
create policy documents_delete_paid_self_avatar
on storage.objects
as permissive
for delete
to authenticated
using (
  bucket_id = 'btg-documents'
  and (storage.foldername(name))[2] = 'avatars'
  and owner_id = auth.uid()::text
  and public.trip_has_evidence_access(((storage.foldername(name))[1])::uuid)
);
