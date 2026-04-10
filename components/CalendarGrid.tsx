"use client";

import { toISODate } from "@/lib/date-utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  year: number;
  month: number; // 1-indexed
  eventDates: Set<string>; // set of "YYYY-MM-DD" strings that have events
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  today: string; // "YYYY-MM-DD"
}

export default function CalendarGrid({
  year,
  month,
  eventDates,
  selectedDate,
  onSelectDate,
  today,
}: Props) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startDow = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build grid cells: leading blanks + days + trailing blanks
  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: toISODate(new Date(year, month - 1, d)),
      day: d,
    });
  }
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l) => (
          <div key={l} className="text-center text-xs font-medium text-gray-400 py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`blank-${i}`} />;
          }

          const isToday = cell.date === today;
          const isSelected = cell.date === selectedDate;
          const hasEvents = eventDates.has(cell.date);

          return (
            <button
              key={cell.date}
              onClick={() => onSelectDate(isSelected ? null : cell.date)}
              className={`relative flex flex-col items-center justify-center w-9 h-9 mx-auto rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-brand-green text-white"
                  : isToday
                  ? "bg-brand-green-light text-brand-green-dark font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label={`${cell.date}${hasEvents ? ", has events" : ""}`}
            >
              {cell.day}
              {hasEvents && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-brand-green"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
