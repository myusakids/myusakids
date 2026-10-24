-- 007_composite_unique_per_state.sql
-- Phase 4: convert single-column uniqueness to (state, X) composite uniqueness
-- for tenant-scoped tables so the same slug/name can exist across states.
--
-- Required before seeding a second state. CT currently uses state='CT' for
-- every row, so the composite constraint accepts all existing data unchanged.
--
-- Tables kept with GLOBAL uniqueness (shared across states):
--   categories, blog_categories — shared taxonomy
--
-- ROLLBACK:
--   alter table towns       drop constraint if exists towns_state_name_key;
--   alter table towns       drop constraint if exists towns_state_slug_key;
--   alter table towns       add  constraint towns_name_key unique (name);
--   alter table towns       add  constraint towns_slug_key unique (slug);
--   alter table listings    drop constraint if exists listings_state_slug_key;
--   alter table listings    add  constraint listings_slug_key unique (slug);
--   alter table events      drop constraint if exists events_state_slug_key;
--   alter table events      add  constraint events_slug_key unique (slug);
--   alter table blog_posts  drop constraint if exists blog_posts_state_slug_key;
--   alter table blog_posts  add  constraint blog_posts_slug_key unique (slug);
--   alter table ad_slots    drop constraint if exists ad_slots_state_name_key;
--   alter table ad_slots    add  constraint ad_slots_name_key unique (name);

-- towns: drop single-column unique on name AND slug, add composite
alter table towns drop constraint if exists towns_name_key;
alter table towns drop constraint if exists towns_slug_key;
alter table towns add constraint towns_state_name_key unique (state, name);
alter table towns add constraint towns_state_slug_key unique (state, slug);

-- listings: drop global slug unique, add composite
alter table listings drop constraint if exists listings_slug_key;
alter table listings add constraint listings_state_slug_key unique (state, slug);

-- events: drop global slug unique, add composite
alter table events drop constraint if exists events_slug_key;
alter table events add constraint events_state_slug_key unique (state, slug);

-- blog_posts: drop global slug unique, add composite
-- (also unblocks the api/blog/publish/route.ts onConflict handling)
alter table blog_posts drop constraint if exists blog_posts_slug_key;
alter table blog_posts add constraint blog_posts_state_slug_key unique (state, slug);

-- ad_slots: drop global name unique, add composite
alter table ad_slots drop constraint if exists ad_slots_name_key;
alter table ad_slots add constraint ad_slots_state_name_key unique (state, name);
