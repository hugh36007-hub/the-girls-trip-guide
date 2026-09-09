-- Symmetric Boys/Girls invitation authentication hardening.
-- Browser code receives only an opaque one-time state token. Product, trip,
-- member, intended user and callback remain server-side authority.

create schema if not exists private;

create table if not exists private.invitation_auth_states (
  id uuid primary key default gen_random_uuid(),
  state_hash text not null unique check (state_hash ~ '^[0-9a-f]{64}$'),
  member_id uuid not null references public.trip_members(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  product_key text not null check (product_key in ('boys','girls')),
  intended_user_id uuid not null references auth.users(id) on delete cascade,
  callback_url text not null,
  invite_token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_by uuid references auth.users(id) on delete set null
);

alter table private.invitation_auth_states enable row level security;
revoke all on table private.invitation_auth_states from public, anon, authenticated;

create index if not exists invitation_auth_states_expiry_idx
  on private.invitation_auth_states (expires_at);
create index if not exists invitation_auth_states_member_idx
  on private.invitation_auth_states (member_id, product_key, consumed_at);

create or replace function public.create_invitation_auth_state(
  p_state_hash text,
  p_member_id uuid,
  p_trip_id uuid,
  p_product_key text,
  p_intended_user_id uuid,
  p_callback_url text,
  p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  v_member public.trip_members%rowtype;
  v_trip public.trips%rowtype;
  v_user_email text;
  v_expected_callback text;
begin
  if p_state_hash is null or p_state_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid invitation state';
  end if;
  if p_product_key not in ('boys','girls') then
    raise exception 'invalid invitation product';
  end if;
  v_expected_callback := case p_product_key
    when 'girls' then 'https://thegirlstripguide.com/invite-return.html'
    when 'boys' then 'https://theboystripguide.com/invite-return.html'
  end;
  if p_callback_url is distinct from v_expected_callback then
    raise exception 'invalid invitation callback';
  end if;
  if p_expires_at <= now() or p_expires_at > now() + interval '15 minutes' then
    raise exception 'invalid invitation state expiry';
  end if;

  select * into v_member
  from public.trip_members
  where id = p_member_id and trip_id = p_trip_id
  for update;
  if not found then
    raise exception 'invitation membership not found';
  end if;

  select * into v_trip
  from public.trips
  where id = p_trip_id
  for update;
  if not found or v_trip.product_key is distinct from p_product_key then
    raise exception 'invitation product mismatch';
  end if;

  if v_member.status not in ('invited','opened') then
    raise exception 'invitation is not pending';
  end if;
  if v_member.invite_token_hash is null then
    raise exception 'invitation token missing';
  end if;
  if v_member.invite_token_expires_at is null or v_member.invite_token_expires_at <= now() then
    raise exception 'invitation token expired';
  end if;
  if v_member.email is null then
    raise exception 'invitation email missing';
  end if;

  select lower(email) into v_user_email
  from auth.users
  where id = p_intended_user_id;
  if v_user_email is null or v_user_email <> lower(v_member.email) then
    raise exception 'invitation user mismatch';
  end if;

  delete from private.invitation_auth_states
  where (expires_at < now() - interval '1 day')
     or (consumed_at is not null and consumed_at < now() - interval '1 day')
     or (member_id = p_member_id and product_key = p_product_key and consumed_at is null);

  insert into private.invitation_auth_states(
    state_hash, member_id, trip_id, product_key, intended_user_id,
    callback_url, invite_token_hash, expires_at
  ) values (
    p_state_hash, p_member_id, p_trip_id, p_product_key, p_intended_user_id,
    p_callback_url, v_member.invite_token_hash, p_expires_at
  );
end;
$$;

revoke all on function public.create_invitation_auth_state(text,uuid,uuid,text,uuid,text,timestamptz) from public, anon, authenticated;
grant execute on function public.create_invitation_auth_state(text,uuid,uuid,text,uuid,text,timestamptz) to service_role;

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
begin
  if p_state_hash is null or p_state_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid invitation state';
  end if;
  if p_expected_product not in ('boys','girls') then
    raise exception 'invalid invitation product';
  end if;
  v_expected_callback := case p_expected_product
    when 'girls' then 'https://thegirlstripguide.com/invite-return.html'
    when 'boys' then 'https://theboystripguide.com/invite-return.html'
  end;
  if p_callback_url is distinct from v_expected_callback then
    raise exception 'invalid invitation callback';
  end if;

  select * into v_state
  from private.invitation_auth_states
  where state_hash = p_state_hash
  for update;
  if not found then
    raise exception 'invitation state not found';
  end if;
  if v_state.consumed_at is not null then
    raise exception 'invitation state already consumed';
  end if;
  if v_state.expires_at <= v_now then
    raise exception 'invitation state expired';
  end if;
  if v_state.product_key is distinct from p_expected_product
     or v_state.callback_url is distinct from p_callback_url
     or v_state.intended_user_id is distinct from p_user_id then
    raise exception 'invitation state mismatch';
  end if;

  select * into v_member
  from public.trip_members
  where id = v_state.member_id and trip_id = v_state.trip_id
  for update;
  if not found then
    raise exception 'invitation membership not found';
  end if;

  select * into v_trip
  from public.trips
  where id = v_state.trip_id
  for update;
  if not found or v_trip.product_key is distinct from p_expected_product then
    raise exception 'invitation product mismatch';
  end if;

  if v_member.status not in ('invited','opened') then
    raise exception 'invitation is not pending';
  end if;
  if v_member.invite_token_hash is null
     or v_member.invite_token_hash is distinct from v_state.invite_token_hash then
    raise exception 'invitation token changed';
  end if;
  if v_member.invite_token_expires_at is null or v_member.invite_token_expires_at <= v_now then
    raise exception 'invitation token expired';
  end if;

  select lower(email) into v_user_email
  from auth.users
  where id = p_user_id;
  if v_user_email is null or v_member.email is null or v_user_email <> lower(v_member.email) then
    raise exception 'authenticated user does not match invitation';
  end if;

  update public.trip_members
  set user_id = p_user_id,
      status = 'confirmed',
      opened_at = coalesce(opened_at, v_now),
      confirmed_at = v_now,
      invite_token_hash = null,
      invite_token_expires_at = null,
      updated_at = v_now
  where id = v_member.id;

  update private.invitation_auth_states
  set consumed_at = v_now,
      consumed_by = p_user_id
  where id = v_state.id;

  insert into public.audit_events(
    trip_id, actor_id, event_type, entity_type, entity_id
  ) values (
    v_state.trip_id, p_user_id, 'invite_accepted', 'trip_member', v_state.member_id
  );

  return jsonb_build_object(
    'trip_id', v_state.trip_id,
    'product_key', v_state.product_key,
    'member_id', v_state.member_id
  );
end;
$$;

revoke all on function public.finalize_trip_invitation(text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.finalize_trip_invitation(text,uuid,text,text) to service_role;
