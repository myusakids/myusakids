-- ============================================================
-- MyConnecticutKids.com — Phase 4: Analytics, Blog, Ads, Full Towns
-- ============================================================

-- ─── Extend towns table with all 169 CT municipalities ───────────────────────

insert into towns (name, slug, county) values
('Andover', 'andover', 'Tolland'),
('Ansonia', 'ansonia', 'New Haven'),
('Ashford', 'ashford', 'Windham'),
('Avon', 'avon', 'Hartford'),
('Barkhamsted', 'barkhamsted', 'Litchfield'),
('Beacon Falls', 'beacon-falls', 'New Haven'),
('Berlin', 'berlin', 'Hartford'),
('Bethany', 'bethany', 'New Haven'),
('Bethel', 'bethel', 'Fairfield'),
('Bethlehem', 'bethlehem', 'Litchfield'),
('Bloomfield', 'bloomfield', 'Hartford'),
('Bolton', 'bolton', 'Tolland'),
('Bozrah', 'bozrah', 'New London'),
('Branford', 'branford', 'New Haven'),
('Bridgeport', 'bridgeport', 'Fairfield'),
('Bridgewater', 'bridgewater', 'Litchfield'),
('Bristol', 'bristol', 'Hartford'),
('Brookfield', 'brookfield', 'Fairfield'),
('Brooklyn', 'brooklyn', 'Windham'),
('Burlington', 'burlington', 'Hartford'),
('Canaan', 'canaan', 'Litchfield'),
('Canterbury', 'canterbury', 'Windham'),
('Canton', 'canton', 'Hartford'),
('Chaplin', 'chaplin', 'Windham'),
('Cheshire', 'cheshire', 'New Haven'),
('Chester', 'chester', 'Middlesex'),
('Clinton', 'clinton', 'Middlesex'),
('Colchester', 'colchester', 'Middlesex'),
('Colebrook', 'colebrook', 'Litchfield'),
('Columbia', 'columbia', 'Tolland'),
('Cornwall', 'cornwall', 'Litchfield'),
('Coventry', 'coventry', 'Tolland'),
('Cromwell', 'cromwell', 'Middlesex'),
('Danbury', 'danbury', 'Fairfield'),
('Darien', 'darien', 'Fairfield'),
('Deep River', 'deep-river', 'Middlesex'),
('Derby', 'derby', 'New Haven'),
('Durham', 'durham', 'Middlesex'),
('East Granby', 'east-granby', 'Hartford'),
('East Haddam', 'east-haddam', 'Middlesex'),
('East Hampton', 'east-hampton', 'Middlesex'),
('East Hartford', 'east-hartford', 'Hartford'),
('East Haven', 'east-haven', 'New Haven'),
('East Lyme', 'east-lyme', 'New London'),
('East Windsor', 'east-windsor', 'Hartford'),
('Eastford', 'eastford', 'Windham'),
('Easton', 'easton', 'Fairfield'),
('Ellington', 'ellington', 'Tolland'),
('Enfield', 'enfield', 'Hartford'),
('Essex', 'essex', 'Middlesex'),
('Fairfield', 'fairfield', 'Fairfield'),
('Farmington', 'farmington', 'Hartford'),
('Franklin', 'franklin', 'New London'),
('Glastonbury', 'glastonbury', 'Hartford'),
('Goshen', 'goshen', 'Litchfield'),
('Granby', 'granby', 'Hartford'),
('Greenwich', 'greenwich', 'Fairfield'),
('Griswold', 'griswold', 'New London'),
('Groton', 'groton', 'New London'),
('Guilford', 'guilford', 'New Haven'),
('Haddam', 'haddam', 'Middlesex'),
('Hamden', 'hamden', 'New Haven'),
('Hampton', 'hampton', 'Windham'),
('Hartford', 'hartford', 'Hartford'),
('Hartland', 'hartland', 'Hartford'),
('Harwinton', 'harwinton', 'Litchfield'),
('Hebron', 'hebron', 'Tolland'),
('Kent', 'kent', 'Litchfield'),
('Killingly', 'killingly', 'Windham'),
('Killingworth', 'killingworth', 'Middlesex'),
('Lebanon', 'lebanon', 'New London'),
('Ledyard', 'ledyard', 'New London'),
('Lisbon', 'lisbon', 'New London'),
('Litchfield', 'litchfield', 'Litchfield'),
('Lyme', 'lyme', 'New London'),
('Madison', 'madison', 'New Haven'),
('Manchester', 'manchester', 'Hartford'),
('Mansfield', 'mansfield', 'Tolland'),
('Marlborough', 'marlborough', 'Hartford'),
('Meriden', 'meriden', 'New Haven'),
('Middlebury', 'middlebury', 'New Haven'),
('Middlefield', 'middlefield', 'Middlesex'),
('Middletown', 'middletown', 'Middlesex'),
('Milford', 'milford', 'New Haven'),
('Monroe', 'monroe', 'Fairfield'),
('Montville', 'montville', 'New London'),
('Morris', 'morris', 'Litchfield'),
('Naugatuck', 'naugatuck', 'New Haven'),
('New Britain', 'new-britain', 'Hartford'),
('New Canaan', 'new-canaan', 'Fairfield'),
('New Fairfield', 'new-fairfield', 'Fairfield'),
('New Hartford', 'new-hartford', 'Litchfield'),
('New Haven', 'new-haven', 'New Haven'),
('New London', 'new-london', 'New London'),
('New Milford', 'new-milford', 'Litchfield'),
('Newington', 'newington', 'Hartford'),
('Newtown', 'newtown', 'Fairfield'),
('Norfolk', 'norfolk', 'Litchfield'),
('North Branford', 'north-branford', 'New Haven'),
('North Canaan', 'north-canaan', 'Litchfield'),
('North Haven', 'north-haven', 'New Haven'),
('North Stonington', 'north-stonington', 'New London'),
('Norwalk', 'norwalk', 'Fairfield'),
('Norwich', 'norwich', 'New London'),
('Old Lyme', 'old-lyme', 'New London'),
('Old Saybrook', 'old-saybrook', 'Middlesex'),
('Orange', 'orange', 'New Haven'),
('Oxford', 'oxford', 'New Haven'),
('Plainfield', 'plainfield', 'Windham'),
('Plainville', 'plainville', 'Hartford'),
('Plymouth', 'plymouth', 'Litchfield'),
('Pomfret', 'pomfret', 'Windham'),
('Portland', 'portland', 'Middlesex'),
('Preston', 'preston', 'New London'),
('Prospect', 'prospect', 'New Haven'),
('Putnam', 'putnam', 'Windham'),
('Redding', 'redding', 'Fairfield'),
('Ridgefield', 'ridgefield', 'Fairfield'),
('Rocky Hill', 'rocky-hill', 'Hartford'),
('Roxbury', 'roxbury', 'Litchfield'),
('Salem', 'salem', 'New London'),
('Salisbury', 'salisbury', 'Litchfield'),
('Scotland', 'scotland', 'Windham'),
('Seymour', 'seymour', 'New Haven'),
('Sharon', 'sharon', 'Litchfield'),
('Shelton', 'shelton', 'Fairfield'),
('Sherman', 'sherman', 'Fairfield'),
('Simsbury', 'simsbury', 'Hartford'),
('Somers', 'somers', 'Tolland'),
('South Windsor', 'south-windsor', 'Hartford'),
('Southbury', 'southbury', 'New Haven'),
('Southington', 'southington', 'Hartford'),
('Sprague', 'sprague', 'New London'),
('Stafford', 'stafford', 'Tolland'),
('Stamford', 'stamford', 'Fairfield'),
('Sterling', 'sterling', 'Windham'),
('Stonington', 'stonington', 'New London'),
('Storrs', 'storrs', 'Tolland'),
('Stratford', 'stratford', 'Fairfield'),
('Suffield', 'suffield', 'Hartford'),
('Thomaston', 'thomaston', 'Litchfield'),
('Thompson', 'thompson', 'Windham'),
('Tolland', 'tolland', 'Tolland'),
('Torrington', 'torrington', 'Litchfield'),
('Trumbull', 'trumbull', 'Fairfield'),
('Union', 'union', 'Tolland'),
('Vernon', 'vernon', 'Tolland'),
('Voluntown', 'voluntown', 'Windham'),
('Wallingford', 'wallingford', 'New Haven'),
('Warren', 'warren', 'Litchfield'),
('Washington', 'washington', 'Litchfield'),
('Waterbury', 'waterbury', 'New Haven'),
('Waterford', 'waterford', 'New London'),
('Watertown', 'watertown', 'Litchfield'),
('Westbrook', 'westbrook', 'Middlesex'),
('West Hartford', 'west-hartford', 'Hartford'),
('West Haven', 'west-haven', 'New Haven'),
('Weston', 'weston', 'Fairfield'),
('Wethersfield', 'wethersfield', 'Hartford'),
('Willimantic', 'willimantic', 'Windham'),
('Willington', 'willington', 'Tolland'),
('Wilton', 'wilton', 'Fairfield'),
('Windham', 'windham', 'Windham'),
('Windsor', 'windsor', 'Hartford'),
('Windsor Locks', 'windsor-locks', 'Hartford'),
('Winsted', 'winsted', 'Litchfield'),
('Wolcott', 'wolcott', 'New Haven'),
('Woodbridge', 'woodbridge', 'New Haven'),
('Woodbury', 'woodbury', 'Litchfield'),
('Woodstock', 'woodstock', 'Windham')
on conflict (slug) do nothing;

-- ─── Analytics ────────────────────────────────────────────────────────────────

create table if not exists analytics_events (
  id           uuid primary key default gen_random_uuid(),
  event_type   text not null, -- 'listing_view' | 'website_click' | 'directions_click' | 'event_view' | 'listing_save' | 'event_save'
  listing_id   uuid references listings(id) on delete cascade,
  event_id     uuid references events(id) on delete cascade,
  session_id   text,          -- anonymous session identifier
  created_at   timestamptz default now()
);

create index if not exists analytics_listing_idx   on analytics_events(listing_id);
create index if not exists analytics_event_idx     on analytics_events(event_id);
create index if not exists analytics_type_idx      on analytics_events(event_type);
create index if not exists analytics_created_idx   on analytics_events(created_at);

alter table analytics_events enable row level security;

-- Anyone can insert analytics (anonymous tracking)
create policy "anyone can insert analytics"
  on analytics_events for insert
  with check (true);

-- Only admins can read analytics
create policy "admins can read analytics"
  on analytics_events for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Owners can read analytics for their own listings
create policy "owners can read own listing analytics"
  on analytics_events for select
  using (
    listing_id is not null and
    exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid())
  );

-- ─── Blog ─────────────────────────────────────────────────────────────────────

create table if not exists blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  body             text not null,          -- HTML or Markdown
  meta_title       text,
  meta_description text,
  featured_image   text,                   -- URL
  status           text default 'draft' check (status in ('draft', 'published')),
  author_name      text default 'MyConnecticutKids Team',
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists blog_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz default now()
);

create table if not exists blog_post_categories (
  post_id     uuid references blog_posts(id) on delete cascade,
  category_id uuid references blog_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

-- Blog post keywords for SEO targeting
create table if not exists blog_post_keywords (
  id       uuid primary key default gen_random_uuid(),
  post_id  uuid references blog_posts(id) on delete cascade,
  keyword  text not null
);

create index if not exists blog_posts_slug_idx      on blog_posts(slug);
create index if not exists blog_posts_status_idx    on blog_posts(status);
create index if not exists blog_posts_published_idx on blog_posts(published_at desc);

drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

alter table blog_posts           enable row level security;
alter table blog_categories      enable row level security;
alter table blog_post_categories enable row level security;
alter table blog_post_keywords   enable row level security;

-- Public can read published posts
create policy "published posts are public"
  on blog_posts for select
  using (status = 'published');

create policy "blog_categories are public"
  on blog_categories for select using (true);

create policy "blog_post_categories are public"
  on blog_post_categories for select using (true);

create policy "blog_post_keywords are public"
  on blog_post_keywords for select using (true);

-- Admins can do everything
create policy "admins can manage blog_posts"
  on blog_posts for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can manage blog_categories"
  on blog_categories for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can manage blog_post_categories"
  on blog_post_categories for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can manage blog_post_keywords"
  on blog_post_keywords for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Ad slots ────────────────────────────────────────────────────────────────

create table if not exists ad_slots (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,   -- 'blog_sidebar_top', 'blog_bottom', etc.
  label       text not null,          -- Human-readable label for admin UI
  ad_type     text not null check (ad_type in ('adsense', 'amazon', 'custom')),
  code        text,                   -- The embed code / script tag
  is_active   boolean default false,
  updated_at  timestamptz default now()
);

alter table ad_slots enable row level security;

-- Anyone can read active ad slots (needed to render them publicly)
create policy "active ad slots are public"
  on ad_slots for select
  using (is_active = true);

create policy "admins can manage ad_slots"
  on ad_slots for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Seed default ad slot positions
insert into ad_slots (name, label, ad_type, is_active) values
  ('blog_sidebar_top',    'Blog — Sidebar top',     'adsense', false),
  ('blog_sidebar_bottom', 'Blog — Sidebar bottom',  'amazon',  false),
  ('blog_post_bottom',    'Blog post — Bottom',     'adsense', false),
  ('blog_list_banner',    'Blog list — Banner',     'adsense', false),
  ('site_footer_banner',  'Site-wide footer banner','adsense', false)
on conflict (name) do nothing;

-- ─── Seed blog categories ─────────────────────────────────────────────────────

insert into blog_categories (name, slug) values
  ('Camps & Programs',   'camps-programs'),
  ('Activities',         'activities'),
  ('Education',          'education'),
  ('Family Health',      'family-health'),
  ('Local Guides',       'local-guides'),
  ('Seasonal Fun',       'seasonal-fun'),
  ('Birthday Ideas',     'birthday-ideas'),
  ('Budget Family Fun',  'budget-family-fun')
on conflict (slug) do nothing;
