-- Allow the Girls client to attach a generated thumbnail to media it just uploaded
-- without granting broad UPDATE privileges on public.media.

create or replace function public.set_girls_media_thumbnail(
  p_media_id uuid,
  p_thumbnail_path text
)
returns public.media
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_media public.media;
  v_path text := btrim(coalesce(p_thumbnail_path, ''));
begin
  if v_uid is null then
    raise exception 'Sign in required';
  end if;

  if v_path = '' or char_length(v_path) > 512 then
    raise exception 'Invalid thumbnail path';
  end if;

  select * into v_media
  from public.media
  where id = p_media_id;

  if v_media.id is null then
    raise exception 'Media not found';
  end if;

  if v_media.created_by is distinct from v_uid then
    raise exception 'Only the uploader can set this thumbnail';
  end if;

  if not exists (
    select 1
    from public.trips t
    where t.id = v_media.trip_id
      and t.product_key = 'girls'
  ) then
    raise exception 'Girls trip required';
  end if;

  if not public.is_trip_member(v_media.trip_id) then
    raise exception 'Trip membership required';
  end if;

  if not public.trip_has_evidence_access(v_media.trip_id) then
    raise exception 'Evidence access required';
  end if;

  if v_path not like v_media.trip_id::text || '/' || v_uid::text || '/thumb-%' then
    raise exception 'Thumbnail path does not belong to this upload';
  end if;

  update public.media
     set thumbnail_path = v_path
   where id = p_media_id
   returning * into v_media;

  return v_media;
end;
$function$;

revoke all on function public.set_girls_media_thumbnail(uuid,text) from public, anon;
grant execute on function public.set_girls_media_thumbnail(uuid,text) to authenticated;
