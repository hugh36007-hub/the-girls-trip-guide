create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null check (product_key in ('boys','girls')),
  platform text not null check (platform in ('web','android','ios')),
  provider text not null check (provider in ('webpush','fcm','apns')),
  endpoint text not null,
  p256dh text,
  auth_key text,
  enabled boolean not null default true,
  failure_count integer not null default 0 check (failure_count >= 0),
  last_seen_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_devices_provider_shape check ((provider='webpush' and platform='web' and p256dh is not null and auth_key is not null) or (provider='fcm' and platform='android' and p256dh is null and auth_key is null) or (provider='apns' and platform='ios' and p256dh is null and auth_key is null)),
  unique (user_id, product_key, endpoint)
);
create index if not exists push_devices_user_product_enabled_idx on public.push_devices(user_id,product_key,enabled);
create index if not exists push_devices_product_provider_enabled_idx on public.push_devices(product_key,provider,enabled);
alter table public.push_devices enable row level security;
revoke all on table public.push_devices from anon, authenticated;
grant all on table public.push_devices to service_role;
create or replace function public.get_push_server_secret(p_name text) returns text language sql stable security definer set search_path='' as $$ select ds.decrypted_secret from vault.decrypted_secrets ds where ds.name=p_name order by ds.created_at desc limit 1 $$;
revoke all on function public.get_push_server_secret(text) from public,anon,authenticated;
grant execute on function public.get_push_server_secret(text) to service_role;
