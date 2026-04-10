import { supabase } from "./supabase";
import type { ListingCard, ListingWithDetails, Category, Town, Listing, ListingImage, ListingHours } from "./types";

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
  const { data, error } = await supabase
    .from("towns")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// ─── Listings — card format ───────────────────────────────────────────────────

export async function getFeaturedListings(limit = 6): Promise<ListingCard[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories ( categories ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `)
    .eq("status", "approved")
    .eq("is_featured", true)
    .limit(limit);

  if (error) throw error;
  return normalizeListingCards(data ?? []);
}

export async function getListingsByCategory(
  categorySlug: string,
  town?: string
): Promise<ListingCard[]> {
  let query = supabase
    .from("listings")
    .select(`
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories!inner ( categories!inner ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `)
    .eq("status", "approved")
    .eq("listing_categories.categories.slug", categorySlug);

  if (town) query = query.eq("town", town);

  const { data, error } = await query;
  if (error) throw error;
  return normalizeListingCards(data ?? []);
}

export async function searchListings(params: {
  q?: string;
  town?: string;
  category?: string;
}): Promise<ListingCard[]> {
  let query = supabase
    .from("listings")
    .select(`
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories ( categories ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `)
    .eq("status", "approved");

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,description.ilike.%${params.q}%,short_desc.ilike.%${params.q}%`
    );
  }
  if (params.town) query = query.eq("town", params.town);

  const { data, error } = await query.limit(50);
  if (error) throw error;

  let results = normalizeListingCards(data ?? []);

  // Client-side category filter (Supabase nested filter limitation)
  if (params.category) {
    results = results.filter((l) =>
      l.categories.some((c) => c.slug === params.category)
    );
  }

  return results;
}

// ─── Listing — full detail ────────────────────────────────────────────────────

export async function getListingBySlug(slug: string): Promise<ListingWithDetails | null> {
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
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, name, slug, town, short_desc, is_free, cost_description,
      listing_categories!inner ( categories!inner ( name, slug, icon ) ),
      listing_images ( url, is_primary, sort_order )
    `)
    .eq("status", "approved")
    .eq("town", town)
    .eq("listing_categories.categories.slug", categorySlug)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error) return [];
  return normalizeListingCards(data ?? []);
}

export async function getAllApprovedListingSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from("listings")
    .select("slug")
    .eq("status", "approved");
  return (data ?? []).map((r: { slug: string }) => r.slug);
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
