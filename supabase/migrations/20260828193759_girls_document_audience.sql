alter table public.documents
  add column if not exists visibility text not null default 'everyone';

alter table public.documents
  drop constraint if exists documents_visibility_check;
alter table public.documents
  add constraint documents_visibility_check
  check (visibility in ('everyone','selected','organiser'));

create table if not exists public.document_recipients (
  document_id uuid not null references public.documents(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  member_id uuid not null references public.trip_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (document_id, member_id)
);

create index if not exists document_recipients_trip_idx on public.document_recipients(trip_id);
create index if not exists document_recipients_member_idx on public.document_recipients(member_id);

alter table public.document_recipients enable row level security;
grant select, insert, delete on public.document_recipients to authenticated;

create schema if not exists private;

create or replace function private.can_access_trip_document(p_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select case
      when t.owner_id = (select auth.uid()) then true
      when t.product_key <> 'girls' then exists (
        select 1 from public.trip_members tm
        where tm.trip_id = d.trip_id and tm.user_id = (select auth.uid())
      )
      when d.visibility = 'everyone' then exists (
        select 1 from public.trip_members tm
        where tm.trip_id = d.trip_id and tm.user_id = (select auth.uid())
      )
      when d.visibility = 'selected' then exists (
        select 1
        from public.document_recipients dr
        join public.trip_members tm on tm.id = dr.member_id and tm.trip_id = dr.trip_id
        where dr.document_id = d.id
          and dr.trip_id = d.trip_id
          and tm.user_id = (select auth.uid())
      )
      else false
    end
    from public.documents d
    join public.trips t on t.id = d.trip_id
    where d.id = p_document_id
  ), false)
$$;

create or replace function private.can_access_trip_document_path(p_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_document_id uuid;
begin
  select d.id into v_document_id
  from public.documents d
  where d.storage_path = p_path
  limit 1;

  if v_document_id is null then
    return true;
  end if;

  return private.can_access_trip_document(v_document_id);
end
$$;

revoke all on function private.can_access_trip_document(uuid) from public, anon;
revoke all on function private.can_access_trip_document_path(text) from public, anon;
grant execute on function private.can_access_trip_document(uuid) to authenticated;
grant execute on function private.can_access_trip_document_path(text) to authenticated;

drop policy if exists documents_select_member on public.documents;
create policy documents_select_member
on public.documents
for select
to authenticated
using (private.can_access_trip_document(id));

drop policy if exists document_recipients_select on public.document_recipients;
create policy document_recipients_select
on public.document_recipients
for select
to authenticated
using (
  is_trip_organiser(trip_id)
  or exists (
    select 1 from public.trip_members tm
    where tm.id = member_id
      and tm.trip_id = document_recipients.trip_id
      and tm.user_id = (select auth.uid())
  )
);

drop policy if exists document_recipients_insert on public.document_recipients;
create policy document_recipients_insert
on public.document_recipients
for insert
to authenticated
with check (
  is_trip_organiser(trip_id)
  and exists (
    select 1 from public.documents d
    where d.id = document_id and d.trip_id = document_recipients.trip_id
  )
  and exists (
    select 1 from public.trip_members tm
    where tm.id = member_id and tm.trip_id = document_recipients.trip_id
  )
);

drop policy if exists document_recipients_delete on public.document_recipients;
create policy document_recipients_delete
on public.document_recipients
for delete
to authenticated
using (is_trip_organiser(trip_id));

drop policy if exists documents_read_trip_members on storage.objects;
create policy documents_read_trip_members
on storage.objects
for select
to authenticated
using (
  bucket_id = 'btg-documents'
  and is_trip_member(((storage.foldername(name))[1])::uuid)
  and private.can_access_trip_document_path(name)
);
