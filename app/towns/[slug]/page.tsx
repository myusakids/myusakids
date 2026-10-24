import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getTownBySlug,
  getListingsByTown,
  getCategories,
  LISTINGS_PER_PAGE,
} from "@/lib/queries";
import { getNearbyEvents } from "@/lib/event-queries";
import { getActiveAdMap } from "@/lib/ad-slot-queries";
import { getStateConfig } from "@/lib/state-context";
import ListingCard from "@/components/ListingCard";
import EventCard from "@/components/EventCard";
import AdSlot from "@/components/AdSlot";
import Pagination from "@/components/Pagination";

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

// Multi-tenant: town slugs are per-state and we can't know the host at
// build time, so skip pre-rendering. Pages are rendered on-demand per host
// and cached via `revalidate` below.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const town = await getTownBySlug(params.slug);
  if (!town) return {};
  const { abbr, name } = getStateConfig();
  // Skip indexing towns with no approved listings — avoids thin-content
  // SEO penalty on the long tail of GNIS-sourced hamlets.
  const { total } = await getListingsByTown(town.name, 1, 1).catch(() => ({ total: 0 }));
  const robots = total === 0 ? { index: false, follow: true } : undefined;
  return {
    title: `Kids Activities in ${town.name}, ${abbr}`,
    description: `Find the best kids activities, classes, camps, and events in ${town.name}, ${name}. Discover family-friendly businesses near you.`,
    openGraph: {
      title: `Kids Activities in ${town.name}, ${abbr}`,
      description: `Family-friendly activities and events in ${town.name}, ${abbr}.`,
    },
    alternates: {
      canonical: `/towns/${town.slug}`,
    },
    robots,
  };
}

export const revalidate = 3600;

export default async function TownPage({ params, searchParams }: Props) {
  const town = await getTownBySlug(params.slug);
  if (!town) notFound();

  const { abbr: stateAbbr, name: stateName } = getStateConfig();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [{ items: listings, total }, categories, upcomingEvents, adMap] = await Promise.all([
    getListingsByTown(town.name, page),
    getCategories(),
    getNearbyEvents(town.name, "", stateAbbr, 6).catch(() => []),
    getActiveAdMap(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / LISTINGS_PER_PAGE));

  // Group listings by category for display (only reflects current page — fine for quick links)
  const categoryCounts: Record<string, number> = {};
  for (const listing of listings) {
    for (const cat of listing.categories) {
      categoryCounts[cat.slug] = (categoryCounts[cat.slug] ?? 0) + 1;
    }
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Kids Activities in ${town.name}, ${stateAbbr}`,
    description: `Family-friendly activities and events in ${town.name}, ${stateName}`,
    numberOfItems: total,
    itemListElement: listings.slice(0, 10).map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/listings/${l.slug}`,
      name: l.name,
    })),
  };

  const midIndex = Math.min(6, listings.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="bg-brand-green px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-brand-green-light text-xs mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            {" → "}
            <Link href="/towns" className="hover:text-white">Towns</Link>
            {" → "}
            {town.name}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Kids Activities in {town.name}, CT
          </h1>
          <p className="text-brand-green-light mt-1 text-sm">
            {town.county} County · {total} listing{total !== 1 ? "s" : ""}
            {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Category quick-links */}
        {categories.filter((c) => categoryCounts[c.slug]).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories
              .filter((c) => categoryCounts[c.slug])
              .map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}?town=${encodeURIComponent(town.name)}`}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-brand-green-light text-brand-green-dark hover:bg-brand-green hover:text-white transition-colors"
                >
                  {cat.icon} {cat.name}
                  <span className="text-xs opacity-70">({categoryCounts[cat.slug]})</span>
                </Link>
              ))}
          </div>
        )}

        {/* Ad: above listings */}
        {adMap["town_top"] && (
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 text-center">
              Advertisement
            </p>
            <AdSlot code={adMap["town_top"]} className="flex justify-center" minHeight={90} />
          </div>
        )}

        {/* Listings */}
        {listings.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              All Listings in {town.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.slice(0, midIndex).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {adMap["town_mid"] && listings.length > midIndex && (
              <div className="my-6">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 text-center">
                  Advertisement
                </p>
                <AdSlot code={adMap["town_mid"]} className="flex justify-center" minHeight={250} />
              </div>
            )}
            {listings.length > midIndex && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {listings.slice(midIndex).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/towns/${town.slug}`}
            />
          </section>
        ) : (
          <div className="text-center py-16 mb-10">
            <div className="text-4xl mb-3">📍</div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              No listings yet in {town.name}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Know a great kids activity here?
            </p>
            <Link
              href="/submit"
              className="inline-block bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors"
            >
              Add a listing →
            </Link>
          </div>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Events in {town.name}
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <Link
              href={`/events?town=${encodeURIComponent(town.name)}`}
              className="mt-4 inline-block text-sm text-brand-green hover:underline"
            >
              All events in {town.name} →
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
