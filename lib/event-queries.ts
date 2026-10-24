import { supabase } from "./supabase";
import type { EventCard, EventWithDetails, Event, Category, Listing } from "./types";

// This module is imported by both server components and the client-side
// EventsPageClient (for month/town navigation refetches). It MUST NOT import
// anything from next/headers transitively — callers pass stateAbbr in. Server
// callers resolve it with getStateConfig() from state-context; client callers
// receive it as a prop from a server parent.

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEventCards(rows: any[]): EventCard[] {
  return rows.map((row) => {
    const cats = (row.event_categories ?? [])
      .map((ec: { categories: Pick<Category, "name" | "slug" | "icon"> | null }) => ec.categories)
      .filter(Boolean);

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      town: row.town,
      start_date: row.start_date,
      start_time: row.start_time,
      is_free: row.is_free,
      cost: row.cost,
      age_min: row.age_min,
      age_max: row.age_max,
      categories: cats,
    } satisfies EventCard;
  });
}

const EVENT_CARD_SELECT = `
  id, title, slug, town, start_date, start_time, is_free, cost, age_min, age_max,
  event_categories ( categories ( name, slug, icon ) )
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getEventsByMonth(
  year: number,
  month: number,
  stateAbbr: string
): Promise<EventCard[]> {
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  // Last day: day 0 of next month = last day of this month
  const lastDay = new Date(year, month, 0).getDate();
  const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_CARD_SELECT)
    .eq("status", "approved")
    .eq("state", stateAbbr)
    .gte("start_date", startOfMonth)
    .lte("start_date", endOfMonth)
    .order("start_date")
    .order("start_time");

  if (error) throw error;
  return normalizeEventCards(data ?? []);
}

export async function getEvents(
  filters: {
    town?: string;
    categorySlug?: string;
    isFree?: boolean;
    startDate?: string;
    endDate?: string;
    thisWeek?: boolean;
  },
  stateAbbr: string
): Promise<EventCard[]> {
  let query = supabase
    .from("events")
    .select(EVENT_CARD_SELECT)
    .eq("status", "approved")
    .eq("state", stateAbbr);

  if (filters.town) query = query.eq("town", filters.town);
  if (filters.isFree) query = query.eq("is_free", true);

  if (filters.thisWeek) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    query = query
      .gte("start_date", sunday.toISOString().slice(0, 10))
      .lte("start_date", saturday.toISOString().slice(0, 10));
  } else {
    if (filters.startDate) query = query.gte("start_date", filters.startDate);
    if (filters.endDate) query = query.lte("start_date", filters.endDate);
  }

  const { data, error } = await query.order("start_date").order("start_time");
  if (error) throw error;

  let results = normalizeEventCards(data ?? []);

  // Client-side category filter
  if (filters.categorySlug) {
    results = results.filter((e) =>
      e.categories.some((c) => c.slug === filters.categorySlug)
    );
  }

  return results;
}

export async function getEventBySlug(
  slug: string,
  stateAbbr: string
): Promise<EventWithDetails | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("events")
    .select(`
      *,
      event_categories ( categories ( * ) ),
      listings!listing_id ( name, slug )
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("state", stateAbbr)
    .single() as { data: Record<string, unknown> | null; error: unknown };

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ecRows: any[] = Array.isArray(data.event_categories) ? data.event_categories : [];
  const categories = ecRows
    .map((ec: { categories: Category | null }) => ec.categories)
    .filter(Boolean) as Category[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listingRow = (data.listings ?? null) as Pick<Listing, "name" | "slug"> | null;

  return {
    ...(data as unknown as Event),
    categories,
    listing: listingRow,
  } as EventWithDetails;
}

export async function getEventsForListing(
  listingId: string,
  stateAbbr: string,
  limit = 2
): Promise<EventCard[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_CARD_SELECT)
    .eq("status", "approved")
    .eq("state", stateAbbr)
    .eq("listing_id", listingId)
    .gte("start_date", today)
    .order("start_date")
    .limit(limit);

  if (error) return [];
  return normalizeEventCards(data ?? []);
}

export async function getFeaturedEvents(
  stateAbbr: string,
  limit = 3
): Promise<EventCard[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_CARD_SELECT)
    .eq("status", "approved")
    .eq("state", stateAbbr)
    .eq("is_featured", true)
    .gte("start_date", today)
    .order("start_date")
    .limit(limit);

  if (error) throw error;
  return normalizeEventCards(data ?? []);
}

export async function getNearbyEvents(
  town: string,
  excludeSlug: string,
  stateAbbr: string,
  limit = 3
): Promise<EventCard[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_CARD_SELECT)
    .eq("status", "approved")
    .eq("state", stateAbbr)
    .eq("town", town)
    .gte("start_date", today)
    .neq("slug", excludeSlug)
    .order("start_date")
    .limit(limit);

  if (error) return [];
  return normalizeEventCards(data ?? []);
}
