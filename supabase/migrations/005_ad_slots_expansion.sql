-- Expand ad_slots with placements for home, town, category pages and sidebar.

insert into ad_slots (name, label, ad_type, is_active) values
  ('home_top',          'Home — Below hero',             'adsense', false),
  ('home_middle',       'Home — Between sections',       'adsense', false),
  ('town_top',          'Town page — Above listings',    'adsense', false),
  ('town_mid',          'Town page — Mid-grid',          'adsense', false),
  ('category_top',      'Category page — Above grid',    'adsense', false),
  ('category_mid',      'Category page — Mid-grid',      'adsense', false),
  ('sidebar_300x600',   'Site-wide sidebar (300×600)',   'adsense', false)
on conflict (name) do nothing;
