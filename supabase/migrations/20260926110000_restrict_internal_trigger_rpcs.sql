-- Trigger functions are invoked by PostgreSQL triggers, not by the public Data API.
revoke all on function public.trigger_send_notification_email() from public, anon, authenticated;
revoke all on function public.queue_payment_notification() from public, anon, authenticated;

-- Keep the RLS helper callable by policies while removing the mutable public search path.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Bound attacker-controlled tracking input before it is used as a lockout key.
create or replace function public.track_guest_order(p_order_number text, p_contact text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_attempts public.guest_tracking_attempts%rowtype;
begin
  if p_order_number is null or length(p_order_number) > 32 or p_order_number !~ '^MA-[0-9]{6,}$'
     or p_contact is null or length(btrim(p_contact)) = 0 or length(p_contact) > 254 then
    return jsonb_build_object('error', 'not_found', 'message', 'No order found matching that order number and contact info');
  end if;

  select a.* into v_attempts from public.guest_tracking_attempts a
  where a.order_number = p_order_number for update;
  if found and v_attempts.locked_until is not null and v_attempts.locked_until > pg_catalog.now() then
    return jsonb_build_object('error', 'locked', 'message', 'Too many attempts for this order. Please try again later.');
  end if;

  select jsonb_build_object(
    'id', o.id, 'order_number', o.order_number, 'status', o.status,
    'courier', o.courier, 'tracking_number', o.tracking_number, 'expected_delivery', o.expected_delivery,
    'subtotal', o.subtotal, 'delivery_charge', o.delivery_charge, 'total', o.total, 'created_at', o.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', oi.name, 'price', oi.price, 'quantity', oi.quantity, 'image', oi.image)), '[]'::jsonb) from public.order_items oi where oi.order_id = o.id),
    'history', (select coalesce(jsonb_agg(jsonb_build_object('from_status', h.from_status, 'to_status', h.to_status, 'created_at', h.created_at) order by h.created_at), '[]'::jsonb) from public.order_status_history h where h.order_id = o.id),
    'tracking_events', (select coalesce(jsonb_agg(jsonb_build_object('status_raw', t.status_raw, 'status_mapped', t.status_mapped, 'description', t.description, 'event_time', t.event_time) order by t.event_time), '[]'::jsonb) from public.tracking_events t where t.order_id = o.id)
  ) into v_result
  from public.orders o
  where o.order_number = p_order_number
    and (o.phone = p_contact or lower(o.email) = lower(p_contact));

  if v_result is null then
    insert into public.guest_tracking_attempts (order_number, failed_count, last_attempt_at, locked_until)
    values (p_order_number, 1, pg_catalog.now(), null)
    on conflict (order_number) do update set
      failed_count = public.guest_tracking_attempts.failed_count + 1,
      last_attempt_at = pg_catalog.now(),
      locked_until = case when public.guest_tracking_attempts.failed_count + 1 >= 5 then pg_catalog.now() + interval '15 minutes' else null end;
    return jsonb_build_object('error', 'not_found', 'message', 'No order found matching that order number and contact info');
  end if;

  delete from public.guest_tracking_attempts a where a.order_number = p_order_number;
  return v_result;
end;
$$;
revoke all on function public.track_guest_order(text,text) from public;
grant execute on function public.track_guest_order(text,text) to anon, authenticated;
