-- ============================================================
-- MyConnecticutKids.com — Sample Listings Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── Helper: insert listings ─────────────────────────────────────────────────

insert into listings (name, slug, description, short_desc, town, address, phone, website, age_min, age_max, cost_description, is_free, status, is_featured) values

(
  'Sonny''s Place',
  'sonnys-place',
  'Sonny''s Place is one of Connecticut''s premier family entertainment centers, featuring go-karts, mini golf, batting cages, an arcade, and seasonal outdoor activities. A perfect all-ages destination for birthday parties and family outings.',
  'Go-karts, mini golf, batting cages & arcade — CT''s top family fun center.',
  'Somers',
  '349 Main St, Somers, CT 06071',
  '(860) 763-0003',
  'https://sonnysplace.com',
  3, 99,
  'Pay per activity',
  false, 'approved', true
),

(
  'Brookfield Craft Center',
  'brookfield-craft-center',
  'The Brookfield Craft Center offers hundreds of hands-on art and craft classes for children and adults year-round, including pottery, weaving, blacksmithing, woodworking, jewelry making, and more. Classes run in sessions for all skill levels.',
  'Hands-on art & craft classes for kids — pottery, weaving, jewelry & more.',
  'Glastonbury',
  '286 Whisconier Rd, Brookfield, CT 06804',
  '(203) 775-4526',
  'https://brookfieldcraft.org',
  5, 18,
  'From $30/class',
  false, 'approved', true
),

(
  'Whippersnappers Play Gym',
  'whippersnappers-play-gym',
  'Whippersnappers is an indoor play gym designed for babies, toddlers, and preschoolers. Featuring soft play structures, slides, a toddler zone, and open gym sessions. Drop-in and membership options available.',
  'Indoor soft-play gym for babies, toddlers & preschoolers. Drop-in welcome!',
  'West Hartford',
  '616 New Park Ave, West Hartford, CT 06110',
  '(860) 236-7529',
  'https://whippersnappersgym.com',
  0, 6,
  '$12/child, $8/sibling',
  false, 'approved', true
),

(
  'Kings Highway Tennis Club',
  'kings-highway-tennis-club',
  'Kings Highway Tennis Club offers junior tennis programs, summer tennis camps, and adult leagues in a beautiful outdoor and indoor setting. USTA-certified coaching staff for all levels from beginner to competitive.',
  'Junior tennis programs, summer camps & leagues for all skill levels.',
  'Glastonbury',
  '55 Kings Hwy, Glastonbury, CT 06033',
  '(860) 633-8000',
  'https://kingstennis.com',
  4, 18,
  'Seasonal membership + lessons',
  false, 'approved', true
),

(
  'Educational Playcare',
  'educational-playcare',
  'Educational Playcare is a trusted Connecticut childcare and preschool provider with multiple locations. They offer full-day programs, half-day preschool, before/after school care, and summer camps for children from 6 weeks through school age.',
  'Trusted CT childcare & preschool — infant through school age, multiple locations.',
  'Manchester',
  '891 Middle Tpke W, Manchester, CT 06040',
  '(860) 432-9311',
  'https://educationalplaycare.com',
  0, 13,
  'Monthly tuition — call for rates',
  false, 'approved', true
),

(
  'The Little Gym of West Hartford',
  'little-gym-west-hartford',
  'The Little Gym offers non-competitive gymnastics, dance, and sports classes for children ages 4 months to 12 years. Classes focus on physical development, confidence-building, and FUN. Birthday party packages available.',
  'Gymnastics, dance & sports classes for kids 4 months–12 years. Parties too!',
  'West Hartford',
  '1260 New Britain Ave, West Hartford, CT 06110',
  '(860) 521-9100',
  'https://thelittlegym.com/westhartford',
  0, 12,
  'Monthly membership from $69',
  false, 'approved', false
),

(
  'ConnCAT Youth Programs',
  'conncat-youth-programs',
  'ConnCAT offers free and low-cost arts education programs for Hartford-area youth, including visual arts, music, dance, and STEAM programs. After-school and summer enrichment available for K–12 students.',
  'Free & low-cost arts, music, dance & STEAM programs for Hartford youth.',
  'Hartford',
  '360 Fern St, Hartford, CT 06105',
  '(860) 956-2228',
  'https://conncat.org',
  5, 18,
  'Free – low cost (scholarship available)',
  true, 'approved', false
),

(
  'Simsbury Farms Recreation',
  'simsbury-farms-recreation',
  'Simsbury Farms is a town-owned recreation complex featuring an Olympic-size pool, ice skating, golf, tennis, and year-round programming for kids and families. Summer swim team, skating lessons, youth golf clinics, and more.',
  'Town recreation complex with pool, skating, golf & year-round kids programs.',
  'Simsbury',
  '100 Old Farms Rd, Simsbury, CT 06070',
  '(860) 658-3836',
  'https://simsbury-ct.gov/simsbury-farms',
  3, 18,
  'Resident & non-resident rates',
  false, 'approved', true
),

(
  'Jump on In',
  'jump-on-in',
  'Jump on In is an indoor trampoline and inflatable park perfect for kids of all ages. Open jump sessions, foam pits, dodgeball courts, ninja warrior obstacles, and private birthday party rooms available.',
  'Indoor trampoline park with foam pits, dodgeball & ninja warrior for all ages.',
  'Enfield',
  '90 Freshwater Blvd, Enfield, CT 06082',
  '(860) 741-5867',
  'https://jumponinct.com',
  2, 99,
  '$15/hr open jump',
  false, 'approved', false
),

(
  'Valley Shore Children''s Theater',
  'valley-shore-childrens-theater',
  'Valley Shore Children''s Theater offers year-round theater arts classes, workshops, and productions for children ages 4–18. Programs include acting, improv, musical theater, and technical theater. Full performances each season.',
  'Theater arts classes & productions for kids ages 4–18. Acting, improv & musicals.',
  'Hartford',
  '103 Main St, Hartford, CT 06106',
  '(860) 555-0147',
  'https://vsct.org',
  4, 18,
  'Session fees from $120',
  false, 'approved', false
)

on conflict (slug) do nothing;

-- ─── Link listings to categories ─────────────────────────────────────────────

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'sonnys-place' and c.slug in ('things-to-do', 'birthday-parties')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'brookfield-craft-center' and c.slug in ('classes', 'education')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'whippersnappers-play-gym' and c.slug in ('things-to-do', 'childcare')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'kings-highway-tennis-club' and c.slug in ('sports', 'camps')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'educational-playcare' and c.slug in ('childcare', 'education')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'little-gym-west-hartford' and c.slug in ('classes', 'sports', 'birthday-parties')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'conncat-youth-programs' and c.slug in ('classes', 'education')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'simsbury-farms-recreation' and c.slug in ('sports', 'camps', 'things-to-do')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'jump-on-in' and c.slug in ('things-to-do', 'birthday-parties')
on conflict do nothing;

insert into listing_categories (listing_id, category_id)
select l.id, c.id from listings l, categories c
where l.slug = 'valley-shore-childrens-theater' and c.slug in ('classes', 'education')
on conflict do nothing;

-- ─── Sample hours (Sonny's Place) ────────────────────────────────────────────

insert into listing_hours (listing_id, day_of_week, opens_at, closes_at, is_closed)
select l.id, d.day, d.opens, d.closes, d.is_closed
from listings l,
(values
  (0, '11:00'::time, '21:00'::time, false),
  (1, null,          null,          true),
  (2, '15:00'::time, '21:00'::time, false),
  (3, '15:00'::time, '21:00'::time, false),
  (4, '15:00'::time, '22:00'::time, false),
  (5, '10:00'::time, '23:00'::time, false),
  (6, '10:00'::time, '22:00'::time, false)
) as d(day, opens, closes, is_closed)
where l.slug = 'sonnys-place'
on conflict do nothing;

-- ─── Sample hours (Whippersnappers) ──────────────────────────────────────────

insert into listing_hours (listing_id, day_of_week, opens_at, closes_at, is_closed)
select l.id, d.day, d.opens, d.closes, d.is_closed
from listings l,
(values
  (0, '09:30'::time, '13:00'::time, false),
  (1, '09:30'::time, '17:00'::time, false),
  (2, '09:30'::time, '17:00'::time, false),
  (3, '09:30'::time, '17:00'::time, false),
  (4, '09:30'::time, '17:00'::time, false),
  (5, '09:30'::time, '13:00'::time, false),
  (6, null,          null,          true)
) as d(day, opens, closes, is_closed)
where l.slug = 'whippersnappers-play-gym'
on conflict do nothing;
