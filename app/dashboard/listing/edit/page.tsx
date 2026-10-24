import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { ListingWithDetails, ListingImage } from "@/lib/types";
import type { DayHours } from "@/components/HoursEditor";
import { defaultHours } from "@/components/HoursEditor";
import EditListingForm from "./EditListingForm";

export const metadata: Metadata = { title: "Edit listing — Dashboard" };

export default async function EditListingPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;

  // Try by owner_id first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data } = await (admin as any)
    .from("listings")
    .select("*, listing_images(*), listing_hours(*)")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Fallback: unclaimed listing matched by email
  if (!data && user.email) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: byEmail } = await (admin as any)
      .from("listings")
      .select("*, listing_images(*), listing_hours(*)")
      .eq("email", user.email)
      .is("owner_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byEmail) {
      data = byEmail;
      // Auto-claim
      await admin.from("listings").update({ owner_id: user.id }).eq("id", byEmail.id);
    }
  }

  if (!data) redirect("/dashboard");

  const listing = data as ListingWithDetails & {
    listing_images: ListingImage[];
    listing_hours: DayHours[];
  };

  const sortedHours: DayHours[] =
    listing.listing_hours?.length > 0
      ? [...listing.listing_hours].sort((a, b) => a.day_of_week - b.day_of_week)
      : defaultHours();

  return (
    <EditListingForm
      listingId={listing.id}
      initialForm={{
        name: listing.name,
        description: listing.description ?? "",
        town: listing.town,
        address: listing.address ?? "",
        phone: listing.phone ?? "",
        website: listing.website ?? "",
        age_min: listing.age_min?.toString() ?? "",
        age_max: listing.age_max?.toString() ?? "",
        hours: sortedHours,
      }}
      initialImages={listing.listing_images ?? []}
    />
  );
}
