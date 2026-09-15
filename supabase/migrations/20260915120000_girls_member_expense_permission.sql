alter table public.trips
  add column if not exists members_can_add_expenses boolean not null default true;

create or replace function public.can_add_girls_expense(
  target_trip_id uuid,
  target_payer_member_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trips t
    join public.trip_members tm
      on tm.trip_id = t.id
    where t.id = target_trip_id
      and t.product_key = 'girls'
      and t.members_can_add_expenses = true
      and tm.id = target_payer_member_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'confirmed'
  );
$$;

revoke all on function public.can_add_girls_expense(uuid, uuid) from public;
grant execute on function public.can_add_girls_expense(uuid, uuid) to authenticated;

create or replace function public.can_view_own_girls_expense(
  target_expense_id uuid,
  target_trip_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expenses e
    join public.trips t on t.id = e.trip_id
    where e.id = target_expense_id
      and e.trip_id = target_trip_id
      and t.product_key = 'girls'
      and e.created_by = (select auth.uid())
  );
$$;

revoke all on function public.can_view_own_girls_expense(uuid, uuid) from public;
grant execute on function public.can_view_own_girls_expense(uuid, uuid) to authenticated;

create or replace function public.can_add_participants_to_own_girls_expense(
  target_expense_id uuid,
  target_trip_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expenses e
    join public.trips t on t.id = e.trip_id
    join public.trip_members tm
      on tm.id = e.payer_member_id
     and tm.trip_id = e.trip_id
    where e.id = target_expense_id
      and e.trip_id = target_trip_id
      and t.product_key = 'girls'
      and t.members_can_add_expenses = true
      and e.created_by = (select auth.uid())
      and tm.user_id = (select auth.uid())
      and tm.status = 'confirmed'
  );
$$;

revoke all on function public.can_add_participants_to_own_girls_expense(uuid, uuid) from public;
grant execute on function public.can_add_participants_to_own_girls_expense(uuid, uuid) to authenticated;

drop policy if exists expenses_insert_owner on public.expenses;
create policy expenses_insert_owner
on public.expenses
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    public.is_trip_organiser(trip_id)
    or public.can_add_girls_expense(trip_id, payer_member_id)
  )
);

drop policy if exists expenses_select_relevant on public.expenses;
create policy expenses_select_relevant
on public.expenses
for select
to authenticated
using (
  public.is_trip_organiser(trip_id)
  or created_by = (select auth.uid())
  or exists (
    select 1
    from public.expense_participants ep
    join public.trip_members tm on tm.id = ep.member_id
    where ep.expense_id = expenses.id
      and ep.trip_id = expenses.trip_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'confirmed'
  )
);

drop policy if exists expense_participants_insert_owner on public.expense_participants;
create policy expense_participants_insert_owner
on public.expense_participants
for insert
to authenticated
with check (
  public.is_trip_organiser(trip_id)
  or public.can_add_participants_to_own_girls_expense(expense_id, trip_id)
);

drop policy if exists expense_participants_select_relevant on public.expense_participants;
create policy expense_participants_select_relevant
on public.expense_participants
for select
to authenticated
using (
  public.is_trip_organiser(trip_id)
  or public.can_view_own_girls_expense(expense_id, trip_id)
  or exists (
    select 1
    from public.trip_members tm
    where tm.id = expense_participants.member_id
      and tm.trip_id = expense_participants.trip_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'confirmed'
  )
);

create or replace function public.set_girls_member_expense_permission(
  p_trip_id uuid,
  p_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_trip_organiser(p_trip_id) then
    raise exception 'Only the organiser can change member expense permissions.';
  end if;

  update public.trips
     set members_can_add_expenses = coalesce(p_enabled, false),
         updated_at = now()
   where id = p_trip_id
     and product_key = 'girls';

  if not found then
    raise exception 'Girls trip not found.';
  end if;

  return coalesce(p_enabled, false);
end;
$$;

revoke all on function public.set_girls_member_expense_permission(uuid, boolean) from public;
grant execute on function public.set_girls_member_expense_permission(uuid, boolean) to authenticated;

create or replace function public.save_girls_expense_fx(
  p_expense_id uuid,
  p_trip_id uuid,
  p_description text,
  p_local_amount numeric,
  p_currency text,
  p_gbp_rate numeric,
  p_rate_date date,
  p_fx_source text,
  p_payer_member_id uuid,
  p_participant_ids uuid[],
  p_settled_member_ids uuid[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
  v_currency text := upper(btrim(coalesce(p_currency, '')));
  v_rate numeric;
  v_gbp_amount numeric;
  v_is_owner boolean := public.is_trip_organiser(p_trip_id);
  v_member_add boolean := public.can_add_girls_expense(p_trip_id, p_payer_member_id);
  v_settled_member_ids uuid[] := coalesce(p_settled_member_ids, '{}'::uuid[]);
begin
  if p_expense_id is null then
    if not v_is_owner and not v_member_add then
      raise exception 'The organiser has not allowed members to add expenses.';
    end if;
  elsif not v_is_owner then
    raise exception 'Only the organiser can edit trip expenses.';
  end if;

  if not exists (
    select 1 from public.trips t
    where t.id = p_trip_id and t.product_key = 'girls'
  ) then
    raise exception 'Girls trip not found.';
  end if;
  if nullif(btrim(p_description), '') is null then
    raise exception 'Description is required.';
  end if;
  if coalesce(p_local_amount, 0) <= 0 then
    raise exception 'Amount must be greater than zero.';
  end if;
  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'Choose a valid currency.';
  end if;
  v_rate := case when v_currency = 'GBP' then 1 else p_gbp_rate end;
  if coalesce(v_rate, 0) <= 0 then
    raise exception 'A valid GBP exchange rate is required.';
  end if;
  if p_payer_member_id is null or not exists (
    select 1 from public.trip_members tm
    where tm.id = p_payer_member_id and tm.trip_id = p_trip_id
  ) then
    raise exception 'Choose a valid payer.';
  end if;
  if coalesce(array_length(p_participant_ids, 1), 0) = 0 then
    raise exception 'Choose at least one valid group member.';
  end if;
  if exists (
    select 1 from unnest(p_participant_ids) member_id
    where not exists (
      select 1 from public.trip_members tm
      where tm.id = member_id and tm.trip_id = p_trip_id
    )
  ) then
    raise exception 'A selected group member is not on this trip.';
  end if;

  if not v_is_owner then
    v_settled_member_ids := '{}'::uuid[];
  end if;

  v_gbp_amount := round(p_local_amount * v_rate, 2);

  if p_expense_id is null then
    insert into public.expenses
      (trip_id, description, amount, payer_member_id, created_by,
       original_amount, original_currency, gbp_rate, fx_rate_date, fx_source)
    values
      (p_trip_id, btrim(p_description), v_gbp_amount, p_payer_member_id, auth.uid(),
       p_local_amount, v_currency, v_rate, coalesce(p_rate_date, current_date), nullif(btrim(p_fx_source), ''))
    returning id into v_id;
  else
    update public.expenses
       set description = btrim(p_description),
           amount = v_gbp_amount,
           payer_member_id = p_payer_member_id,
           original_amount = p_local_amount,
           original_currency = v_currency,
           gbp_rate = v_rate,
           fx_rate_date = coalesce(p_rate_date, current_date),
           fx_source = nullif(btrim(p_fx_source), '')
     where id = p_expense_id and trip_id = p_trip_id
     returning id into v_id;
    if v_id is null then raise exception 'Expense not found.'; end if;
  end if;

  delete from public.expense_participants where expense_id = v_id;
  insert into public.expense_participants (expense_id, trip_id, member_id, settled_at)
  select v_id, p_trip_id, member_id,
         case when member_id = any(v_settled_member_ids) then now() else null end
  from unnest(p_participant_ids) member_id;

  return v_id;
end;
$$;
