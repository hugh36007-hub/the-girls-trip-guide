alter table public.push_devices drop constraint if exists push_devices_user_id_product_key_endpoint_key;
create unique index if not exists push_devices_product_endpoint_uidx on public.push_devices(product_key,endpoint);
