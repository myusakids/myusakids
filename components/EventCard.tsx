"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { EventCard as EventCardType } from "@/lib/types";
import CostBadge from "./CostBadge";
import { getMonthAbbr, getDayNumber, formatTime } from "@/lib/date-utils";

interface Props {
  event: EventCardType;
}

export default function EventCard({ event }: Props) {
  const monthAbbr = getMonthAbbr(event.start_date);
  const dayNum = getDayNumber(event.start_date);
  const primaryCat = event.categories[0];

  const storageKey = `saved_event_${event.slug}`;
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (saved) {
      localStorage.removeItem(storageKey);
      setSaved(false);
    } else {
      localStorage.setItem(storageKey, "1");
      setSaved(true);
    }
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-brand-green hover:shadow-sm transition-all"
    >
      {/* Date column */}
      <div className="shrink-0 w-12 flex flex-col items-center pt-0.5">
        <span className="text-xs font-semibold text-brand-green uppercase tracking-wide">
          {monthAbbr}
        </span>
        <span className="text-2xl font-bold text-gray-900 leading-none mt-0.5">
          {dayNum}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 text-sm leading-snug group-hover:text-brand-green transition-colors line-clamp-2">
            {event.title}
          </h3>
          {/* Save button */}
          <button
            onClick={toggleSave}
            aria-label={saved ? "Unsave event" : "Save event"}
            className={`shrink-0 p-1 rounded-full transition-colors ${
              saved ? "text-red-400" : "text-gray-300 hover:text-red-400"
            }`}
          >
            <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          📍 {event.town}
          {event.start_time && (
            <> · {formatTime(event.start_time)}</>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {primaryCat && (
            <span className="text-xs bg-brand-green-light text-brand-green-dark px-2 py-0.5 rounded-full">
              {primaryCat.icon} {primaryCat.name}
            </span>
          )}
          <CostBadge isFree={event.is_free} cost={event.cost} />
        </div>
      </div>
    </Link>
  );
}
