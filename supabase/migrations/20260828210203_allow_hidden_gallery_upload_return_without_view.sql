-- Supabase Storage may need SELECT access to return metadata for an upload.
-- Scope that SELECT narrowly to upload/TUS operations on the uploader's own vault objects.
-- This does not permit listing, signing or authenticated object reads without the vault PIN session.

drop policy if exists "vault_upload_return_metadata" on storage.objects;
create policy "vault_upload_return_metadata"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'btg-vault'
  and trip_has_vault_access(((storage.foldername(name))[1])::uuid)
  and owner_id = (select auth.uid())::text
  and storage.allow_any_operation(array[
    'storage.object.upload',
    'storage.tus.upload.create',
    'storage.tus.upload.part',
    'storage.tus.upload.get'
  ])
);
