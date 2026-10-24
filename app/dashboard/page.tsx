import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import StatusBadge from "@/components/StatusBadge";
import type { Profile, Listing } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;

  // Load profile and listing in parallel.
  // Use admin client for listing lookup so pending/unclaimed listings are visible.
  const [{ data: profile }, { data: byOwner }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).single(),
    admin.from("listings").select("*").eq("owner_id", user.id).maybeSingle(),
  ]);

  let listing = byOwner as Listing | null;

  // Fallback: find by submitter email (listing submitted before signing in,
  // or submitted when not logged in so owner_id was never set)
  if (!listing && user.email) {
    const { data: byEmail } = await admin
      .from("listings")
      .select("*")
      .eq("email", user.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byEmail) {
      listing = byEmail as Listing;
      // Auto-claim: stamp owner_id so future queries work
      if (!listing.owner_id) {
        await admin
          .from("listings")
          .update({ owner_id: user.id })
          .eq("id", listing.id);
        listing = { ...listing, owner_id: user.id };
      }
    }
  }

  const p = profile as Profile | null;

  // Fetch analytics for this month
  const stats = { saves: 0, websiteClicks: 0, eventViews: 0 };
  if (listing) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: analyticsRows } = await admin
      .from("analytics_events")
      .select("event_type")
      .eq("listing_id", listing.id)
      .gte("created_at", monthStart.toISOString());

    if (analyticsRows) {
      for (const row of analyticsRows as { event_type: string }[]) {
        if (row.event_type === "listing_save") stats.saves++;
        else if (row.event_type === "website_click") stats.websiteClicks++;
      }
    }

    // Event views: look up all event IDs for this listing, then sum event_view rows
    const { data: listingEvents } = await admin
      .from("events")
      .select("id")
      .eq("listing_id", listing.id);

    if (listingEvents && listingEvents.length > 0) {
      const eventIds = (listingEvents as { id: string }[]).map((e) => e.id);
      const { data: evtRows } = await admin
        .from("analytics_events")
        .select("id")
        .in("event_id", eventIds)
        .eq("event_type", "event_view")
        .gte("created_at", monthStart.toISOString());
      stats.eventViews = evtRows?.length ?? 0;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back{p?.full_name ? `, ${p.full_name.split(" ")[0]}` : ""}!
      </h1>
      <p className="text-sm text-gray-500 mb-8">{user.email}</p>

      {!listing ? (
        /* ── No listing yet ──────────────────────────────────────────────── */
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🏪</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            You don&apos;t have a listing yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Add your business to MyConnecticutKids so families can find you.
          </p>
          <Link
            href="/submit"
            className="inline-block bg-brand-green text-white font-medium px-6 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors text-sm"
          >
            Add your business →
          </Link>
        </div>
      ) : (
        /* ── Listing card ────────────────────────────────────────────────── */
        <div className="border border-gray-100 rounded-2xl p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{listing.name}</h2>
              <p className="text-sm text-gray-500">{listing.town}, CT</p>
            </div>
            <StatusBadge status={listing.status} size="md" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Saves this month", value: stats.saves },
              { label: "Website clicks", value: stats.websiteClicks },
              { label: "Event views", value: stats.eventViews },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {listing.status === "pending" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              Your listing is under review. We typically approve within 1–2 business days.
            </p>
          )}
          {listing.status === "rejected" && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              Your listing was not approved. Please edit it and resubmit, then contact us if you have questions.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-50">
            <Link
              href="/dashboard/listing/edit"
              className="bg-brand-green text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors"
            >
              Edit listing
            </Link>
            <Link
              href="/dashboard/events/new"
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-brand-green hover:text-brand-green transition-colors"
            >
              Add event
            </Link>
            {!listing.is_featured && (
              <Link
                href="/dashboard/billing"
                className="bg-white border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors"
              >
                ⭐ Upgrade to Featured
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
