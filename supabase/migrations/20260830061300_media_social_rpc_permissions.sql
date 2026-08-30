revoke all on function public.soft_remove_media(uuid) from public, anon;
revoke all on function public.restore_removed_media(uuid) from public, anon;
revoke all on function public.send_trip_media_chat_message(uuid,uuid,text) from public, anon;
grant execute on function public.soft_remove_media(uuid) to authenticated;
grant execute on function public.restore_removed_media(uuid) to authenticated;
grant execute on function public.send_trip_media_chat_message(uuid,uuid,text) to authenticated;
