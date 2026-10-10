-- ==============================================================================
-- CHIP HAPPENS - SUPABASE POSTGRESQL INITIAL SCHEMA & MIGRATIONS
-- Database: PostgreSQL (Supabase)
-- Includes: Profiles, Products, Cart Items, Favorites, Orders, Order Items,
--           Row Level Security (RLS) Policies, Triggers, Indexes, and Initial Seed Data
-- ==============================================================================

-- 1. Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 2. Create custom types
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ==============================================================================
-- TABLE: profiles (Extends Supabase auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  address text,
  profile_image text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for profiles
create index if not exists idx_profiles_email on public.profiles(email);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Trigger to auto-create profile on Supabase auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- TABLE: products (Cookie Catalog)
-- ==============================================================================
create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  box_prices jsonb, -- e.g. {"small": 225, "regular": 420, "large": 800}
  category text not null,
  image text not null,
  description text not null,
  ingredients text[] default '{}',
  allergens text[] default '{}',
  nutrition_facts jsonb, -- e.g. {"calories": 150, "fat": "8g", "carbs": "18g", "protein": "2g"}
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_featured on public.products(is_featured);

-- Enable RLS
alter table public.products enable row level security;

-- Policies for products
create policy "Anyone can read products" 
  on public.products for select 
  using (true);

create policy "Admins can manage products" 
  on public.products for all 
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ==============================================================================
-- TABLE: cart_items
-- ==============================================================================
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  box_size text default 'regular' check (box_size in ('small', 'regular', 'large')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id, box_size)
);

create index if not exists idx_cart_user_id on public.cart_items(user_id);

-- Enable RLS
alter table public.cart_items enable row level security;

create policy "Users can view their own cart" 
  on public.cart_items for select 
  using (auth.uid() = user_id);

create policy "Users can insert into their own cart" 
  on public.cart_items for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items" 
  on public.cart_items for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own cart items" 
  on public.cart_items for delete 
  using (auth.uid() = user_id);

-- ==============================================================================
-- TABLE: favorites (Wishlist)
-- ==============================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

create index if not exists idx_favorites_user_id on public.favorites(user_id);

-- Enable RLS
alter table public.favorites enable row level security;

create policy "Users can view their own favorites" 
  on public.favorites for select 
  using (auth.uid() = user_id);

create policy "Users can add to their favorites" 
  on public.favorites for insert 
  with check (auth.uid() = user_id);

create policy "Users can remove from their favorites" 
  on public.favorites for delete 
  using (auth.uid() = user_id);

-- ==============================================================================
-- TABLE: orders
-- ==============================================================================
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount_amount numeric(10, 2) default 0 check (discount_amount >= 0),
  shipping numeric(10, 2) not null check (shipping >= 0),
  tax numeric(10, 2) not null check (tax >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_info jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- Enable RLS
alter table public.orders enable row level security;

create policy "Users can view their own orders" 
  on public.orders for select 
  using (auth.uid() = user_id or auth.uid() is null);

create policy "Anyone can insert orders (guest or member)" 
  on public.orders for insert 
  with check (true);

create policy "Users or Admins can update their orders" 
  on public.orders for update 
  using (auth.uid() = user_id);

-- ==============================================================================
-- TABLE: order_items
-- ==============================================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  image text not null,
  box_size text default 'regular',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Enable RLS
alter table public.order_items enable row level security;

create policy "Order items viewable with order access" 
  on public.order_items for select 
  using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );

create policy "Anyone can insert order items" 
  on public.order_items for insert 
  with check (true);

-- ==============================================================================
-- SEED DATA: 24 HANDCRAFTED COOKIES
-- ==============================================================================
insert into public.products (id, name, price, box_prices, category, image, description, ingredients, allergens, nutrition_facts, is_featured)
values
  ('chocolate-chip', 'Chocolate Chip Cookie', 225, '{"small": 225, "regular": 420, "large": 800}', 'classic', 'Chocolate chip.svg', 'Classic cookies with premium chocolate chips', '{"Flour", "Butter", "Sugar", "Chocolate Chips", "Eggs", "Vanilla"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 150, "fat": "8g", "carbs": "18g", "protein": "2g"}', true),
  ('sugar-cookie', 'Sugar Cookie', 180, '{"small": 180, "regular": 340, "large": 650}', 'classic', 'Sugar Cookie.svg', 'Simple, sweet, and delicious classic recipe', '{"Flour", "Butter", "Sugar", "Eggs", "Vanilla"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 130, "fat": "6g", "carbs": "16g", "protein": "2g"}', false),
  ('snickerdoodle', 'Snickerdoodle', 200, '{"small": 200, "regular": 380, "large": 720}', 'classic', 'Snickerdoodle.svg', 'Cinnamon sugar perfection with crisp edges and chewy center', '{"Flour", "Butter", "Sugar", "Eggs", "Cinnamon", "Cream of Tartar"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 140, "fat": "7g", "carbs": "17g", "protein": "2g"}', false),
  ('oatmeal-raisin', 'Oatmeal Raisin Cookie', 200, '{"small": 200, "regular": 380, "large": 720}', 'classic', 'Oatmeal Raisin Cookie.svg', 'Wholesome oats packed with plump sweet raisins', '{"Oats", "Flour", "Butter", "Brown Sugar", "Raisins", "Eggs", "Cinnamon"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 140, "fat": "6g", "carbs": "19g", "protein": "3g"}', false),
  ('butter-cookie', 'Butter Cookie', 190, '{"small": 190, "regular": 360, "large": 680}', 'classic', 'Butter Cookie.svg', 'Rich, buttery, melt-in-your-mouth perfection', '{"Flour", "Butter", "Sugar", "Vanilla"}', '{"Wheat", "Dairy"}', '{"calories": 160, "fat": "9g", "carbs": "17g", "protein": "2g"}', true),
  ('molasses', 'Molasses Cookie', 210, '{"small": 210, "regular": 400, "large": 760}', 'classic', 'Molasses Cookie.svg', 'Old-fashioned spiced ginger molasses cookie', '{"Flour", "Butter", "Molasses", "Brown Sugar", "Ginger", "Cinnamon", "Cloves"}', '{"Wheat", "Dairy"}', '{"calories": 145, "fat": "6g", "carbs": "21g", "protein": "2g"}', false),
  ('double-chocolate', 'Double Chocolate Cookie', 240, '{"small": 240, "regular": 450, "large": 860}', 'chocolate', 'Double Chocolate Cookie.svg', 'Rich cocoa dough loaded with Belgian chocolate chunks', '{"Flour", "Cocoa Powder", "Butter", "Sugar", "Chocolate Chips", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 160, "fat": "8g", "carbs": "20g", "protein": "2g"}', true),
  ('triple-chocolate', 'Triple Chocolate Cookie', 260, '{"small": 260, "regular": 490, "large": 930}', 'chocolate', 'Triple Chocolate Cookie.svg', 'Dark, milk, and white chocolate folded in decadent cocoa dough', '{"Flour", "Cocoa Powder", "Dark Chocolate", "Milk Chocolate", "White Chocolate", "Butter", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 175, "fat": "9g", "carbs": "21g", "protein": "3g"}', false),
  ('chocolate-fudge', 'Chocolate Fudge Cookie', 250, '{"small": 250, "regular": 470, "large": 890}', 'chocolate', 'Chocolate Fudge Cookie.svg', 'Soft baked fudge center with a crackly top', '{"Flour", "Fudge", "Cocoa", "Butter", "Brown Sugar", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 170, "fat": "9g", "carbs": "20g", "protein": "2g"}', false),
  ('brownie-cookie', 'Brownie Cookie (Brookies)', 250, '{"small": 250, "regular": 470, "large": 890}', 'chocolate', 'Brownie Cookie.svg', 'The rich chew of a brownie meets the crisp bite of a cookie', '{"Dark Chocolate", "Flour", "Butter", "Sugar", "Eggs", "Vanilla"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 165, "fat": "8g", "carbs": "20g", "protein": "3g"}', false),
  ('white-chocolate', 'White Chocolate Cookie', 230, '{"small": 230, "regular": 430, "large": 820}', 'chocolate', 'White Chocolate Cookie.svg', 'Silky white chocolate chips in a golden vanilla cookie base', '{"Flour", "Butter", "Sugar", "White Chocolate Chips", "Eggs", "Vanilla"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 155, "fat": "8g", "carbs": "19g", "protein": "2g"}', false),
  ('mint-chocolate', 'Mint Chocolate Cookie', 240, '{"small": 240, "regular": 450, "large": 860}', 'chocolate', 'Mint Chocolate Cookie.svg', 'Cool refreshing mint meets rich dark cocoa dough', '{"Flour", "Cocoa", "Butter", "Mint Chocolate Chips", "Peppermint Extract", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 155, "fat": "8g", "carbs": "19g", "protein": "2g"}', false),
  ('peanut-butter', 'Peanut Butter Cookie', 210, '{"small": 210, "regular": 400, "large": 760}', 'nutty', 'Peanut Butter Cookie.svg', 'Creamy peanut butter goodness with signature criss-cross pattern', '{"Peanut Butter", "Flour", "Butter", "Sugar", "Eggs", "Vanilla"}', '{"Peanuts", "Wheat", "Eggs", "Dairy"}', '{"calories": 160, "fat": "9g", "carbs": "17g", "protein": "4g"}', true),
  ('almond-cookie', 'Almond Cookie', 220, '{"small": 220, "regular": 420, "large": 790}', 'nutty', 'Almond Cookie.svg', 'Delicate nutty flavor topped with toasted almond flakes', '{"Almond Flour", "Flour", "Butter", "Sugar", "Almond Extract", "Eggs"}', '{"Tree Nuts (Almonds)", "Wheat", "Eggs", "Dairy"}', '{"calories": 150, "fat": "8g", "carbs": "16g", "protein": "3g"}', false),
  ('pecan-cookie', 'Pecan Cookie', 230, '{"small": 230, "regular": 440, "large": 830}', 'nutty', 'Pecan Cookie.svg', 'Roasted buttery Georgia pecans in brown sugar dough', '{"Flour", "Butter", "Brown Sugar", "Roasted Pecans", "Eggs", "Vanilla"}', '{"Tree Nuts (Pecans)", "Wheat", "Eggs", "Dairy"}', '{"calories": 165, "fat": "10g", "carbs": "17g", "protein": "3g"}', false),
  ('walnut-cookie', 'Walnut Cookie', 220, '{"small": 220, "regular": 420, "large": 790}', 'nutty', 'Walnut Cookie.svg', 'Hearty roasted walnuts and caramelized brown sugar', '{"Flour", "Butter", "Brown Sugar", "Walnuts", "Eggs", "Cinnamon"}', '{"Tree Nuts (Walnuts)", "Wheat", "Eggs", "Dairy"}', '{"calories": 160, "fat": "9g", "carbs": "17g", "protein": "3g"}', false),
  ('macadamia-cookie', 'White Chocolate Macadamia', 260, '{"small": 260, "regular": 490, "large": 930}', 'nutty', 'Macadamia Cookie.svg', 'Creamy white chocolate chunks and Hawaiian roasted macadamia nuts', '{"Flour", "Butter", "Sugar", "Macadamia Nuts", "White Chocolate", "Eggs"}', '{"Tree Nuts (Macadamia)", "Wheat", "Eggs", "Dairy"}', '{"calories": 175, "fat": "10g", "carbs": "19g", "protein": "3g"}', false),
  ('hazelnut-cookie', 'Hazelnut Crunch Cookie', 240, '{"small": 240, "regular": 450, "large": 860}', 'nutty', 'Hazelnut Cookie.svg', 'Roasted hazelnuts paired with rich Nutella essence', '{"Flour", "Butter", "Sugar", "Hazelnuts", "Cocoa", "Eggs"}', '{"Tree Nuts (Hazelnuts)", "Wheat", "Eggs", "Dairy"}', '{"calories": 165, "fat": "9g", "carbs": "18g", "protein": "3g"}', false),
  ('red-velvet', 'Red Velvet Cream Cheese', 240, '{"small": 240, "regular": 450, "large": 860}', 'specialty', 'Red Velvet Cookie.svg', 'Crimson cocoa dough stuffed with a tangy cream cheese center', '{"Flour", "Butter", "Sugar", "Cocoa", "Cream Cheese", "Red Food Coloring", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 160, "fat": "8g", "carbs": "19g", "protein": "2g"}', true),
  ('lemon-cookie', 'Zesty Lemon Glaze Cookie', 200, '{"small": 200, "regular": 380, "large": 720}', 'specialty', 'Lemon Cookie.svg', 'Bright and refreshing with fresh lemon zest and sugar glaze', '{"Flour", "Butter", "Sugar", "Fresh Lemon Zest", "Lemon Juice", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 140, "fat": "6g", "carbs": "19g", "protein": "2g"}', false),
  ('cranberry-cookie', 'Cranberry Orange Cookie', 210, '{"small": 210, "regular": 400, "large": 760}', 'specialty', 'Cranberry Orange Cookie.svg', 'Tart dried cranberries with fragrant citrus orange zest', '{"Flour", "Butter", "Sugar", "Dried Cranberries", "Orange Zest", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 145, "fat": "6g", "carbs": "20g", "protein": "2g"}', false),
  ('gingerbread', 'Spiced Gingerbread Cookie', 200, '{"small": 200, "regular": 380, "large": 720}', 'specialty', 'Gingerbread Cookie.svg', 'Warm spiced gingerbread cookie with cinnamon, nutmeg and ginger', '{"Flour", "Molasses", "Butter", "Brown Sugar", "Ginger", "Cinnamon", "Nutmeg"}', '{"Wheat", "Dairy"}', '{"calories": 140, "fat": "5g", "carbs": "21g", "protein": "2g"}', false),
  ('pumpkin-spice', 'Pumpkin Spice Cookie', 220, '{"small": 220, "regular": 420, "large": 790}', 'specialty', 'Pumpkin Spice Cookie.svg', 'Cozy pumpkin puree infused with warm autumn spices', '{"Pumpkin Puree", "Flour", "Butter", "Brown Sugar", "Pumpkin Spice", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 150, "fat": "6g", "carbs": "21g", "protein": "2g"}', false),
  ('salted-caramel', 'Salted Caramel Cookie', 250, '{"small": 250, "regular": 475, "large": 905}', 'specialty', 'Salted Caramel Cookie.svg', 'Sweet gooey caramel pockets sprinkled with crunchy sea salt flakes', '{"Flour", "Butter", "Caramel", "Brown Sugar", "Sea Salt", "Eggs"}', '{"Wheat", "Eggs", "Dairy"}', '{"calories": 170, "fat": "9g", "carbs": "20g", "protein": "2g"}', false)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  box_prices = excluded.box_prices,
  category = excluded.category,
  image = excluded.image,
  description = excluded.description,
  ingredients = excluded.ingredients,
  allergens = excluded.allergens,
  nutrition_facts = excluded.nutrition_facts,
  is_featured = excluded.is_featured;
