// ─── Base table types ────────────────────────────────────────────────────────

export type ListingStatus = "pending" | "approved" | "rejected";

export interface Listing {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_desc: string | null;
  town: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  age_min: number | null;
  age_max: number | null;
  cost_description: string | null;
  is_free: boolean;
  status: ListingStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface ListingCategory {
  listing_id: string;
  category_id: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ListingHours {
  id: string;
  listing_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  opens_at: string | null; // "HH:MM:SS"
  closes_at: string | null; // "HH:MM:SS"
  is_closed: boolean;
}

export interface Town {
  id: string;
  name: string;
  slug: string;
  county: string | null;
}

// ─── Event types ──────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  listing_id: string | null;
  town: string;
  address: string | null;
  start_date: string;       // ISO date string "YYYY-MM-DD"
  end_date: string | null;
  start_time: string | null; // "HH:MM:SS"
  end_time: string | null;
  is_free: boolean;
  cost: string | null;
  age_min: number | null;
  age_max: number | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
}

export type EventWithDetails = Event & {
  categories: Category[];
  listing: Pick<Listing, "name" | "slug"> | null;
};

export type EventCard = Pick<
  Event,
  "id" | "title" | "slug" | "town" | "start_date" | "start_time" | "is_free" | "cost" | "age_min" | "age_max"
> & {
  categories: Pick<Category, "name" | "slug" | "icon">[];
};

// ─── Composite types ──────────────────────────────────────────────────────────

export type ListingWithDetails = Listing & {
  categories: Category[];
  primary_image: ListingImage | null;
  hours: ListingHours[];
};

export type ListingCard = Pick<
  Listing,
  "id" | "name" | "slug" | "town" | "short_desc" | "is_free" | "cost_description"
> & {
  categories: Pick<Category, "name" | "slug" | "icon">[];
  primary_image: Pick<ListingImage, "url"> | null;
};
