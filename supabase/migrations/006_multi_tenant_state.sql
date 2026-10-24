-- 006_multi_tenant_state.sql
-- Phase 2 of multi-tenant refactor: add `state` column to tenant-scoped tables.
--
-- Design notes:
--   * All existing rows default to 'CT' so the current site keeps working with
--     zero data migration. Columns use TEXT (two-letter US postal code).
--   * profiles.admin_state is NULLABLE on purpose:
--       - NULL         => super-admin (manages every state, back-compat)
--       - 'CT' / 'NY'  => state-scoped admin (manages only that state's data)
--   * This migration intentionally does NOT modify existing RLS policies.
--     Tenant isolation is enforced at the application layer in Phase 3 by
--     filtering every query with .eq('state', <currentState>). We can layer
--     RLS enforcement in later if we want a defense-in-depth safety net.
--
-- ROLLBACK (safe, non-destructive):
--   alter table listings         drop column if exists state;
--   alter table events           drop column if exists state;
--   alter table towns            drop column if exists state;
--   alter table blog_posts       drop column if exists state;
--   alter table ad_slots         drop column if exists state;
--   alter table analytics_events drop column if exists state;
--   alter table profiles         drop column if exists admin_state;
--   drop index if exists listings_state_idx;
--   drop index if exists events_state_idx;
--   drop index if exists towns_state_idx;
--   drop index if exists blog_posts_state_idx;
--   drop index if exists ad_slots_state_idx;
--   drop index if exists analytics_events_state_idx;

-- ── Add state column to tenant-scoped tables ───────────────────────────────
alter table listings         add column if not exists state text not null default 'CT';
alter table events           add column if not exists state text not null default 'CT';
alter table towns            add column if not exists state text not null default 'CT';
alter table blog_posts       add column if not exists state text not null default 'CT';
alter table ad_slots         add column if not exists state text not null default 'CT';
alter table analytics_events add column if not exists state text not null default 'CT';

-- Admin role scoping (nullable; null = super-admin for back-compat)
alter table profiles add column if not exists admin_state text;

-- ── Indexes for state-filtered queries ─────────────────────────────────────
create index if not exists listings_state_idx         on listings(state);
create index if not exists events_state_idx           on events(state);
create index if not exists towns_state_idx            on towns(state);
create index if not exists blog_posts_state_idx       on blog_posts(state);
create index if not exists ad_slots_state_idx         on ad_slots(state);
create index if not exists analytics_events_state_idx on analytics_events(state);
