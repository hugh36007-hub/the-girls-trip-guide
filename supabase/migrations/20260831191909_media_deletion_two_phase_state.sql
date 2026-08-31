alter table public.media drop constraint if exists media_visibility_state_check;
alter table public.media add constraint media_visibility_state_check
  check (visibility_state in ('visible','removed_pending_owner','deleting'));
