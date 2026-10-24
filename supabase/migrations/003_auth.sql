-- ============================================================
-- MyConnecticutKids.com — Phase 3: Auth, Profiles, Owner RLS
-- ============================================================

-- ─── Profiles table ───────────────────────────────────────────────────────────

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text default 'owner' check (role in ('owner', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can read and update their own profile
create policy "users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "admins can read all profiles"
  on profiles for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admins can update any profile (to change roles)
create policy "admins can update all profiles"
  on profiles for update
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─── Auto-create profile on signup ───────────────────────────────────────────

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Add owner_id to listings ─────────────────────────────────────────────────

alter table listings add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists listings_owner_idx on listings(owner_id);

-- ─── Add owner_id to events ───────────────────────────────────────────────────

alter table events add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists events_owner_idx on events(owner_id);

-- ─── Updated RLS for listings ─────────────────────────────────────────────────

-- Allow anyone (including anon) to submit a new listing
create policy "anyone can submit a listing"
  on listings for insert
  with check (true);

-- Allow anyone (including anon) to submit listing_categories, hours
create policy "anyone can insert listing_categories"
  on listing_categories for insert
  with check (true);

create policy "anyone can insert listing_hours"
  on listing_hours for insert
  with check (true);

create policy "anyone can insert listing_images"
  on listing_images for insert
  with check (true);

-- Owners can read their own listings (even pending/rejected)
create policy "owners can read own listings"
  on listings for select
  using (auth.uid() = owner_id);

-- Owners can update their own listings
create policy "owners can update own listings"
  on listings for update
  using (auth.uid() = owner_id);

-- Owners can delete their own listing_images
create policy "owners can delete own listing_images"
  on listing_images for delete
  using (
    exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid())
  );

-- Admins can do everything to listings
create policy "admins can manage all listings"
  on listings for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can manage listing_categories"
  on listing_categories for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can manage listing_images"
  on listing_images for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can manage listing_hours"
  on listing_hours for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─── Updated RLS for events ───────────────────────────────────────────────────

-- Allow anyone to submit events
create policy "anyone can submit an event"
  on events for insert
  with check (true);

create policy "anyone can insert event_categories"
  on event_categories for insert
  with check (true);

-- Owners can read their own events
create policy "owners can read own events"
  on events for select
  using (auth.uid() = owner_id);

-- Owners can update their own events
create policy "owners can update own events"
  on events for update
  using (auth.uid() = owner_id);

-- Owners can delete their own events
create policy "owners can delete own events"
  on events for delete
  using (auth.uid() = owner_id);

-- Admins can do everything to events
create policy "admins can manage all events"
  on events for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can manage event_categories"
  on event_categories for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
