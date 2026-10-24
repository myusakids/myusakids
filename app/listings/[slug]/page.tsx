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
import ListingTracker from "./ListingTracker";
import ListingActionButtons from "./ListingActionButtons";

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

  const { facebook, instagram, clean: cleanDescription } = extractSocials(listing.description);

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
      <ListingTracker listingId={listing.id} />

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
          <ListingActionButtons
            listingId={listing.id}
            website={listing.website}
            mapsUrl={mapsUrl}
          />
          <SaveButton slug={listing.slug} name={listing.name} listingId={listing.id} />
        </div>

        <div className="border-t border-gray-100 mb-6" />

        {/* ── About ────────────────────────────────────────────────────────── */}
        {cleanDescription && (
          <section className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-2">About</h2>
            <ExpandableText text={cleanDescription} />
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

          {/* Social links */}
          {(facebook || instagram) && (
            <div className="flex items-center gap-3">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex items-center gap-1.5 text-sm text-[#1877F2] hover:opacity-80 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center gap-1.5 text-sm text-[#E1306C] hover:opacity-80 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  Instagram
                </a>
              )}
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
        {!listing.owner_id && (
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            <div>
              <p className="text-sm font-medium text-gray-900">Is this your business?</p>
              <p className="text-xs text-gray-500">Claim this listing to update your info for free.</p>
            </div>
            <Link
              href={`/auth/signin?claim=${listing.id}&next=/dashboard`}
              className="shrink-0 text-sm font-medium text-brand-green border border-brand-green px-4 py-2 rounded-lg hover:bg-brand-green hover:text-white transition-colors"
            >
              Claim listing →
            </Link>
          </div>
        )}

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

function extractSocials(description: string | null): { facebook: string | null; instagram: string | null; clean: string } {
  if (!description) return { facebook: null, instagram: null, clean: "" };

  let facebook: string | null = null;
  let instagram: string | null = null;

  const fbMatch = description.match(/Facebook:\s*(https?:\/\/\S+)/i);
  const igMatch = description.match(/Instagram:\s*(https?:\/\/\S+)/i);
  if (fbMatch) facebook = fbMatch[1].replace(/\s·.*$/, "").trim();
  if (igMatch) instagram = igMatch[1].replace(/\s·.*$/, "").trim();

  // Remove the social footer line from display
  const socialIdx = description.indexOf("\n\nFacebook:");
  const igIdx = description.indexOf("\n\nInstagram:");
  const cutIdx = socialIdx !== -1 ? socialIdx : igIdx !== -1 ? igIdx : -1;
  const clean = cutIdx !== -1 ? description.slice(0, cutIdx).trim() : description.trim();

  return { facebook, instagram, clean };
}

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
