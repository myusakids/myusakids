import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getEventBySlug, getNearbyEvents } from "@/lib/event-queries";
import { getStateConfig } from "@/lib/state-context";
import EventCard from "@/components/EventCard";
import CostBadge from "@/components/CostBadge";
import AgeRange from "@/components/AgeRange";
import SaveEventButton from "./SaveEventButton";
import ShareButton from "./ShareButton";
import EventTracker from "./EventTracker";
import { formatEventDate, formatTimeRange } from "@/lib/date-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { abbr } = getStateConfig();
  const event = await getEventBySlug(params.slug, abbr);
  if (!event) return {};
  const desc = event.description?.slice(0, 160) ?? "";
  return {
    title: `${event.title} — ${formatEventDate(event.start_date)}`,
    description: desc,
    openGraph: {
      title: event.title,
      description: desc,
    },
  };
}

export const revalidate = 1800;

export default async function EventDetailPage({ params }: Props) {
  const { abbr } = getStateConfig();
  const event = await getEventBySlug(params.slug, abbr);
  if (!event) notFound();

  const nearbyEvents = await getNearbyEvents(event.town, event.slug, abbr, 3).catch(() => []);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.address ?? `${event.title} ${event.town} CT`
  )}`;

  const dateLabel = event.end_date && event.end_date !== event.start_date
    ? `${formatEventDate(event.start_date)} – ${formatEventDate(event.end_date)}`
    : formatEventDate(event.start_date);

  const timeLabel = formatTimeRange(event.start_time, event.end_time);

  // JSON-LD Event schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description ?? "",
    startDate: event.start_time
      ? `${event.start_date}T${event.start_time}`
      : event.start_date,
    endDate: event.end_time
      ? `${event.end_date ?? event.start_date}T${event.end_time}`
      : undefined,
    location: event.address
      ? {
          "@type": "Place",
          name: event.town,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.address,
            addressLocality: event.town,
            addressRegion: "CT",
            addressCountry: "US",
          },
        }
      : undefined,
    isAccessibleForFree: event.is_free,
    organizer: event.listing
      ? { "@type": "Organization", name: event.listing.name }
      : undefined,
  };

  return (
    <>
      <EventTracker eventId={event.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="bg-brand-green px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/events" className="text-brand-green-light text-xs hover:text-white mb-3 inline-block">
            ← Events calendar
          </Link>

          {/* Category tags */}
          {event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.categories.map((cat) => (
                <span
                  key={cat.slug}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white"
                >
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {event.title}
          </h1>

          <p className="text-brand-green-light mt-2 text-sm">
            📅 {dateLabel}
            {timeLabel && <> · {timeLabel}</>}
          </p>
          <p className="text-brand-green-light text-sm mt-0.5">
            📍 {event.town}, CT
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-brand-green text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get directions
          </a>
          <SaveEventButton slug={event.slug} title={event.title} eventId={event.id} />
          <ShareButton title={event.title} />
        </div>

        <div className="border-t border-gray-100 mb-6" />

        {/* ── About ────────────────────────────────────────────────────────── */}
        {event.description && (
          <section className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-2">About this event</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </section>
        )}

        {/* ── Info row ─────────────────────────────────────────────────────── */}
        <section className="mb-6 bg-gray-50 rounded-xl p-4 space-y-3">
          {/* Date & time */}
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm text-gray-800 font-medium">
                {dateLabel}
              </p>
              {timeLabel && (
                <p className="text-sm text-gray-500">{timeLabel}</p>
              )}
              {event.is_recurring && event.recurrence_rule && (
                <p className="text-xs text-brand-green mt-0.5">
                  🔁 Repeats {event.recurrence_rule}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.address && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-brand-green">
                {event.address}
              </a>
            </div>
          )}

          {/* Cost */}
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <CostBadge isFree={event.is_free} cost={event.cost} size="md" />
            {!event.is_free && !event.cost && (
              <span className="text-sm text-gray-500">See organizer for pricing</span>
            )}
          </div>

          {/* Ages */}
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <AgeRange ageMin={event.age_min} ageMax={event.age_max} className="text-sm text-gray-600" />
          </div>
        </section>

        {/* ── Hosted by ────────────────────────────────────────────────────── */}
        {event.listing && (
          <section className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-2">Hosted by</h2>
            <Link
              href={`/listings/${event.listing.slug}`}
              className="inline-flex items-center gap-2 text-sm text-brand-green hover:underline font-medium"
            >
              🏢 {event.listing.name} →
            </Link>
          </section>
        )}

        {/* ── Map placeholder ──────────────────────────────────────────────── */}
        {event.address && (
          <section className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-2">Location</h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-32 bg-brand-green-light border border-brand-green/20 rounded-xl hover:bg-brand-green/10 transition-colors group"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🗺️</div>
                <p className="text-sm text-brand-green-dark font-medium group-hover:underline">
                  {event.address}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Open in Google Maps →</p>
              </div>
            </a>
          </section>
        )}

        {/* ── More events nearby ───────────────────────────────────────────── */}
        {nearbyEvents.length > 0 && (
          <section>
            <h2 className="text-base font-medium text-gray-900 mb-3">
              More events in {event.town}
            </h2>
            <div className="space-y-3">
              {nearbyEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <Link
              href={`/events?town=${encodeURIComponent(event.town)}`}
              className="mt-4 inline-block text-sm text-brand-green hover:underline"
            >
              All events in {event.town} →
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
