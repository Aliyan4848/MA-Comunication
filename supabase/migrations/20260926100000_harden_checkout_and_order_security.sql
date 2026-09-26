-- Harden guest order privacy, checkout idempotency/validation, and order state changes.

create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_city text,
  p_address text,
  p_notes text,
  p_items jsonb,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_order_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_delivery numeric(12,2);
  v_total numeric(12,2);
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_line_price numeric(12,2);
  v_unique_products integer;
begin
  if p_customer_name is null or length(btrim(p_customer_name)) not between 2 and 120 then
    raise exception 'Enter a name between 2 and 120 characters';
  end if;
  if p_phone is null or length(p_phone) > 32 or length(regexp_replace(p_phone, '[^0-9]', '', 'g')) not between 10 and 15 then
    raise exception 'Enter a valid phone number';
  end if;
  if coalesce(length(p_email), 0) > 254 or (coalesce(btrim(p_email), '') <> '' and p_email !~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$') then
    raise exception 'Enter a valid email address';
  end if;
  if p_city is null or length(btrim(p_city)) not between 2 and 120 then
    raise exception 'Enter a valid city';
  end if;
  if p_address is null or length(btrim(p_address)) not between 5 and 500 then
    raise exception 'Enter an address between 5 and 500 characters';
  end if;
  if coalesce(length(p_notes), 0) > 2000 then
    raise exception 'Order notes must be 2000 characters or fewer';
  end if;
  if p_idempotency_key is null or p_idempotency_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'A valid checkout attempt key is required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Cart must contain between 1 and 50 items';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) as e(value)
    where jsonb_typeof(e.value) <> 'object'
       or coalesce(e.value->>'product_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or coalesce(e.value->>'quantity', '') !~ '^[1-9][0-9]{0,2}$'
  ) then
    raise exception 'Cart contains an invalid product or quantity';
  end if;
  if (select count(*) from jsonb_array_elements(p_items)) <>
     (select count(distinct lower(value->>'product_id')) from jsonb_array_elements(p_items)) then
    raise exception 'Remove duplicate products from your cart and try again';
  end if;

  -- Serialize matching retries before checking the unique key so a concurrent
  -- retry returns the first order rather than failing on the unique constraint.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key, 0));
  select o.id into v_existing_order_id
  from public.orders o where o.idempotency_key = p_idempotency_key;
  if v_existing_order_id is not null then
    return (
      select jsonb_build_object('id', o.id, 'order_number', o.order_number, 'total', o.total, 'already_existed', true)
      from public.orders o where o.id = v_existing_order_id
    );
  end if;

  -- Lock all requested products in a stable order to avoid deadlocks between carts.
  select count(*) into v_unique_products from (
    select distinct (e.value->>'product_id')::uuid as product_id
    from jsonb_array_elements(p_items) as e(value)
  ) requested;
  for v_product in
    select p.* from public.products p
    join (
      select distinct (e.value->>'product_id')::uuid as product_id
      from jsonb_array_elements(p_items) as e(value)
    ) requested on requested.product_id = p.id
    order by p.id
    for update of p
  loop
    if not v_product.published then
      raise exception 'One of the items in your cart is no longer available';
    end if;
    select sum((e.value->>'quantity')::integer)::integer into v_qty
    from jsonb_array_elements(p_items) as e(value)
    where lower(e.value->>'product_id') = lower(v_product.id::text);
    if v_product.stock < v_qty then
      raise exception 'Not enough stock for %: only % left', v_product.name, v_product.stock;
    end if;
    v_line_price := coalesce(v_product.sale_price, v_product.price);
    v_subtotal := v_subtotal + (v_line_price * v_qty);
  end loop;
  if v_unique_products <> (select count(*) from public.products p where p.id in (
    select distinct (e.value->>'product_id')::uuid from jsonb_array_elements(p_items) as e(value)
  ) and p.published = true) then
    raise exception 'One of the items in your cart is no longer available';
  end if;

  select coalesce((select s.delivery_charge from public.site_settings s where s.id = 1), 0) into v_delivery;
  v_order_id := pg_catalog.gen_random_uuid();
  v_order_number := public.next_order_number();
  v_total := v_subtotal + v_delivery;

  insert into public.orders (id, order_number, customer_name, phone, email, city, address, notes, subtotal, delivery_charge, total, status, payment_method, idempotency_key, user_id)
  values (v_order_id, v_order_number, btrim(p_customer_name), btrim(p_phone), coalesce(btrim(p_email), ''), btrim(p_city), btrim(p_address), coalesce(btrim(p_notes), ''), v_subtotal, v_delivery, v_total, 'pending', 'cod', p_idempotency_key, auth.uid());

  insert into public.order_status_history (order_id, from_status, to_status, changed_by)
  values (v_order_id, null, 'pending', 'system');

  for v_item in select e.value from jsonb_array_elements(p_items) as e(value) order by e.value->>'product_id' loop
    select p.* into v_product from public.products p where p.id = (v_item->>'product_id')::uuid;
    v_line_price := coalesce(v_product.sale_price, v_product.price);
    insert into public.order_items (order_id, product_id, name, price, quantity, image)
    values (v_order_id, v_product.id, v_product.name, v_line_price, (v_item->>'quantity')::integer,
      coalesce((select pi.url from public.product_images pi where pi.product_id = v_product.id order by pi.sort_order limit 1), ''));
  end loop;

  for v_product in
    select p.* from public.products p
    join (
      select distinct (e.value->>'product_id')::uuid as product_id
      from jsonb_array_elements(p_items) as e(value)
    ) requested on requested.product_id = p.id
    order by p.id
  loop
    select sum((e.value->>'quantity')::integer)::integer into v_qty
    from jsonb_array_elements(p_items) as e(value)
    where lower(e.value->>'product_id') = lower(v_product.id::text);
    update public.products set stock = stock - v_qty, updated_at = pg_catalog.now() where id = v_product.id;
  end loop;

  insert into public.notification_events (order_id, event_type, channel, status)
  select v_order_id, 'ORDER_PLACED', channel, 'not_configured' from unnest(array['email','whatsapp','sms']) as channel;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'subtotal', v_subtotal, 'delivery_charge', v_delivery, 'total', v_total, 'already_existed', false);
end;
$$;
revoke all on function public.create_order(text,text,text,text,text,text,jsonb,text) from public;
grant execute on function public.create_order(text,text,text,text,text,text,jsonb,text) to anon, authenticated;

create or replace function public.get_order_public(p_order_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'total', o.total,
    'created_at', o.created_at,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'product_id', oi.product_id, 'name', oi.name, 'price', oi.price, 'quantity', oi.quantity, 'image', oi.image
      )), '[]'::jsonb)
      from public.order_items oi where oi.order_id = o.id
    )
  )
  from public.orders o
  where o.id = p_order_id
    and auth.uid() is not null
    and (o.user_id = auth.uid() or public.is_admin());
$$;
revoke all on function public.get_order_public(uuid) from public, anon;
grant execute on function public.get_order_public(uuid) to authenticated;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_changed_by text default 'admin',
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_changed_by is distinct from 'admin' then
    raise exception 'Invalid status actor' using errcode = '22023';
  end if;
  if p_note is null or length(p_note) > 2000 then
    raise exception 'Status note must be 2000 characters or fewer' using errcode = '22023';
  end if;

  select o.status into v_current from public.orders o where o.id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if not public.valid_status_transition(v_current, p_new_status) then
    raise exception 'Invalid status transition: % -> %', v_current, p_new_status using errcode = '22023';
  end if;

  update public.orders set status = p_new_status, updated_at = pg_catalog.now() where id = p_order_id;
  if p_new_status = 'cancelled' then
    update public.products p
    set stock = p.stock + cancelled.quantity,
        updated_at = pg_catalog.now()
    from (
      select oi.product_id, sum(oi.quantity)::integer as quantity
      from public.order_items oi
      where oi.order_id = p_order_id and oi.product_id is not null
      group by oi.product_id
    ) cancelled
    where p.id = cancelled.product_id;
  end if;
  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (p_order_id, v_current, p_new_status, 'admin', btrim(p_note));
  insert into public.notification_events (order_id, event_type, channel, status)
  select p_order_id, 'ORDER_' || upper(p_new_status), channel, 'not_configured'
  from unnest(array['email','whatsapp','sms']) as channel;

  return jsonb_build_object('order_id', p_order_id, 'from_status', v_current, 'to_status', p_new_status);
end;
$$;
revoke all on function public.update_order_status(uuid,text,text,text) from public, anon;
grant execute on function public.update_order_status(uuid,text,text,text) to authenticated;

-- Sensitive order writes go through guarded RPCs so state transitions cannot bypass history.
revoke update on table public.orders from anon, authenticated;

-- A regular view inherits the view owner's privileges; use caller RLS instead.
create or replace view public.product_review_stats
with (security_invoker = true)
as
select product_id,
  count(*) filter (where status = 'approved') as review_count,
  round(avg(rating) filter (where status = 'approved'), 2) as average_rating,
  jsonb_build_object(
    '5', count(*) filter (where status = 'approved' and rating = 5),
    '4', count(*) filter (where status = 'approved' and rating = 4),
    '3', count(*) filter (where status = 'approved' and rating = 3),
    '2', count(*) filter (where status = 'approved' and rating = 2),
    '1', count(*) filter (where status = 'approved' and rating = 1)
  ) as distribution
from public.reviews
group by product_id;

create index if not exists order_items_product_id_idx on public.order_items(product_id);
create index if not exists review_images_review_id_idx on public.review_images(review_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
