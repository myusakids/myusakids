import { supabase } from "./supabase";
import { createSupabaseAdmin } from "./supabase-admin";
import { getStateConfig } from "./state-context";
import type { ListingCard, ListingWithDetails, Category, Town, Listing, ListingImage, ListingHours } from "./types";

/**
 * Paginate past Supabase's project-level db.max_rows cap (default 1000).
 * Fetches 1000-row pages until the current page is short — total rows
 * for state-scoped tables (6k+ NY towns) land in a handful of round trips.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllPages<T>(buildQuery: () => any, pageSize = 1000): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery().range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// ─── Towns ────────────────────────────────────────────────────────────────────

export async function getTowns(): Promise<Town[]> {
  const { abbr } = getStateConfig();
  // Use the admin client so RLS doesn't apply, and paginate past the
  // project-level db.max_rows cap (1000). Towns are public data.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;
  return fetchAllPages<Town>(() =>
    admin.from("towns").select("*").eq("state", abbr).order("name")
  );
}

// ─── Listings — card format ───────────────────────────────────────────────────

export async function getFeaturedListings(limit = 6): Promise<ListingCard[]> {
  const { abbr } = getStateConfig();
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories ( categories ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `)
    .eq("status", "approved")
    .eq("state", abbr)
    .eq("is_featured", true)
    .limit(limit);

  if (error) throw error;
  return normalizeListingCards(data ?? []);
}

export interface PagedListings {
  items: ListingCard[];
  total: number;
}

export const LISTINGS_PER_PAGE = 24;

export async function getListingsByCategory(
  categorySlug: string,
  town?: string,
  page = 1,
  perPage = LISTINGS_PER_PAGE
): Promise<PagedListings> {
  const { abbr } = getStateConfig();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("listings")
    .select(
      `
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories!inner ( categories!inner ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `,
      { count: "exact" }
    )
    .eq("status", "approved")
    .eq("state", abbr)
    .eq("listing_categories.categories.slug", categorySlug);

  if (town) query = query.eq("town", town);

  const { data, error, count } = await query
    .order("is_featured", { ascending: false })
    .order("name")
    .range(from, to);

  if (error) throw error;
  return { items: normalizeListingCards(data ?? []), total: count ?? 0 };
}

export async function searchListings(
  params: { q?: string; town?: string; category?: string },
  page = 1,
  perPage = LISTINGS_PER_PAGE
): Promise<PagedListings> {
  const { abbr } = getStateConfig();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const selectCols = `
    id, name, slug, town, short_desc, is_free, cost_description,
    ${params.category
      ? "listing_categories!inner ( categories!inner ( name, slug, icon ) )"
      : "listing_categories ( categories ( name, slug, icon ) )"},
    listing_images ( url, is_primary, sort_order )
  `;

  let query = supabase
    .from("listings")
    .select(selectCols, { count: "exact" })
    .eq("status", "approved")
    .eq("state", abbr);

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,description.ilike.%${params.q}%,short_desc.ilike.%${params.q}%`
    );
  }
  if (params.town) query = query.eq("town", params.town);
  if (params.category) {
    query = query.eq("listing_categories.categories.slug", params.category);
  }

  const { data, error, count } = await query
    .order("is_featured", { ascending: false })
    .order("name")
    .range(from, to);

  if (error) throw error;
  return { items: normalizeListingCards(data ?? []), total: count ?? 0 };
}

// ─── Listing — full detail ────────────────────────────────────────────────────

export async function getListingBySlug(slug: string): Promise<ListingWithDetails | null> {
  const { abbr } = getStateConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("listings")
    .select(`
      *,
      listing_categories ( categories ( * ) ),
      listing_images ( * ),
      listing_hours ( * )
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("state", abbr)
    .single() as { data: Record<string, unknown> | null; error: unknown };

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lcRows: any[] = Array.isArray(data.listing_categories) ? data.listing_categories : [];
  const categories = lcRows
    .map((lc: { categories: Category | null }) => lc.categories)
    .filter(Boolean) as Category[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imgRows: any[] = Array.isArray(data.listing_images) ? data.listing_images : [];
  const images = imgRows.sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  ) as ListingImage[];
  const primary_image = images.find((i) => i.is_primary) ?? images[0] ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hourRows: any[] = Array.isArray(data.listing_hours) ? data.listing_hours : [];

  return {
    ...(data as unknown as Listing),
    categories,
    primary_image,
    hours: hourRows as ListingHours[],
  } as ListingWithDetails;
}

export async function getSimilarListings(
  categorySlug: string,
  town: string,
  excludeSlug: string,
  limit = 3
): Promise<ListingCard[]> {
  const { abbr } = getStateConfig();
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories!inner ( categories!inner ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `)
    .eq("status", "approved")
    .eq("state", abbr)
    .eq("town", town)
    .eq("listing_categories.categories.slug", categorySlug)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error) return [];
  return normalizeListingCards(data ?? []);
}

export async function getListingsByTown(
  town: string,
  page = 1,
  perPage = LISTINGS_PER_PAGE
): Promise<PagedListings> {
  const { abbr } = getStateConfig();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from("listings")
    .select(
      `
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories ( categories ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `,
      { count: "exact" }
    )
    .eq("status", "approved")
    .eq("state", abbr)
    .eq("town", town)
    .order("is_featured", { ascending: false })
    .order("name")
    .range(from, to);

  if (error) return { items: [], total: 0 };
  return { items: normalizeListingCards(data ?? []), total: count ?? 0 };
}

export async function getTownBySlug(slug: string): Promise<Town | null> {
  const { abbr } = getStateConfig();
  const { data, error } = await supabase
    .from("towns")
    .select("*")
    .eq("slug", slug)
    .eq("state", abbr)
    .single();
  if (error) return null;
  return data;
}

export async function getAllTownSlugs(): Promise<string[]> {
  const { abbr } = getStateConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;
  const rows = await fetchAllPages<{ slug: string }>(() =>
    admin.from("towns").select("slug").eq("state", abbr)
  );
  return rows.map((r) => r.slug);
}

/**
 * Towns with at least one approved listing in the current state.
 * Used by sitemap/listing generation to avoid thin content pages.
 */
export async function getActiveTownSlugs(): Promise<string[]> {
  const { abbr } = getStateConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;
  const [towns, listings] = await Promise.all([
    fetchAllPages<{ slug: string; name: string }>(() =>
      admin.from("towns").select("slug, name").eq("state", abbr)
    ),
    fetchAllPages<{ town: string }>(() =>
      admin
        .from("listings")
        .select("town")
        .eq("state", abbr)
        .eq("status", "approved")
    ),
  ]);

  const activeTownNames = new Set(listings.map((l) => l.town));
  return towns.filter((t) => activeTownNames.has(t.name)).map((t) => t.slug);
}

export async function getAllApprovedListingSlugs(): Promise<string[]> {
  const { abbr } = getStateConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;
  const rows = await fetchAllPages<{ slug: string }>(() =>
    admin
      .from("listings")
      .select("slug")
      .eq("status", "approved")
      .eq("state", abbr)
  );
  return rows.map((r) => r.slug);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeListingCards(rows: any[]): ListingCard[] {
  return rows.map((row) => {
    const cats = (row.listing_categories ?? [])
      .map((lc: { categories: Pick<Category, "name" | "slug" | "icon"> | null }) => lc.categories)
      .filter(Boolean);

    const images: { is_primary: boolean; sort_order: number; url: string }[] = (
      row.listing_images ?? []
    ).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

    const primary_image =
      images.find((i) => i.is_primary) ?? images[0] ?? null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      town: row.town,
      short_desc: row.short_desc,
      is_free: row.is_free,
      cost_description: row.cost_description,
      categories: cats,
      primary_image: primary_image ? { url: primary_image.url } : null,
    } satisfies ListingCard;
  });
}
