-- Recover a lost opaque browser state only when the authenticated user has
-- exactly one valid, unexpired server-side invitation state for this product
-- and exact callback. Any ambiguity remains fail-closed.

create or replace function public.finalize_trip_invitation(
  p_state_hash text,
  p_user_id uuid,
  p_expected_product text,
  p_callback_url text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  v_state private.invitation_auth_states%rowtype;
  v_member public.trip_members%rowtype;
  v_trip public.trips%rowtype;
  v_user_email text;
  v_expected_callback text;
  v_now timestamptz := now();
  v_candidate_count integer := 0;
begin
  if p_expected_product not in ('boys','girls') then raise exception 'invalid invitation product'; end if;
  v_expected_callback := case p_expected_product when 'girls' then 'https://thegirlstripguide.com/invite-return.html' when 'boys' then 'https://theboystripguide.com/invite-return.html' end;
  if p_callback_url is distinct from v_expected_callback then raise exception 'invalid invitation callback'; end if;

  if p_state_hash is null or btrim(p_state_hash)='' then
    select count(*) into v_candidate_count
    from private.invitation_auth_states
    where consumed_at is null
      and expires_at > v_now
      and product_key = p_expected_product
      and callback_url = p_callback_url
      and intended_user_id = p_user_id;

    if v_candidate_count <> 1 then
      raise exception 'invitation state recovery unavailable';
    end if;

    select * into v_state
    from private.invitation_auth_states
    where consumed_at is null
      and expires_at > v_now
      and product_key = p_expected_product
      and callback_url = p_callback_url
      and intended_user_id = p_user_id
    for update;
  else
    if p_state_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid invitation state'; end if;
    select * into v_state
    from private.invitation_auth_states
    where state_hash=p_state_hash
    for update;
    if not found then raise exception 'invitation state not found'; end if;
  end if;

  if v_state.consumed_at is not null then raise exception 'invitation state already consumed'; end if;
  if v_state.expires_at <= v_now then raise exception 'invitation state expired'; end if;
  if v_state.product_key is distinct from p_expected_product
     or v_state.callback_url is distinct from p_callback_url
     or v_state.intended_user_id is distinct from p_user_id then
    raise exception 'invitation state mismatch';
  end if;

  select * into v_member from public.trip_members where id=v_state.member_id and trip_id=v_state.trip_id for update;
  if not found then raise exception 'invitation membership not found'; end if;
  select * into v_trip from public.trips where id=v_state.trip_id for update;
  if not found or v_trip.product_key is distinct from p_expected_product then raise exception 'invitation product mismatch'; end if;
  if v_member.invite_token_hash is null or v_member.invite_token_hash is distinct from v_state.invite_token_hash then raise exception 'invitation token changed'; end if;
  if v_member.invite_token_expires_at is null or v_member.invite_token_expires_at <= v_now then raise exception 'invitation token expired'; end if;

  select lower(email) into v_user_email from auth.users where id=p_user_id;
  if v_user_email is null or v_member.email is null or v_user_email <> lower(v_member.email) then raise exception 'authenticated user does not match invitation'; end if;

  if v_state.purpose='invite' then
    if v_member.status not in ('invited','opened') then raise exception 'invitation is not pending'; end if;
    update public.trip_members
      set user_id=p_user_id,status='confirmed',opened_at=coalesce(opened_at,v_now),confirmed_at=v_now,
          invite_token_hash=null,invite_token_expires_at=null,updated_at=v_now
      where id=v_member.id;
    insert into public.audit_events(trip_id,actor_id,event_type,entity_type,entity_id)
      values(v_state.trip_id,p_user_id,'invite_accepted','trip_member',v_state.member_id);
  elsif v_state.purpose='access' then
    if v_member.status<>'confirmed' or v_member.user_id is distinct from p_user_id then raise exception 'confirmed access mismatch'; end if;
    update public.trip_members
      set opened_at=coalesce(opened_at,v_now),invite_token_hash=null,invite_token_expires_at=null,updated_at=v_now
      where id=v_member.id;
  else
    raise exception 'invalid invitation purpose';
  end if;

  update private.invitation_auth_states set consumed_at=v_now,consumed_by=p_user_id where id=v_state.id;
  return jsonb_build_object(
    'trip_id',v_state.trip_id,
    'product_key',v_state.product_key,
    'member_id',v_state.member_id,
    'purpose',v_state.purpose,
    'state_recovered',(p_state_hash is null or btrim(p_state_hash)='')
  );
end;
$$;

revoke all on function public.finalize_trip_invitation(text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.finalize_trip_invitation(text,uuid,text,text) to service_role;
