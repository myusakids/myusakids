"use client";

// Lightweight client-side analytics tracker.
// Fire-and-forget — never throws, never blocks the UI.

export type AnalyticsEventType =
  | "listing_view"
  | "website_click"
  | "directions_click"
  | "listing_save"
  | "event_view"
  | "event_save";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("mck_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("mck_sid", sid);
  }
  return sid;
}

export function trackEvent(
  eventType: AnalyticsEventType,
  opts: { listingId?: string; eventId?: string } = {}
): void {
  // Don't block — best effort
  const payload = {
    event_type: eventType,
    listing_id: opts.listingId ?? null,
    event_id: opts.eventId ?? null,
    session_id: getSessionId(),
  };

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
