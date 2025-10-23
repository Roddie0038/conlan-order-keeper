-- ============================================================================
-- Create public.ot_orders table (needed by ingest-ot-order function)
-- ============================================================================
create table if not exists public.ot_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  product_number text not null,
  quantity int not null check (quantity > 0),
  store text not null,
  plant text not null,
  status text not null default 'pending',
  submitted_by_email text not null,
  submitted_by_name text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ot_orders enable row level security;

drop policy if exists "Users can read their store orders" on public.ot_orders;
create policy "Users can read their store orders"
on public.ot_orders for select
to authenticated
using (
  is_admin() OR 
  exists (
    select 1 from public.platform_users pu 
    where pu.email = jwt_email() 
    and pu.status = 'active' 
    and pu.store = ot_orders.store
  )
);

-- ============================================================================
-- Set up user preferences table (email-based)
-- ============================================================================
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  current_plant text,
  last_plant_switch timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "Users can manage their own preferences" on public.user_preferences;
create policy "Users can manage their own preferences"
on public.user_preferences for all
to authenticated
using (email = jwt_email())
with check (email = jwt_email());

-- ============================================================================
-- RLS policies for read access
-- ============================================================================
drop policy if exists "platform_users_read" on public.platform_users;
create policy "platform_users_read"
on public.platform_users for select
to authenticated
using (true);

drop policy if exists "store_email_recipients_read" on public.store_email_recipients;
create policy "store_email_recipients_read"
on public.store_email_recipients for select
to authenticated
using (true);