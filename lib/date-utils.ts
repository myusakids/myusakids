// All date formatting in one place so timezone handling is consistent.
// We treat event dates as local-calendar dates (no timezone conversion).

export function parseLocalDate(dateStr: string): Date {
  // "YYYY-MM-DD" → local midnight (avoids UTC-offset day shift)
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatMonthYear(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  );
}

export function formatEventDate(dateStr: string): string {
  // "Saturday, April 12"
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseLocalDate(dateStr));
}

export function formatEventDateShort(dateStr: string): string {
  // "Apr 12"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parseLocalDate(dateStr));
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return "";
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function getMonthAbbr(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    parseLocalDate(dateStr)
  );
}

export function getDayNumber(dateStr: string): number {
  return parseLocalDate(dateStr).getDate();
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

// Returns "YYYY-MM-DD" for a given Date
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
