-- Require an authenticated Supabase user for all customer-owned data.
-- Run after 20240101000000_initial_schema.sql on existing projects.

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Anyone can insert orders (guest or member)" on public.orders;
drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders"
  on public.orders for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Anyone can insert order items" on public.order_items;
drop policy if exists "Users can insert their own order items" on public.order_items;
create policy "Users can insert their own order items"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists "Order items viewable with order access" on public.order_items;
create policy "Order items viewable with order access"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );
