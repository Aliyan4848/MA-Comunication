-- Finance reporting, immutable cost snapshots, and internal cost-column isolation.
-- This migration preserves existing products and orders. Historical costs are backfilled only where updated_at proves they were not changed after sale.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.order_item_cost_snapshots (
  order_item_id uuid primary key,
  unit_cost_at_sale numeric(12,2),
  captured_at timestamptz not null default now()
);
alter table private.order_item_cost_snapshots enable row level security;
revoke all on private.order_item_cost_snapshots from public, anon, authenticated;

create table if not exists private.product_cost_changes (
  id bigint generated always as identity primary key,
  product_id uuid not null,
  old_cost numeric(12,2),
  new_cost numeric(12,2),
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
alter table private.product_cost_changes enable row level security;
revoke all on private.product_cost_changes from public, anon, authenticated;

create table if not exists private.business_expense_audit (
  id bigint generated always as identity primary key,
  expense_id uuid not null,
  action text not null check (action in ('insert','update')),
  before_row jsonb,
  after_row jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
alter table private.business_expense_audit enable row level security;
revoke all on private.business_expense_audit from public, anon, authenticated;

-- Backfill only provable product costs; older rows that cannot be proven remain incomplete.
insert into private.order_item_cost_snapshots (order_item_id, unit_cost_at_sale, captured_at)
select oi.id, p.cost_price, o.created_at
from public.order_items oi
join public.orders o on o.id = oi.order_id
join public.products p on p.id = oi.product_id
where p.cost_price is not null and p.updated_at <= o.created_at
on conflict (order_item_id) do nothing;

create or replace function private.capture_order_item_cost()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_cost numeric(12,2);
begin
  select p.cost_price into v_cost from public.products p where p.id = new.product_id;
  insert into private.order_item_cost_snapshots (order_item_id, unit_cost_at_sale, captured_at)
  values (new.id, v_cost, now());
  return new;
end;
$$;
revoke all on function private.capture_order_item_cost() from public, anon, authenticated;
drop trigger if exists capture_order_item_cost on public.order_items;
create trigger capture_order_item_cost after insert on public.order_items
for each row execute function private.capture_order_item_cost();

create or replace function private.audit_product_cost_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.cost_price is not null then
      insert into private.product_cost_changes (product_id, old_cost, new_cost, changed_by)
      values (new.id, null, new.cost_price, auth.uid());
    end if;
  elsif old.cost_price is distinct from new.cost_price then
    insert into private.product_cost_changes (product_id, old_cost, new_cost, changed_by)
    values (new.id, old.cost_price, new.cost_price, auth.uid());
  end if;
  return new;
end;
$$;
revoke all on function private.audit_product_cost_change() from public, anon, authenticated;
drop trigger if exists audit_product_cost_insert on public.products;
create trigger audit_product_cost_insert after insert on public.products
for each row execute function private.audit_product_cost_change();
drop trigger if exists audit_product_cost_update on public.products;
create trigger audit_product_cost_update after update of cost_price on public.products
for each row execute function private.audit_product_cost_change();

-- Public catalog roles keep access to catalog columns only. Product costs are read/written via guarded admin RPCs.
revoke select, insert, update on table public.products from public, anon, authenticated;
grant select (
  id, name, slug, sku, brand, short_description, description, price, sale_price,
  stock, low_stock_threshold, category_id, specifications, features, featured,
  new_arrival, best_seller, published, created_at, updated_at
) on table public.products to anon, authenticated;
grant insert (
  name, slug, sku, brand, short_description, description, price, sale_price,
  stock, low_stock_threshold, category_id, specifications, features, featured,
  new_arrival, best_seller, published
) on table public.products to authenticated;
grant update (
  name, slug, sku, brand, short_description, description, price, sale_price,
  stock, low_stock_threshold, category_id, specifications, features, featured,
  new_arrival, best_seller, published, updated_at
) on table public.products to authenticated;

create or replace function public.admin_get_product_costs()
returns table (product_id uuid, cost_price numeric)
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  return query select p.id, p.cost_price::numeric from public.products p;
end;
$$;
revoke all on function public.admin_get_product_costs() from public, anon, authenticated;
grant execute on function public.admin_get_product_costs() to authenticated;

create or replace function public.admin_set_product_cost(p_product_id uuid, p_cost_price numeric)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_product_id is null or (p_cost_price is not null and p_cost_price < 0) then
    raise exception 'Product and a non-negative cost are required';
  end if;
  update public.products set cost_price = p_cost_price, updated_at = now() where id = p_product_id;
  if not found then raise exception 'Product not found'; end if;
end;
$$;
revoke all on function public.admin_set_product_cost(uuid, numeric) from public, anon, authenticated;
grant execute on function public.admin_set_product_cost(uuid, numeric) to authenticated;

create table if not exists public.profit_share_settings (
  id bigint generated always as identity primary key,
  owner_percent numeric(5,2) not null check (owner_percent between 0 and 100),
  technical_partner_percent numeric(5,2) not null check (technical_partner_percent between 0 and 100),
  store_manager_percent numeric(5,2) not null check (store_manager_percent between 0 and 100),
  effective_from timestamptz not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint profit_share_settings_total_100
    check (owner_percent + technical_partner_percent + store_manager_percent = 100)
);
alter table public.profit_share_settings enable row level security;
revoke all on public.profit_share_settings from public, anon, authenticated;
grant select on public.profit_share_settings to authenticated;
drop policy if exists "Admins read profit share settings" on public.profit_share_settings;
create policy "Admins read profit share settings" on public.profit_share_settings
for select to authenticated using ((select public.is_admin()));

insert into public.profit_share_settings (owner_percent, technical_partner_percent, store_manager_percent, effective_from)
select 70, 20, 10, '0001-01-01 00:00:00+00'::timestamptz
where not exists (select 1 from public.profit_share_settings);

create or replace function public.admin_update_profit_shares(
  p_owner_percent numeric,
  p_technical_partner_percent numeric,
  p_store_manager_percent numeric
)
returns public.profit_share_settings
language plpgsql security definer set search_path = ''
as $$
declare
  v_last_effective timestamptz;
  v_result public.profit_share_settings;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_owner_percent is null or p_technical_partner_percent is null or p_store_manager_percent is null
     or p_owner_percent < 0 or p_owner_percent > 100
     or p_technical_partner_percent < 0 or p_technical_partner_percent > 100
     or p_store_manager_percent < 0 or p_store_manager_percent > 100
     or p_owner_percent + p_technical_partner_percent + p_store_manager_percent <> 100 then
    raise exception 'Profit shares must be between 0 and 100 and total exactly 100';
  end if;
  select s.effective_from into v_last_effective
  from public.profit_share_settings s order by s.effective_from desc, s.id desc limit 1;
  insert into public.profit_share_settings (
    owner_percent, technical_partner_percent, store_manager_percent, effective_from, changed_by
  ) values (
    p_owner_percent, p_technical_partner_percent, p_store_manager_percent,
    greatest(clock_timestamp(), coalesce(v_last_effective + interval '1 microsecond', clock_timestamp())),
    auth.uid()
  ) returning * into v_result;
  return v_result;
end;
$$;
revoke all on function public.admin_update_profit_shares(numeric, numeric, numeric) from public, anon, authenticated;
grant execute on function public.admin_update_profit_shares(numeric, numeric, numeric) to authenticated;

create table if not exists public.business_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 160),
  category text not null check (category in (
    'Advertising', 'Hosting', 'Domain', 'Courier', 'Payment Gateway',
    'Packaging', 'Business Operations', 'Refunds / Returns', 'Other'
  )),
  amount numeric(12,2) not null check (amount >= 0),
  incurred_on date not null,
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.business_expenses enable row level security;
revoke all on public.business_expenses from public, anon, authenticated;
grant select, insert, update on public.business_expenses to authenticated;
drop policy if exists "Admins read business expenses" on public.business_expenses;
create policy "Admins read business expenses" on public.business_expenses
for select to authenticated using ((select public.is_admin()));
drop policy if exists "Admins add business expenses" on public.business_expenses;
create policy "Admins add business expenses" on public.business_expenses
for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "Admins update business expenses" on public.business_expenses;
create policy "Admins update business expenses" on public.business_expenses
for update to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

create or replace function private.stamp_business_expense()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
    new.created_at := now();
    new.updated_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_business_expense() from public, anon, authenticated;
drop trigger if exists stamp_business_expense on public.business_expenses;
create trigger stamp_business_expense before insert or update on public.business_expenses
for each row execute function private.stamp_business_expense();

create or replace function private.audit_business_expense()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into private.business_expense_audit (expense_id, action, before_row, after_row, changed_by)
  values (
    new.id, lower(tg_op),
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
    to_jsonb(new), auth.uid()
  );
  return new;
end;
$$;
revoke all on function private.audit_business_expense() from public, anon, authenticated;
drop trigger if exists audit_business_expense on public.business_expenses;
create trigger audit_business_expense after insert or update on public.business_expenses
for each row execute function private.audit_business_expense();

create index if not exists business_expenses_incurred_on_idx on public.business_expenses (incurred_on);
create index if not exists profit_share_settings_effective_idx on public.profit_share_settings (effective_from desc, id desc);

create or replace function private.calculate_profit_period(p_from date, p_to date)
returns jsonb
language plpgsql stable security invoker set search_path = ''
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
  v_result jsonb;
begin
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 3650 then
    raise exception 'Choose a valid date range of up to ten years';
  end if;
  v_start := p_from::timestamp at time zone 'Asia/Karachi';
  v_end := (p_to + 1)::timestamp at time zone 'Asia/Karachi';

  with eligible_all as (
    select
      o.id,
      case when o.payment_method = 'cod'
        then coalesce(delivery.delivered_at, o.updated_at)
        else coalesce(payment.paid_at, o.updated_at)
      end as recognized_at,
      case when o.payment_method = 'cod'
        then o.total
        else greatest(0::numeric, least(o.total, coalesce(payment.paid_amount, 0)))
      end as revenue
    from public.orders o
    left join lateral (
      select min(h.created_at) as delivered_at
      from public.order_status_history h
      where h.order_id = o.id and h.to_status = 'delivered'
    ) delivery on true
    left join lateral (
      select sum(p.amount) as paid_amount, min(p.updated_at) as paid_at
      from public.payments p
      where p.order_id = o.id and p.status = 'succeeded'
    ) payment on true
    where o.status <> 'cancelled'
      and ((o.payment_method = 'cod' and o.status = 'delivered') or coalesce(payment.paid_amount, 0) > 0)
  ),
  order_days as (
    select
      (eligible.recognized_at at time zone 'Asia/Karachi')::date as day,
      count(distinct eligible.id)::integer as order_count,
      sum(eligible.revenue)::numeric as gross_revenue,
      coalesce(sum(items.quantity), 0)::integer as units_sold,
      coalesce(sum(coalesce(snapshot.unit_cost_at_sale, 0) * items.quantity), 0)::numeric as product_cost,
      count(items.id) filter (where snapshot.order_item_id is null or snapshot.unit_cost_at_sale is null)::integer as missing_cost_items
    from eligible_all eligible
    join public.order_items items on items.order_id = eligible.id
    left join private.order_item_cost_snapshots snapshot on snapshot.order_item_id = items.id
    where eligible.recognized_at >= v_start and eligible.recognized_at < v_end
    group by (eligible.recognized_at at time zone 'Asia/Karachi')::date
  ),
  expense_days as (
    select e.incurred_on as day, sum(e.amount)::numeric as business_expenses
    from public.business_expenses e
    where e.incurred_on between p_from and p_to
    group by e.incurred_on
  ),
  daily as (
    select
      coalesce(orders.day, expenses.day) as day,
      coalesce(orders.order_count, 0)::integer as order_count,
      coalesce(orders.units_sold, 0)::integer as units_sold,
      coalesce(orders.gross_revenue, 0)::numeric as gross_revenue,
      coalesce(orders.product_cost, 0)::numeric as product_cost,
      coalesce(expenses.business_expenses, 0)::numeric as business_expenses,
      coalesce(orders.missing_cost_items, 0)::integer as missing_cost_items
    from order_days orders full join expense_days expenses on expenses.day = orders.day
  ),
  daily_shares as (
    select
      d.*,
      (d.gross_revenue - d.product_cost - d.business_expenses)::numeric as net_profit,
      settings.owner_percent,
      settings.technical_partner_percent,
      settings.store_manager_percent
    from daily d
    join lateral (
      select s.owner_percent, s.technical_partner_percent, s.store_manager_percent
      from public.profit_share_settings s
      where s.effective_from < ((d.day + 1)::timestamp at time zone 'Asia/Karachi')
      order by s.effective_from desc, s.id desc limit 1
    ) settings on true
  ),
  totals as (
    select
      coalesce(sum(order_count), 0)::integer as order_count,
      coalesce(sum(units_sold), 0)::integer as units_sold,
      coalesce(sum(gross_revenue), 0)::numeric as gross_revenue,
      coalesce(sum(product_cost), 0)::numeric as product_cost,
      coalesce(sum(business_expenses), 0)::numeric as business_expenses,
      coalesce(sum(missing_cost_items), 0)::integer as missing_cost_items,
      coalesce(sum(net_profit), 0)::numeric as known_net_profit,
      coalesce(sum(net_profit * owner_percent / 100), 0)::numeric as owner_share,
      coalesce(sum(net_profit * technical_partner_percent / 100), 0)::numeric as technical_partner_share,
      coalesce(sum(net_profit * store_manager_percent / 100), 0)::numeric as store_manager_share
    from daily_shares
  ),
  month_grid as (
    select generate_series(
      date_trunc('month', p_from::timestamp)::date,
      date_trunc('month', p_to::timestamp)::date,
      interval '1 month'
    )::date as month_start
  ),
  month_totals as (
    select
      grid.month_start,
      coalesce(sum(d.order_count), 0)::integer as order_count,
      coalesce(sum(d.units_sold), 0)::integer as units_sold,
      coalesce(sum(d.gross_revenue), 0)::numeric as gross_revenue,
      coalesce(sum(d.product_cost), 0)::numeric as product_cost,
      coalesce(sum(d.business_expenses), 0)::numeric as business_expenses,
      coalesce(sum(d.missing_cost_items), 0)::integer as missing_cost_items,
      coalesce(sum(d.net_profit), 0)::numeric as known_net_profit,
      coalesce(sum(d.net_profit * d.owner_percent / 100), 0)::numeric as owner_share,
      coalesce(sum(d.net_profit * d.technical_partner_percent / 100), 0)::numeric as technical_partner_share,
      coalesce(sum(d.net_profit * d.store_manager_percent / 100), 0)::numeric as store_manager_share
    from month_grid grid
    left join daily_shares d on date_trunc('month', d.day::timestamp)::date = grid.month_start
    group by grid.month_start
  )
  select jsonb_build_object(
    'from', p_from,
    'to', p_to,
    'orders', totals.order_count,
    'units_sold', totals.units_sold,
    'gross_revenue', round(totals.gross_revenue, 2),
    'product_cost', round(totals.product_cost, 2),
    'business_expenses', round(totals.business_expenses, 2),
    'cost_complete', totals.missing_cost_items = 0,
    'missing_cost_items', totals.missing_cost_items,
    'net_profit', case when totals.missing_cost_items = 0 then round(totals.known_net_profit, 2) else null end,
    'owner_share', case when totals.missing_cost_items = 0 then round(totals.owner_share, 2) else null end,
    'technical_partner_share', case when totals.missing_cost_items = 0 then round(totals.technical_partner_share, 2) else null end,
    'store_manager_share', case when totals.missing_cost_items = 0 then round(totals.store_manager_share, 2) else null end,
    'months', coalesce((
      select jsonb_agg(jsonb_build_object(
        'month', to_char(month_start, 'YYYY-MM'),
        'orders', order_count,
        'units_sold', units_sold,
        'gross_revenue', round(gross_revenue, 2),
        'product_cost', round(product_cost, 2),
        'business_expenses', round(business_expenses, 2),
        'cost_complete', missing_cost_items = 0,
        'missing_cost_items', missing_cost_items,
        'net_profit', case when missing_cost_items = 0 then round(known_net_profit, 2) else null end,
        'owner_share', case when missing_cost_items = 0 then round(owner_share, 2) else null end,
        'technical_partner_share', case when missing_cost_items = 0 then round(technical_partner_share, 2) else null end,
        'store_manager_share', case when missing_cost_items = 0 then round(store_manager_share, 2) else null end
      ) order by month_start) from month_totals
    ), '[]'::jsonb)
  ) into v_result
  from totals;

  return v_result;
end;
$$;
revoke all on function private.calculate_profit_period(date, date) from public, anon, authenticated;

create or replace function public.admin_profit_report(p_from date, p_to date)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  return private.calculate_profit_period(p_from, p_to);
end;
$$;
revoke all on function public.admin_profit_report(date, date) from public, anon, authenticated;
grant execute on function public.admin_profit_report(date, date) to authenticated;
