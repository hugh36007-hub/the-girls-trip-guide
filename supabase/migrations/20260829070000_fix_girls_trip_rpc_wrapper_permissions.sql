-- Public Girls RPC wrappers must execute with their owner's privileges so the client
-- never needs direct EXECUTE permission on the private SECURITY DEFINER helpers.

alter function public.create_girls_trip_for_current_user(text,text,date,date,text,uuid)
  security definer;
alter function public.join_girls_trip_by_code(text,text)
  security definer;

revoke execute on function private.create_girls_trip_for_current_user(text,text,date,date,text,uuid)
  from public, anon, authenticated;
revoke execute on function private.join_girls_trip_by_code(text,text)
  from public, anon, authenticated;

revoke execute on function public.create_girls_trip_for_current_user(text,text,date,date,text,uuid)
  from public, anon;
revoke execute on function public.join_girls_trip_by_code(text,text)
  from public, anon;
grant execute on function public.create_girls_trip_for_current_user(text,text,date,date,text,uuid)
  to authenticated;
grant execute on function public.join_girls_trip_by_code(text,text)
  to authenticated;

comment on function public.create_girls_trip_for_current_user(text,text,date,date,text,uuid)
  is 'Authenticated Girls trip creation wrapper. SECURITY DEFINER delegates to a private helper without exposing the private helper to clients.';
comment on function public.join_girls_trip_by_code(text,text)
  is 'Authenticated Girls trip join wrapper. SECURITY DEFINER delegates to a private helper without exposing the private helper to clients.';
