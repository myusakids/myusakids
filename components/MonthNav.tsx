"use client";

import { formatMonthYear } from "@/lib/date-utils";

interface Props {
  year: number;
  month: number; // 1-indexed
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthNav({ year, month, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg border border-gray-200 hover:border-brand-green hover:text-brand-green transition-colors"
        aria-label="Previous month"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="text-base font-medium text-gray-900 min-w-[160px] text-center">
        {formatMonthYear(year, month)}
      </span>

      <button
        onClick={onNext}
        className="p-2 rounded-lg border border-gray-200 hover:border-brand-green hover:text-brand-green transition-colors"
        aria-label="Next month"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
