import type { ListingHours } from "@/lib/types";

interface Props {
  hours: ListingHours[];
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function OpenClosedBadge({ hours }: Props) {
  const now = new Date();
  const day = now.getDay(); // 0=Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find((h) => h.day_of_week === day);

  if (!todayHours) return null;

  if (todayHours.is_closed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Closed today
      </span>
    );
  }

  if (!todayHours.opens_at || !todayHours.closes_at) return null;

  const opens = timeToMinutes(todayHours.opens_at);
  const closes = timeToMinutes(todayHours.closes_at);
  const isOpen = currentMinutes >= opens && currentMinutes < closes;

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "pm" : "am";
    const hour = h % 12 || 12;
    return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
  };

  if (isOpen) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-brand-green">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
        Open · closes {fmt(todayHours.closes_at)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Closed · opens {fmt(todayHours.opens_at)}
    </span>
  );
}
