"use client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface DayHours {
  day_of_week: number;
  is_closed: boolean;
  opens_at: string;
  closes_at: string;
}

interface Props {
  value: DayHours[];
  onChange: (hours: DayHours[]) => void;
}

export function defaultHours(): DayHours[] {
  return DAYS.map((_, i) => ({
    day_of_week: i,
    is_closed: i === 0, // Sunday closed by default
    opens_at: "09:00",
    closes_at: "17:00",
  }));
}

export default function HoursEditor({ value, onChange }: Props) {
  function update(index: number, patch: Partial<DayHours>) {
    const next = value.map((h, i) => (i === index ? { ...h, ...patch } : h));
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {value.map((day, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <span className="w-24 text-gray-700 shrink-0">{DAYS[i]}</span>

          <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={day.is_closed}
              onChange={(e) => update(i, { is_closed: e.target.checked })}
              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
            />
            Closed
          </label>

          {!day.is_closed && (
            <>
              <input
                type="time"
                value={day.opens_at}
                onChange={(e) => update(i, { opens_at: e.target.value })}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-green"
              />
              <span className="text-gray-400">to</span>
              <input
                type="time"
                value={day.closes_at}
                onChange={(e) => update(i, { closes_at: e.target.value })}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-green"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
