"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EventCard as EventCardType, Town } from "@/lib/types";
import EventCard from "@/components/EventCard";
import CalendarGrid from "@/components/CalendarGrid";
import MonthNav from "@/components/MonthNav";
import FilterPills, { type FilterOption } from "@/components/FilterPills";
import { getEventsByMonth, getEvents } from "@/lib/event-queries";
import { formatEventDate, toISODate, todayISO } from "@/lib/date-utils";
import Link from "next/link";

const FILTER_OPTIONS: FilterOption[] = [
  { label: "All events", value: "all" },
  { label: "This week", value: "this-week" },
  { label: "Free", value: "free" },
  { label: "Outdoor", value: "things-to-do" },
  { label: "Arts", value: "classes" },
  { label: "Sports", value: "sports" },
  { label: "Education", value: "education" },
];

interface Props {
  initialYear: number;
  initialMonth: number;
  monthEvents: EventCardType[];
  upcomingEvents: EventCardType[];
  towns: Town[];
  today: string;
  initialTown?: string;
  initialCat?: string;
}

export default function EventsPageClient({
  initialYear,
  initialMonth,
  monthEvents: initialMonthEvents,
  upcomingEvents: initialUpcoming,
  towns,
  today,
  initialTown,
  initialCat,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [monthEvents, setMonthEvents] = useState<EventCardType[]>(initialMonthEvents);
  const [upcomingEvents, setUpcomingEvents] = useState<EventCardType[]>(initialUpcoming);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(initialCat ?? "all");
  const [selectedTown, setSelectedTown] = useState(initialTown ?? "");
  const [loading, setLoading] = useState(false);

  // Set of dates that have events (for calendar dots)
  const eventDateSet = useMemo(
    () => new Set(monthEvents.map((e) => e.start_date)),
    [monthEvents]
  );

  // Apply category + free + this-week filters to upcoming list
  const filteredEvents = useMemo(() => {
    let events = upcomingEvents;

    if (activeFilter === "free") {
      events = events.filter((e) => e.is_free);
    } else if (activeFilter === "this-week") {
      const d = new Date();
      const sun = new Date(d);
      sun.setDate(d.getDate() - d.getDay());
      const sat = new Date(sun);
      sat.setDate(sun.getDate() + 6);
      const sunStr = toISODate(sun);
      const satStr = toISODate(sat);
      events = events.filter((e) => e.start_date >= sunStr && e.start_date <= satStr);
    } else if (activeFilter !== "all") {
      events = events.filter((e) =>
        e.categories.some((c) => c.slug === activeFilter)
      );
    }

    if (selectedDate) {
      events = events.filter((e) => e.start_date === selectedDate);
    }

    return events;
  }, [upcomingEvents, activeFilter, selectedDate]);

  // Group events by date for list view
  const groupedEvents = useMemo(() => {
    const groups: Map<string, EventCardType[]> = new Map();
    for (const event of filteredEvents) {
      const key = event.start_date;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
    }
    return Array.from(groups.entries());
  }, [filteredEvents]);

  // Navigate months — reload events from Supabase client-side
  const goToMonth = useCallback(
    async (newYear: number, newMonth: number) => {
      setLoading(true);
      setSelectedDate(null);
      try {
        const [newMonthEvents, newUpcoming] = await Promise.all([
          getEventsByMonth(newYear, newMonth),
          getEvents({
            town: selectedTown || undefined,
            startDate: todayISO(),
          }),
        ]);
        setYear(newYear);
        setMonth(newMonth);
        setMonthEvents(newMonthEvents);
        setUpcomingEvents(newUpcoming);
        // Update URL param
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", `${newYear}-${String(newMonth).padStart(2, "0")}`);
        router.replace(`/events?${params.toString()}`, { scroll: false });
      } finally {
        setLoading(false);
      }
    },
    [selectedTown, searchParams, router]
  );

  function prevMonth() {
    const d = new Date(year, month - 2, 1);
    goToMonth(d.getFullYear(), d.getMonth() + 1);
  }
  function nextMonth() {
    const d = new Date(year, month, 1);
    goToMonth(d.getFullYear(), d.getMonth() + 1);
  }

  // Town filter change — reload upcoming
  async function handleTownChange(town: string) {
    setSelectedTown(town);
    setLoading(true);
    try {
      const newUpcoming = await getEvents({
        town: town || undefined,
        startDate: todayISO(),
      });
      setUpcomingEvents(newUpcoming);
      const params = new URLSearchParams(searchParams.toString());
      if (town) params.set("town", town);
      else params.delete("town");
      router.replace(`/events?${params.toString()}`, { scroll: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Family events across Connecticut</p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <FilterPills
            options={FILTER_OPTIONS}
            selected={activeFilter}
            onSelect={(v) => { setActiveFilter(v); setSelectedDate(null); }}
          />
        </div>
        <select
          value={selectedTown}
          onChange={(e) => handleTownChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-green text-gray-700 shrink-0"
        >
          <option value="">All towns</option>
          {towns.map((t) => (
            <option key={t.slug} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* ── Calendar view ────────────────────────────────────────────────── */}
      {view === "calendar" && (
        <div className={`mb-6 bg-white border border-gray-100 rounded-2xl p-5 ${loading ? "opacity-50" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <MonthNav year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />
            <Link
              href="/events/submit"
              className="text-xs text-brand-green hover:underline hidden sm:block"
            >
              + Submit an event
            </Link>
          </div>
          <CalendarGrid
            year={year}
            month={month}
            eventDates={eventDateSet}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            today={today}
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear day filter ×
            </button>
          )}
        </div>
      )}

      {/* ── Events list ──────────────────────────────────────────────────── */}
      <div>
        {selectedDate && (
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Events on {formatEventDate(selectedDate)}
          </h2>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">📅</div>
            <h2 className="text-base font-medium text-gray-900 mb-1">No events found</h2>
            <p className="text-sm text-gray-500">
              Try a different filter, town, or month.
            </p>
            <Link
              href="/events/submit"
              className="mt-4 inline-block text-sm text-brand-green hover:underline"
            >
              Know of an event? Submit it →
            </Link>
          </div>
        )}

        {!loading && filteredEvents.length > 0 && (
          view === "list" ? (
            // List view: grouped by date
            <div className="space-y-6">
              {groupedEvents.map(([date, events]) => (
                <div key={date}>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {formatEventDate(date)}
                  </h2>
                  <div className="space-y-3">
                    {events.map((e) => <EventCard key={e.id} event={e} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Calendar view: flat list below calendar
            <div className="space-y-3">
              {filteredEvents.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )
        )}
      </div>

      {/* Submit CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/events/submit"
          className="inline-flex items-center gap-2 text-sm text-brand-green border border-brand-green px-5 py-2.5 rounded-xl hover:bg-brand-green hover:text-white transition-colors"
        >
          📅 Submit a free event
        </Link>
      </div>
    </div>
  );
}
