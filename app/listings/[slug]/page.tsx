import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getListingBySlug, getSimilarListings } from "@/lib/queries";
import { getEventsForListing } from "@/lib/event-queries";
import OpenClosedBadge from "@/components/OpenClosedBadge";
import ListingCard from "@/components/ListingCard";
import EventCardCompact from "@/components/EventCardCompact";
import SaveButton from "./SaveButton";

interface Props {
  params: { slug: string };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return {};

  return {
    title: `${listing.name} — ${listing.town}, CT`,
    description: listing.short_desc ?? listing.description?.slice(0, 160) ?? "",
    openGraph: {
      title: `${listing.name} — ${listing.town}, CT`,
      description: listing.short_desc ?? "",
      images: listing.primary_image ? [{ url: listing.primary_image.url }] : [],
    },
  };
}

export const revalidate = 3600;

export default async function ListingPage({ params }: Props) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) notFound();

  const primaryCat = listing.categories[0];
  const [similarListings, upcomingEvents] = await Promise.all([
    primaryCat
      ? getSimilarListings(primaryCat.slug, listing.town, listing.slug).catch(() => [])
      : Promise.resolve([]),
    getEventsForListing(listing.id, 2).catch(() => []),
  ]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    listing.address ?? `${listing.name} ${listing.town} CT`
  )}`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description ?? listing.short_desc ?? "",
    address: listing.address
      ? {
          "@type": "PostalAddress",
          streetAddress: listing.address,
          addressLocality: listing.town,
          addressRegion: "CT",
          addressCountry: "US",
        }
      : undefined,
    telephone: listing.phone ?? undefined,
    url: listing.website ?? undefined,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Photo strip ──────────────────────────────────────────────────── */}
      <div className="relative w-full h-56 md:h-80 bg-brand-green-light">
        {listing.primary_image ? (
          <Image
            src={listing.primary_image.url}
            alt={listing.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-7xl">{primaryCat?.icon ?? "📍"}</span>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-4">
          {listing.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {listing.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-green-light text-brand-green-dark hover:bg-brand-green hover:text-white transition-colors"
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{listing.name}</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.town}, CT
          </p>
        </div>

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {listing.website && (
            <a
              href={listing.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-brand-green text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit website
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-brand-green hover:text-brand-green transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get directions
          </a>
          <SaveButton slug={listing.slug} name={listing.name} />
        </div>

        <div className="border-t border-gray-100 mb-6" />

        {/* ── About ────────────────────────────────────────────────────────── */}
        {listing.description && (
          <section className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-2">About</h2>
            <ExpandableText text={listing.description} />
          </section>
        )}

        {/* ── Info ─────────────────────────────────────────────────────────── */}
        <section className="mb-6 bg-gray-50 rounded-xl p-4 space-y-3">
          {listing.hours.length > 0 && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <OpenClosedBadge hours={listing.hours} />
                </div>
                <div className="grid grid-cols-1 gap-0.5 text-xs text-gray-500">
                  {listing.hours
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((h) => (
                      <div key={h.id} className="flex gap-2">
                        <span className="w-20 shrink-0">{DAYS[h.day_of_week]}</span>
                        <span>
                          {h.is_closed
                            ? "Closed"
                            : h.opens_at && h.closes_at
                            ? `${fmt(h.opens_at)} – ${fmt(h.closes_at)}`
                            : "Open"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {listing.phone && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${listing.phone}`} className="text-sm text-brand-green hover:underline">
                {listing.phone}
              </a>
            </div>
          )}

          {listing.website && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-green hover:underline truncate"
              >
                {listing.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {listing.address && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-brand-green"
              >
                {listing.address}
              </a>
            </div>
          )}

          {listing.cost_description && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600">{listing.cost_description}</span>
            </div>
          )}

          {(listing.age_min !== null || listing.age_max !== null) && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-600">
                Ages{" "}
                {listing.age_min !== null && listing.age_max !== null
                  ? `${listing.age_min}–${listing.age_max}`
                  : listing.age_min !== null
                  ? `${listing.age_min}+`
                  : `up to ${listing.age_max}`}
              </span>
            </div>
          )}
        </section>

        {/* ── Location map placeholder ──────────────────────────────────────── */}
        {listing.address && (
          <section className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-2">Location</h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-36 bg-brand-green-light rounded-xl border border-brand-green/20 flex items-center justify-center hover:bg-brand-green/10 transition-colors group"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🗺️</div>
                <p className="text-sm text-brand-green-dark font-medium group-hover:underline">
                  {listing.address}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Open in Google Maps →</p>
              </div>
            </a>
          </section>
        )}

        {/* ── Upcoming events ──────────────────────────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-gray-900">Upcoming events here</h2>
              <Link href="/events" className="text-xs text-brand-green hover:underline">
                All events →
              </Link>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl px-4 divide-y divide-gray-50">
              {upcomingEvents.map((event) => (
                <EventCardCompact key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* ── Claim bar ────────────────────────────────────────────────────── */}
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <p className="text-sm font-medium text-gray-900">Is this your business?</p>
            <p className="text-xs text-gray-500">Claim this listing to update your info for free.</p>
          </div>
          <Link
            href="/coming-soon"
            className="shrink-0 text-sm font-medium text-brand-green border border-brand-green px-4 py-2 rounded-lg hover:bg-brand-green hover:text-white transition-colors"
          >
            Claim listing →
          </Link>
        </div>

        {/* ── Similar listings ─────────────────────────────────────────────── */}
        {similarListings.length > 0 && (
          <section>
            <h2 className="text-base font-medium text-gray-900 mb-3">
              More in {listing.town}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

function ExpandableText({ text }: { text: string }) {
  // Server component: render full text. JS-less read-more can be a future enhancement.
  return (
    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{text}</p>
  );
}
