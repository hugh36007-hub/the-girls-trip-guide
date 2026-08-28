-- Keep Girls access entitlement-based, contain private helpers, and hold Girls
-- email delivery until the Girls sending domain has been verified in Resend.

create or replace function public.queue_communication(
  p_trip_id uuid,
  p_trigger_code text,
  p_recipient_member_id uuid,
  p_reason text,
  p_scheduled_for timestamptz,
  p_essential boolean,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  existing_id uuid;
  new_id uuid;
  next_status text;
  effective_code text;
  is_full boolean;
  product text;
begin
  select t.product_key, exists (
    select 1
    from public.trip_entitlements te
    where te.trip_id = t.id
      and te.active = true
      and te.entitlement in ('full_trip', 'full_comms')
  )
  into product, is_full
  from public.trips t
  where t.id = p_trip_id;

  if product is null then raise exception 'Trip not found'; end if;

  effective_code := p_trigger_code;
  if coalesce(is_full, false) = false then
    effective_code := case p_trigger_code
      when 'T02' then 'F01' when 'T10' then 'F02' when 'T12' then 'F03'
      when 'T20' then 'F04' when 'T22' then 'F05' when 'T30' then 'F06'
      when 'T34' then 'F07' else p_trigger_code end;
  end if;

  if effective_code !~ '^T(0[1-9]|[12][0-9]|3[0-9])$|^F0[1-7]$' then
    raise exception 'Invalid trigger code';
  end if;

  if product = 'girls' then
    next_status := case when coalesce(p_scheduled_for, now()) <= now()
      then 'girls_ready' else 'girls_scheduled' end;
  else
    next_status := case when coalesce(p_scheduled_for, now()) <= now()
      then 'ready' else 'scheduled' end;
  end if;

  select id into existing_id
  from public.communications
  where idempotency_key = p_idempotency_key
  limit 1;

  if existing_id is not null then
    update public.communications
       set trigger_code = effective_code,
           recipient_member_id = p_recipient_member_id,
           reason = p_reason,
           scheduled_for = p_scheduled_for,
           essential = p_essential,
           status = case when status = 'sent' then status else next_status end,
           updated_at = now()
     where id = existing_id;
    return existing_id;
  end if;

  insert into public.communications(
    trip_id, trigger_code, recipient_member_id, status, essential,
    reason, scheduled_for, idempotency_key
  ) values (
    p_trip_id, effective_code, p_recipient_member_id, next_status, p_essential,
    p_reason, p_scheduled_for, p_idempotency_key
  ) returning id into new_id;

  return new_id;
end;
$$;

revoke execute on function private.create_girls_trip_for_current_user(text,text,date,date,text,uuid)
  from public, anon, authenticated;
revoke execute on function private.join_girls_trip_by_code(text,text)
  from public, anon, authenticated;
revoke execute on function private.route_girls_communication_status()
  from public, anon, authenticated;

drop policy if exists girls_auth_otp_limits_no_client_access
  on public.girls_auth_otp_limits;
create policy girls_auth_otp_limits_no_client_access
  on public.girls_auth_otp_limits
  for all
  to anon, authenticated
  using (false)
  with check (false);

do $$
declare
  girls_job_id bigint;
begin
  select jobid into girls_job_id
  from cron.job
  where jobname = 'gtg-process-communications';

  if girls_job_id is not null then
    perform cron.alter_job(girls_job_id, active := false);
  end if;
end $$;

comment on function public.queue_communication(uuid,text,uuid,text,timestamptz,boolean,text)
  is 'Internal communication queue router. Girls rows use girls_* statuses; access is entitlement-based.';
