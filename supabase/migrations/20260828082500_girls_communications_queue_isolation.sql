-- The Girls Trip Guide: isolate communications from the Boys worker.
-- Production-applied 2026-08-28. Kept here so fresh environments reproduce production.

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
  select t.product_key, (
    t.plan = 'full' or exists (
      select 1 from public.trip_entitlements te
      where te.trip_id=t.id and te.active=true and te.entitlement in ('full_trip','full_comms')
    )
  ) into product, is_full
  from public.trips t where t.id=p_trip_id;

  if product is null then raise exception 'Trip not found'; end if;

  effective_code := p_trigger_code;
  if coalesce(is_full,false)=false then
    effective_code := case p_trigger_code
      when 'T02' then 'F01' when 'T10' then 'F02' when 'T12' then 'F03'
      when 'T20' then 'F04' when 'T22' then 'F05' when 'T30' then 'F06'
      when 'T34' then 'F07' else p_trigger_code end;
  end if;

  if effective_code !~ '^T(0[1-9]|[12][0-9]|3[0-9])$|^F0[1-7]$' then
    raise exception 'Invalid trigger code';
  end if;

  if product='girls' then
    next_status := case when coalesce(p_scheduled_for,now())<=now() then 'girls_ready' else 'girls_scheduled' end;
  else
    next_status := case when coalesce(p_scheduled_for,now())<=now() then 'ready' else 'scheduled' end;
  end if;

  select id into existing_id from public.communications where idempotency_key=p_idempotency_key limit 1;
  if existing_id is not null then
    update public.communications
    set trigger_code=effective_code,
        recipient_member_id=p_recipient_member_id,
        reason=p_reason,
        scheduled_for=p_scheduled_for,
        essential=p_essential,
        status=case when status='sent' then status else next_status end,
        updated_at=now()
    where id=existing_id;
    return existing_id;
  end if;

  insert into public.communications(trip_id,trigger_code,recipient_member_id,status,essential,reason,scheduled_for,idempotency_key)
  values(p_trip_id,effective_code,p_recipient_member_id,next_status,p_essential,p_reason,p_scheduled_for,p_idempotency_key)
  returning id into new_id;
  return new_id;
end;
$$;

-- Scheduler is deliberately idempotent.
do $$
begin
  if not exists(select 1 from cron.job where jobname='gtg-process-communications') then
    perform cron.schedule(
      'gtg-process-communications',
      '*/5 * * * *',
      $job$select net.http_post(
        url := 'https://vtcmvwixfqyxqghibsla.supabase.co/functions/v1/girls-process-communications',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'x-btg-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='btg_communications_cron_secret' limit 1)
        ),
        body := '{}'::jsonb
      );$job$
    );
  end if;
end $$;
