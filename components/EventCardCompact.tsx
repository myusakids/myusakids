import Link from "next/link";
import type { EventCard } from "@/lib/types";
import CostBadge from "./CostBadge";
import { getMonthAbbr, getDayNumber, formatTime } from "@/lib/date-utils";

interface Props {
  event: EventCard;
}

export default function EventCardCompact({ event }: Props) {
  const monthAbbr = getMonthAbbr(event.start_date);
  const dayNum = getDayNumber(event.start_date);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
    >
      {/* Date pill */}
      <div className="shrink-0 w-11 h-11 flex flex-col items-center justify-center bg-brand-green-light rounded-lg">
        <span className="text-[10px] font-bold text-brand-green uppercase leading-none">
          {monthAbbr}
        </span>
        <span className="text-base font-bold text-brand-green-dark leading-none mt-0.5">
          {dayNum}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-green transition-colors line-clamp-1">
          {event.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {event.town}
          {event.start_time && <> · {formatTime(event.start_time)}</>}
        </p>
      </div>

      <CostBadge isFree={event.is_free} cost={event.cost} />
    </Link>
  );
}
