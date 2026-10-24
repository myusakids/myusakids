"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  eventId: string;
}

export default function EventTracker({ eventId }: Props) {
  useEffect(() => {
    trackEvent("event_view", { eventId });
  }, [eventId]);

  return null;
}
