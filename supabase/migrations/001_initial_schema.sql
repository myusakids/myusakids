-- ============================================================
-- MyConnecticutKids.com — Initial Schema
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
create extension if not exists "pgcrypto";

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists towns (
  id        uuid primary key default gen_random_uuid(),
  name      text not null unique,
  slug      text not null unique,
  county    text
);

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  icon       text,
  color      text,
  sort_order integer default 0
);

create table if not exists listings (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  short_desc       text,
  town             text not null,
  address          text,
  phone            text,
  website          text,
  email            text,
  age_min          integer,
  age_max          integer,
  cost_description text,
  is_free          boolean default false,
  status           text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_featured      boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists listing_categories (
  listing_id  uuid references listings(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (listing_id, category_id)
);

create table if not exists listing_images (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  url        text not null,
  is_primary boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists listing_hours (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references listings(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at    time,
  closes_at   time,
  is_closed   boolean default false
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists listings_status_idx       on listings(status);
create index if not exists listings_town_idx         on listings(town);
create index if not exists listings_is_featured_idx  on listings(is_featured);
create index if not exists listings_search_idx       on listings
  using gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(short_desc,'')));

-- ─── updated_at trigger ───────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_updated_at on listings;
create trigger listings_updated_at
  before update on listings
  for each row execute function set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table listings          enable row level security;
alter table categories        enable row level security;
alter table listing_categories enable row level security;
alter table listing_images    enable row level security;
alter table listing_hours     enable row level security;
alter table towns             enable row level security;

-- Public read: approved listings only
create policy "approved listings are public"
  on listings for select
  using (status = 'approved');

-- Public read: all categories, images, hours, towns, junction
create policy "categories are public"
  on categories for select using (true);

create policy "listing_categories are public"
  on listing_categories for select using (true);

create policy "listing_images are public"
  on listing_images for select using (true);

create policy "listing_hours are public"
  on listing_hours for select using (true);

create policy "towns are public"
  on towns for select using (true);

-- ─── Seed: Categories ─────────────────────────────────────────────────────────

insert into categories (name, slug, icon, color, sort_order) values
  ('Camps',                'camps',            '⛺', '#1D9E75', 1),
  ('Classes & programs',   'classes',          '🎨', '#E67E22', 2),
  ('Sports & athletics',   'sports',           '⚽', '#2980B9', 3),
  ('Things to do',         'things-to-do',     '🎡', '#8E44AD', 4),
  ('Birthday parties',     'birthday-parties', '🎂', '#E74C3C', 5),
  ('Childcare & preschool','childcare',        '🏫', '#F39C12', 6),
  ('Education',            'education',        '📚', '#27AE60', 7),
  ('Health & wellness',    'health',           '❤️', '#C0392B', 8)
on conflict (slug) do nothing;

-- ─── Seed: Towns ─────────────────────────────────────────────────────────────

insert into towns (name, slug, county) values
  ('Manchester',      'manchester',      'Hartford'),
  ('Hartford',        'hartford',        'Hartford'),
  ('West Hartford',   'west-hartford',   'Hartford'),
  ('Glastonbury',     'glastonbury',     'Hartford'),
  ('Simsbury',        'simsbury',        'Hartford'),
  ('Avon',            'avon',            'Hartford'),
  ('Farmington',      'farmington',      'Hartford'),
  ('Newington',       'newington',       'Hartford'),
  ('Bloomfield',      'bloomfield',      'Hartford'),
  ('Somers',          'somers',          'Tolland'),
  ('Enfield',         'enfield',         'Hartford'),
  ('Windsor',         'windsor',         'Hartford'),
  ('South Windsor',   'south-windsor',   'Hartford'),
  ('Vernon',          'vernon',          'Tolland'),
  ('Tolland',         'tolland',         'Tolland'),
  ('Coventry',        'coventry',        'Tolland'),
  ('Storrs',          'storrs',          'Tolland'),
  ('Mansfield',       'mansfield',       'Tolland'),
  ('Bolton',          'bolton',          'Tolland'),
  ('Andover',         'andover',         'Tolland'),
  ('Columbia',        'columbia',        'Tolland'),
  ('Hebron',          'hebron',          'Tolland'),
  ('Marlborough',     'marlborough',     'Hartford')
on conflict (slug) do nothing;
