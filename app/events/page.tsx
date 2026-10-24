import { Suspense } from "react";
import type { Metadata } from "next";
import { getEventsByMonth, getEvents } from "@/lib/event-queries";
import { getTowns } from "@/lib/queries";
import EventsPageClient from "./EventsPageClient";
import { todayISO } from "@/lib/date-utils";

export const metadata: Metadata = {
  title: "Events Calendar",
  description:
    "Find upcoming family events, festivals, classes, and activities for kids across Connecticut.",
};

export const revalidate = 1800;

interface Props {
  searchParams: { month?: string; town?: string; cat?: string };
}

export default async function EventsPage({ searchParams }: Props) {
  const today = todayISO();
  const [todayYear, todayMonth] = today.split("-").map(Number);

  // Parse ?month=2026-04
  let year = todayYear;
  let month = todayMonth;
  if (searchParams.month) {
    const parts = searchParams.month.split("-").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      [year, month] = parts;
    }
  }

  const [monthEvents, towns] = await Promise.all([
    getEventsByMonth(year, month).catch(() => []),
    getTowns().catch(() => []),
  ]);

  // For list view: all upcoming events (from today forward)
  const upcomingEvents = await getEvents({
    town: searchParams.town,
    startDate: today,
  }).catch(() => []);

  return (
    <Suspense fallback={null}>
      <EventsPageClient
        initialYear={year}
        initialMonth={month}
        monthEvents={monthEvents}
        upcomingEvents={upcomingEvents}
        towns={towns}
        today={today}
        initialTown={searchParams.town}
        initialCat={searchParams.cat}
      />
    </Suspense>
  );
}
