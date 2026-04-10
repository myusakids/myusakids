-- ============================================================
-- MyConnecticutKids.com — Events Calendar Schema
-- ============================================================

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text,
  listing_id      uuid references listings(id) on delete set null,
  town            text not null,
  address         text,
  start_date      date not null,
  end_date        date,
  start_time      time,
  end_time        time,
  is_free         boolean default false,
  cost            text,
  age_min         integer,
  age_max         integer,
  category_id     uuid references categories(id) on delete set null,
  is_recurring    boolean default false,
  recurrence_rule text,
  status          text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_featured     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists event_categories (
  event_id    uuid references events(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (event_id, category_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists events_status_idx      on events(status);
create index if not exists events_start_date_idx  on events(start_date);
create index if not exists events_town_idx        on events(town);
create index if not exists events_is_featured_idx on events(is_featured);

-- ─── updated_at trigger ───────────────────────────────────────────────────────

drop trigger if exists events_updated_at on events;
create trigger events_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table events           enable row level security;
alter table event_categories enable row level security;

create policy "approved events are public"
  on events for select
  using (status = 'approved');

create policy "event_categories are public"
  on event_categories for select using (true);

-- ─── Seed: 12 Connecticut family events (April–May 2026) ─────────────────────

insert into events (title, slug, description, town, address, start_date, end_date, start_time, end_time, is_free, cost, age_min, age_max, is_recurring, recurrence_rule, status, is_featured) values

(
  'Manchester Earth Day Family Festival',
  'manchester-earth-day-festival-2026',
  'Join us for a free outdoor celebration of Earth Day in Wickham Park! Activities include nature scavenger hunts, recycling crafts, seed planting stations, live music, food trucks, and a petting zoo. All ages welcome.',
  'Manchester',
  'Wickham Park, 1329 Middle Tpke E, Manchester, CT 06040',
  '2026-04-18', null,
  '10:00', '16:00',
  true, null,
  0, null,
  false, null,
  'approved', true
),

(
  'Storytime & Craft at West Hartford Library',
  'west-hartford-library-storytime-april-2026',
  'Weekly drop-in storytime for toddlers and preschoolers followed by a themed craft activity. This week: spring flowers and butterflies. No registration required.',
  'West Hartford',
  'West Hartford Public Library, 20 S Main St, West Hartford, CT 06107',
  '2026-04-11', null,
  '10:30', '11:30',
  true, null,
  1, 5,
  true, 'weekly',
  'approved', false
),

(
  'Youth Soccer Clinic — Simsbury Farms',
  'simsbury-youth-soccer-clinic-spring-2026',
  'A two-day soccer skills clinic for kids ages 6–14 led by USSF-licensed coaches. Covers dribbling, passing, shooting, and small-sided games. Registration required. Limited to 40 players.',
  'Simsbury',
  '100 Old Farms Rd, Simsbury, CT 06070',
  '2026-04-25', '2026-04-26',
  '09:00', '12:00',
  false, '$45/player',
  6, 14,
  false, null,
  'approved', true
),

(
  'Hartford Children''s Museum Free Admission Day',
  'hartford-childrens-museum-free-day-april-2026',
  'The Hartford Children''s Museum opens its doors for free on the third Saturday of each month, thanks to a community sponsorship. Explore hands-on exhibits on science, art, and nature. No registration needed.',
  'Hartford',
  '950 Trout Brook Dr, West Hartford, CT 06119',
  '2026-04-18', null,
  '09:00', '17:00',
  true, null,
  0, 12,
  true, 'monthly',
  'approved', true
),

(
  'Spring Family 5K Run — Glastonbury',
  'glastonbury-family-5k-spring-2026',
  'Lace up and join Glastonbury''s favorite spring 5K! Stroller-friendly, dog-friendly, with a 1-mile fun run option for little ones. Post-race celebration with food, medals, and a kids'' activity zone.',
  'Glastonbury',
  'Riverfront Park, Glastonbury, CT 06033',
  '2026-05-03', null,
  '08:30', '12:00',
  false, '$25/adult, $15/child, $60/family',
  0, null,
  false, null,
  'approved', true
),

(
  'Outdoor Movie Night: The Lion King — Enfield',
  'enfield-outdoor-movie-lion-king-2026',
  'Bring your blankets and lawn chairs for a free outdoor movie screening of The Lion King (1994) at the Enfield Town Green. Concessions available. Rain date: May 9.',
  'Enfield',
  'Enfield Town Green, 820 Enfield St, Enfield, CT 06082',
  '2026-05-02', null,
  '20:00', '22:30',
  true, null,
  0, null,
  false, null,
  'approved', true
),

(
  'Kids Art Workshop: Watercolor Birds',
  'glastonbury-watercolor-birds-workshop-2026',
  'A drop-in watercolor workshop for kids ages 5–12 at the Glastonbury Arts Center. All materials provided. Children will paint their favorite Connecticut birds using wet-on-wet watercolor techniques.',
  'Glastonbury',
  '2400 Main St, Glastonbury, CT 06033',
  '2026-04-12', null,
  '13:00', '15:00',
  false, '$18/child',
  5, 12,
  false, null,
  'approved', false
),

(
  'Avon Farmers Market Opening Day',
  'avon-farmers-market-opening-day-2026',
  'The Avon Farmers Market opens for the season! Shop fresh local produce, baked goods, honey, and handmade crafts. Kids'' activity tent with face painting, seed packets to take home, and a junior chef demo.',
  'Avon',
  'Avon Old Farms Rd & Nod Rd, Avon, CT 06001',
  '2026-05-09', null,
  '09:00', '13:00',
  true, null,
  0, null,
  true, 'weekly',
  'approved', false
),

(
  'Windsor Gymnastics Open House',
  'windsor-gymnastics-open-house-2026',
  'Try gymnastics for free! Windsor Gymnastics Academy is hosting an open house for children ages 3–14. Kids rotate through all apparatus with qualified coaches. Parents welcome on the floor. No registration needed.',
  'Windsor',
  '1500 Sullivan Ave, South Windsor, CT 06074',
  '2026-04-19', null,
  '10:00', '13:00',
  true, null,
  3, 14,
  false, null,
  'approved', false
),

(
  'Nature Explorers Hike — Coventry',
  'coventry-nature-explorers-hike-may-2026',
  'A guided family nature hike at the Nathan Hale State Forest. Look for spring wildflowers, migrating birds, and salamanders. Easy 2-mile trail, perfect for ages 4 and up. Bring water and wear sturdy shoes.',
  'Coventry',
  'Nathan Hale State Forest, Coventry, CT 06238',
  '2026-05-16', null,
  '09:30', '11:30',
  true, null,
  4, null,
  false, null,
  'approved', true
),

(
  'STEM Robotics Challenge — Manchester',
  'manchester-stem-robotics-challenge-2026',
  'Teams of 2–4 kids compete to build and program robots that complete obstacle courses. Beginner and advanced divisions. Hosted by Manchester Makerspace in partnership with the public library. Registration required.',
  'Manchester',
  'Manchester Public Library, 586 Main St, Manchester, CT 06040',
  '2026-05-23', null,
  '10:00', '15:00',
  false, '$10/team',
  8, 17,
  false, null,
  'approved', true
),

(
  'Farmington Valley Kite Festival',
  'farmington-kite-festival-2026',
  'Fly kites, watch stunt kite demonstrations, and enter the kids'' decorated kite contest at this beloved annual festival. Prizes for most creative, highest-flying, and best homemade kite. Free admission, kites available for purchase on-site.',
  'Farmington',
  'Batterson Park, 364 Batterson Park Rd, Farmington, CT 06032',
  '2026-05-10', null,
  '11:00', '17:00',
  true, null,
  0, null,
  false, null,
  'approved', true
)

on conflict (slug) do nothing;

-- ─── Link events to categories ────────────────────────────────────────────────

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'manchester-earth-day-festival-2026'
  and c.slug in ('things-to-do', 'health')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'west-hartford-library-storytime-april-2026'
  and c.slug in ('education', 'classes')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'simsbury-youth-soccer-clinic-spring-2026'
  and c.slug in ('sports', 'camps')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'hartford-childrens-museum-free-day-april-2026'
  and c.slug in ('things-to-do', 'education')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'glastonbury-family-5k-spring-2026'
  and c.slug in ('sports', 'health')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'enfield-outdoor-movie-lion-king-2026'
  and c.slug in ('things-to-do')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'glastonbury-watercolor-birds-workshop-2026'
  and c.slug in ('classes', 'education')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'avon-farmers-market-opening-day-2026'
  and c.slug in ('things-to-do', 'health')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'windsor-gymnastics-open-house-2026'
  and c.slug in ('sports', 'classes')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'coventry-nature-explorers-hike-may-2026'
  and c.slug in ('things-to-do', 'health')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'manchester-stem-robotics-challenge-2026'
  and c.slug in ('education', 'classes')
on conflict do nothing;

insert into event_categories (event_id, category_id)
select e.id, c.id from events e, categories c
where e.slug = 'farmington-kite-festival-2026'
  and c.slug in ('things-to-do')
on conflict do nothing;
