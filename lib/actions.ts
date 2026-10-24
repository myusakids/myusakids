"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "./supabase-server";
import { getStateConfig } from "./state-context";
import type { DayHours } from "@/components/HoursEditor";

// Supabase typed client doesn't infer Insert/Update generics correctly with createServerClient;
// cast to any for mutations — same pattern used throughout this codebase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSlug(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

async function notifyAdmin(subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) return; // not configured — skip silently

  const { siteName, domain } = getStateConfig();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${siteName} <noreply@${domain}>`,
      to: [adminEmail],
      subject,
      text: body,
    }),
  });
}

function siteOrigin(domain: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`;
}

// ─── Listing submission ───────────────────────────────────────────────────────

export interface ListingSubmitData {
  name: string;
  selectedCategories: string[]; // category slugs
  town: string;
  age_min: string;
  age_max: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  hours: DayHours[];
  plan: "free" | "featured";
  email: string;
}

export async function submitListing(
  data: ListingSubmitData
): Promise<{ listingId: string | null; error: string | null; magicLinkSent: boolean }> {
  const supabase = createSupabaseServer() as AnySupabase;
  const state = getStateConfig();
  const { data: { user } } = await supabase.auth.getUser();

  const slug = makeSlug(data.name);

  // Insert listing
  const { data: listing, error: insertError } = await supabase
    .from("listings")
    .insert({
      name: data.name,
      slug,
      town: data.town,
      description: data.description,
      short_desc: data.description.slice(0, 120),
      website: data.website || null,
      phone: data.phone || null,
      address: data.address || null,
      email: data.email,
      age_min: data.age_min ? parseInt(data.age_min) : null,
      age_max: data.age_max ? parseInt(data.age_max) : null,
      is_free: false,
      status: "pending",
      is_featured: data.plan === "featured",
      owner_id: user?.id ?? null,
      state: state.abbr,
    })
    .select("id")
    .single();

  if (insertError || !listing) {
    return { listingId: null, error: insertError?.message ?? "Failed to submit listing", magicLinkSent: false };
  }

  // Look up category IDs and insert junction rows
  if (data.selectedCategories.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", data.selectedCategories);

    if (cats && cats.length > 0) {
      await supabase.from("listing_categories").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cats.map((c: any) => ({ listing_id: listing.id, category_id: c.id }))
      );
    }
  }

  // Insert hours
  const hoursRows = data.hours
    .filter((h) => !h.is_closed || h.opens_at || h.closes_at)
    .map((h) => ({
      listing_id: listing.id,
      day_of_week: h.day_of_week,
      opens_at: h.is_closed ? null : (h.opens_at || null),
      closes_at: h.is_closed ? null : (h.closes_at || null),
      is_closed: h.is_closed,
    }));

  if (hoursRows.length > 0) {
    await supabase.from("listing_hours").insert(hoursRows);
  }

  // Notify admin
  const origin = siteOrigin(state.domain);
  await notifyAdmin(
    `New listing submission: ${data.name}`,
    `A new listing has been submitted for review.\n\nBusiness: ${data.name}\nTown: ${data.town}\nEmail: ${data.email}\nPlan: ${data.plan}\n\nReview it at: ${origin}/admin/listings`
  );

  // If not logged in, send magic link so they can claim the listing
  let magicLinkSent = false;
  if (!user) {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
    magicLinkSent = !otpError;
  }

  revalidatePath("/admin/listings");
  return { listingId: listing.id, error: null, magicLinkSent };
}

// ─── Event submission ─────────────────────────────────────────────────────────

export interface EventSubmitData {
  title: string;
  town: string;
  selectedCategories: string[];
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_free: boolean;
  cost: string;
  age_min: string;
  age_max: string;
  description: string;
  address: string;
  is_recurring: boolean;
  recurrence_rule: string;
  email: string;
  listing_name: string;
}

export async function submitEvent(
  data: EventSubmitData
): Promise<{ eventId: string | null; error: string | null; magicLinkSent: boolean }> {
  const supabase = createSupabaseServer() as AnySupabase;
  const state = getStateConfig();
  const { data: { user } } = await supabase.auth.getUser();

  const slug = makeSlug(data.title + "-" + data.start_date);

  // Try to find linked listing by name within this state
  let listing_id: string | null = null;
  if (data.listing_name.trim()) {
    const { data: found } = await supabase
      .from("listings")
      .select("id")
      .eq("state", state.abbr)
      .ilike("name", data.listing_name.trim())
      .limit(1)
      .single();
    listing_id = found?.id ?? null;
  }

  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({
      title: data.title,
      slug,
      town: data.town,
      description: data.description,
      address: data.address || null,
      start_date: data.start_date,
      end_date: data.end_date || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      is_free: data.is_free,
      cost: data.cost || null,
      age_min: data.age_min ? parseInt(data.age_min) : null,
      age_max: data.age_max ? parseInt(data.age_max) : null,
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule || null,
      listing_id,
      status: "pending",
      is_featured: false,
      owner_id: user?.id ?? null,
      state: state.abbr,
    })
    .select("id")
    .single();

  if (insertError || !event) {
    return { eventId: null, error: insertError?.message ?? "Failed to submit event", magicLinkSent: false };
  }

  // Insert event_categories
  if (data.selectedCategories.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", data.selectedCategories);

    if (cats && cats.length > 0) {
      await supabase.from("event_categories").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cats.map((c: any) => ({ event_id: event.id, category_id: c.id }))
      );
    }
  }

  const origin = siteOrigin(state.domain);
  await notifyAdmin(
    `New event submission: ${data.title}`,
    `A new event has been submitted for review.\n\nEvent: ${data.title}\nDate: ${data.start_date}\nTown: ${data.town}\nEmail: ${data.email}\n\nReview it at: ${origin}/admin/events`
  );

  let magicLinkSent = false;
  if (!user) {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
    magicLinkSent = !otpError;
  }

  revalidatePath("/admin/events");
  return { eventId: event.id, error: null, magicLinkSent };
}

// ─── Admin: update listing status ────────────────────────────────────────────

export async function updateListingStatus(
  listingId: string,
  status: "approved" | "rejected"
) {
  const supabase = createSupabaseServer() as AnySupabase;
  await supabase.from("listings").update({ status }).eq("id", listingId);
  revalidatePath("/admin/listings");
}

// ─── Admin: update event status ───────────────────────────────────────────────

export async function updateEventStatus(
  eventId: string,
  status: "approved" | "rejected"
) {
  const supabase = createSupabaseServer() as AnySupabase;
  await supabase.from("events").update({ status }).eq("id", eventId);
  revalidatePath("/admin/events");
}

// ─── Admin: update profile role ───────────────────────────────────────────────

export async function updateProfileRole(profileId: string, role: "owner" | "admin") {
  const supabase = createSupabaseServer() as AnySupabase;
  await supabase.from("profiles").update({ role }).eq("id", profileId);
  revalidatePath("/admin/users");
}

// ─── Owner: update listing ────────────────────────────────────────────────────

export interface ListingUpdateData {
  listingId: string;
  name: string;
  description: string;
  town: string;
  address: string;
  phone: string;
  website: string;
  age_min: string;
  age_max: string;
  hours: DayHours[];
}

export async function updateListing(
  data: ListingUpdateData
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServer() as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("listings")
    .update({
      name: data.name,
      description: data.description,
      short_desc: data.description.slice(0, 120),
      town: data.town,
      address: data.address || null,
      phone: data.phone || null,
      website: data.website || null,
      age_min: data.age_min ? parseInt(data.age_min) : null,
      age_max: data.age_max ? parseInt(data.age_max) : null,
    })
    .eq("id", data.listingId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  // Replace hours
  await supabase.from("listing_hours").delete().eq("listing_id", data.listingId);

  const hoursRows = data.hours.map((h) => ({
    listing_id: data.listingId,
    day_of_week: h.day_of_week,
    opens_at: h.is_closed ? null : (h.opens_at || null),
    closes_at: h.is_closed ? null : (h.closes_at || null),
    is_closed: h.is_closed,
  }));

  await supabase.from("listing_hours").insert(hoursRows);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listing/edit");
  return { error: null };
}

// ─── Owner: delete event ──────────────────────────────────────────────────────

export async function deleteEvent(eventId: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseServer() as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", user.id);

  revalidatePath("/dashboard/events");
  return { error: error?.message ?? null };
}

// ─── Owner: submit/update dashboard event ─────────────────────────────────────

export async function saveOwnerEvent(
  data: Omit<EventSubmitData, "email" | "listing_name">,
  eventId?: string
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServer() as AnySupabase;
  const { abbr } = getStateConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    title: data.title,
    town: data.town,
    description: data.description,
    address: data.address || null,
    start_date: data.start_date,
    end_date: data.end_date || null,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    is_free: data.is_free,
    cost: data.cost || null,
    age_min: data.age_min ? parseInt(data.age_min) : null,
    age_max: data.age_max ? parseInt(data.age_max) : null,
    is_recurring: data.is_recurring,
    recurrence_rule: data.recurrence_rule || null,
    status: "pending" as const,
    owner_id: user.id,
  };

  if (eventId) {
    // Update
    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", eventId)
      .eq("owner_id", user.id);

    if (error) return { error: error.message };

    // Replace categories
    await supabase.from("event_categories").delete().eq("event_id", eventId);
  } else {
    // Insert
    const slug = makeSlug(data.title + "-" + data.start_date);
    const { data: event, error } = await supabase
      .from("events")
      .insert({ ...payload, slug, is_featured: false, listing_id: null, state: abbr })
      .select("id")
      .single();

    if (error || !event) return { error: error?.message ?? "Failed to save event" };
    eventId = event.id;
  }

  // Upsert categories
  if (data.selectedCategories.length > 0 && eventId) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", data.selectedCategories);

    if (cats && cats.length > 0) {
      await supabase.from("event_categories").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cats.map((c: any) => ({ event_id: eventId!, category_id: c.id }))
      );
    }
  }

  revalidatePath("/dashboard/events");
  return { error: null };
}
