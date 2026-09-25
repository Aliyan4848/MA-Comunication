-- Financial records are voided rather than hard-deleted so the audit trigger
-- retains both the previous and updated values.
alter table public.business_expenses
  add column if not exists voided_at timestamptz,
  add column if not exists voided_by uuid references auth.users(id) on delete set null,
  add column if not exists void_reason text;

create or replace function public.admin_void_business_expense(
  p_expense_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_expense_id is null or length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Expense id and a reason are required';
  end if;
  if length(btrim(p_reason)) > 500 then
    raise exception 'Reason must be 500 characters or fewer';
  end if;

  update public.business_expenses
  set voided_at = clock_timestamp(),
      voided_by = auth.uid(),
      void_reason = btrim(p_reason)
  where id = p_expense_id and voided_at is null;

  if not found then
    raise exception 'Expense not found or already voided';
  end if;
end;
$$;
revoke all on function public.admin_void_business_expense(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_void_business_expense(uuid, text) to authenticated;

create or replace function private.calculate_profit_period(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
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
    where e.incurred_on between p_from and p_to and e.voided_at is null
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
