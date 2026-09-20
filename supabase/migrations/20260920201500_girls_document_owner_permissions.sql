-- Restore Girls organiser document writes without widening Boys permissions.

drop policy if exists documents_insert_girls_owner on public.documents;
create policy documents_insert_girls_owner
on public.documents
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.trips t
    where t.id = documents.trip_id
      and t.product_key = 'girls'
      and t.owner_id = (select auth.uid())
  )
);

drop policy if exists documents_update_girls_owner on public.documents;
create policy documents_update_girls_owner
on public.documents
for update
to authenticated
using (
  exists (
    select 1
    from public.trips t
    where t.id = documents.trip_id
      and t.product_key = 'girls'
      and t.owner_id = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.trips t
    where t.id = documents.trip_id
      and t.product_key = 'girls'
      and t.owner_id = (select auth.uid())
  )
);

drop policy if exists documents_delete_girls_owner on public.documents;
create policy documents_delete_girls_owner
on public.documents
for delete
to authenticated
using (
  exists (
    select 1
    from public.trips t
    where t.id = documents.trip_id
      and t.product_key = 'girls'
      and t.owner_id = (select auth.uid())
  )
);
