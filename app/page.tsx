import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getFeaturedListings, getTowns } from "@/lib/queries";
import { getFeaturedEvents } from "@/lib/event-queries";
import { getActiveAdMap } from "@/lib/ad-slot-queries";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import EventCardCompact from "@/components/EventCardCompact";
import SearchBar from "@/components/SearchBar";
import AdSlot from "@/components/AdSlot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MyConnecticutKids — Find things for kids in CT",
  description:
    "Camps, classes, sports programs, childcare, birthday party venues and things to do with kids in Connecticut.",
};

export const revalidate = 1800;

export default async function HomePage() {
  const [categories, featuredListings, towns, featuredEvents, adMap] = await Promise.all([
    getCategories().catch(() => []),
    getFeaturedListings(6).catch(() => []),
    getTowns().catch(() => []),
    getFeaturedEvents(3).catch(() => []),
    getActiveAdMap(),
  ]);

  const heroTowns = towns.slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-green px-4 py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Find things for your kids in CT
          </h1>
          <p className="mt-3 text-brand-green-light text-base md:text-lg">
            Camps, classes, events, childcare &amp; more near you
          </p>

          <div className="mt-6">
            <SearchBar className="max-w-xl mx-auto shadow-sm" />
          </div>

          {heroTowns.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {heroTowns.map((town) => (
                <Link
                  key={town.slug}
                  href={`/search?town=${encodeURIComponent(town.name)}`}
                  className="px-3 py-1.5 rounded-full text-sm text-white border border-white/40 hover:bg-white/20 transition-colors"
                >
                  {town.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Ad: Below hero ─────────────────────────────────────────────── */}
      {adMap["home_top"] && (
        <section className="max-w-6xl mx-auto px-4 pt-8">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 text-center">
            Advertisement
          </p>
          <AdSlot code={adMap["home_top"]} className="flex justify-center" minHeight={90} />
        </section>
      )}

      {/* ── Category grid ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-5">Browse by category</h2>
        <Suspense fallback={<CategoryGridSkeleton />}>
          <CategoryGrid categories={categories} />
        </Suspense>
      </section>

      {/* ── Ad: Between sections ──────────────────────────────────────── */}
      {adMap["home_middle"] && (
        <section className="max-w-6xl mx-auto px-4 pb-6">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 text-center">
            Advertisement
          </p>
          <AdSlot code={adMap["home_middle"]} className="flex justify-center" minHeight={250} />
        </section>
      )}

      {/* ── Featured listings ─────────────────────────────────────────────── */}
      {featuredListings.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-medium text-gray-900">Featured near you</h2>
            <Link
              href="/search"
              className="text-sm text-brand-green hover:text-brand-green-mid transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* ── Upcoming events ───────────────────────────────────────────────── */}
      {featuredEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900">Upcoming events</h2>
            <Link
              href="/events"
              className="text-sm text-brand-green hover:text-brand-green-mid transition-colors"
            >
              View full calendar →
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-4 divide-y divide-gray-50">
            {featuredEvents.map((event) => (
              <EventCardCompact key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-3 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-brand-green hover:text-brand-green-mid transition-colors"
            >
              📅 See all upcoming events →
            </Link>
          </div>
        </section>
      )}

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      <section className="bg-brand-green-light border-y border-brand-green/20 px-4 py-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg font-medium text-brand-green-dark">
            Are you a Connecticut kids business?
          </p>
          <p className="text-brand-green-dark/70 mt-1 text-sm">
            Add your listing — it&apos;s free and takes less than 5 minutes.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/submit"
              className="inline-block bg-brand-green text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-green-mid transition-colors"
            >
              Add your listing →
            </Link>
            <Link
              href="/events/submit"
              className="inline-block bg-white border border-brand-green text-brand-green font-medium px-6 py-3 rounded-xl hover:bg-brand-green-light transition-colors"
            >
              Submit an event →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
