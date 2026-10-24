"use server";

import { createSupabaseAdmin } from "./supabase-admin";

interface DiscoveredHour {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

interface DiscoveredBusiness {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  description: string | null;
  age_min: number | null;
  age_max: number | null;
  cost_description: string | null;
  is_free: boolean;
  facebook_url: string | null;
  instagram_url: string | null;
  hours: DiscoveredHour[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function importBusiness(
  business: DiscoveredBusiness,
  town: string,
  categoryId: string
): Promise<{ error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;

    const baseSlug = slugify(business.name);
    const slug = uniqueSlug(baseSlug);

    // Build description with social links appended if present
    let description = business.description ?? "";
    const socials: string[] = [];
    if (business.facebook_url) socials.push(`Facebook: ${business.facebook_url}`);
    if (business.instagram_url) socials.push(`Instagram: ${business.instagram_url}`);
    if (socials.length > 0) description += `\n\n${socials.join(" · ")}`;

    const { data: listing, error: listingErr } = await admin
      .from("listings")
      .insert({
        name: business.name,
        slug,
        description: description || null,
        short_desc: business.description ? business.description.slice(0, 160) : null,
        town,
        address: business.address ?? null,
        phone: business.phone ?? null,
        website: business.website ?? null,
        email: business.email ?? null,
        age_min: business.age_min ?? null,
        age_max: business.age_max ?? null,
        cost_description: business.cost_description ?? null,
        is_free: business.is_free ?? false,
        status: "approved",
        is_featured: false,
        owner_id: null,
      })
      .select("id")
      .single();

    if (listingErr) return { error: listingErr.message };
    const listingId = listing.id as string;

    // Link category
    await admin.from("listing_categories").insert({
      listing_id: listingId,
      category_id: categoryId,
    });

    // Insert hours (normalise to 7 days)
    const hoursPayload: object[] = [];
    for (let day = 0; day <= 6; day++) {
      const h = business.hours?.find((x) => x.day_of_week === day);
      hoursPayload.push({
        listing_id: listingId,
        day_of_week: day,
        opens_at: h?.opens_at ?? null,
        closes_at: h?.closes_at ?? null,
        is_closed: h?.is_closed ?? true,
      });
    }
    await admin.from("listing_hours").insert(hoursPayload);

    return {};
  } catch (e) {
    return { error: String(e) };
  }
}
