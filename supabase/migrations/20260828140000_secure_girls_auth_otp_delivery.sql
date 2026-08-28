-- Girls-only OTP hardening.
-- The Resend key itself lives in Supabase Vault as gtg_resend_api_key and is never committed.

create table if not exists public.girls_auth_otp_limits (
  email_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  last_request_at timestamptz not null default now()
);

alter table public.girls_auth_otp_limits enable row level security;
revoke all on public.girls_auth_otp_limits from anon, authenticated;
grant select, insert, update on public.girls_auth_otp_limits to service_role;

create or replace function public.girls_auth_otp_rate_check(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  h text := encode(extensions.digest(lower(trim(p_email))::bytea, 'sha256'), 'hex');
  r public.girls_auth_otp_limits%rowtype;
begin
  select * into r from public.girls_auth_otp_limits where email_hash=h for update;
  if not found then
    insert into public.girls_auth_otp_limits(email_hash,window_started_at,request_count,last_request_at)
    values(h,now(),1,now());
    return true;
  end if;
  if r.last_request_at > now() - interval '60 seconds' then return false; end if;
  if r.window_started_at < now() - interval '1 hour' then
    update public.girls_auth_otp_limits set window_started_at=now(),request_count=1,last_request_at=now() where email_hash=h;
    return true;
  end if;
  if r.request_count >= 8 then return false; end if;
  update public.girls_auth_otp_limits set request_count=request_count+1,last_request_at=now() where email_hash=h;
  return true;
end;
$$;
revoke all on function public.girls_auth_otp_rate_check(text) from public, anon, authenticated;
grant execute on function public.girls_auth_otp_rate_check(text) to service_role;

create or replace function public.girls_resend_api_key()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name='gtg_resend_api_key' limit 1
$$;
revoke all on function public.girls_resend_api_key() from public, anon, authenticated;
grant execute on function public.girls_resend_api_key() to service_role;
