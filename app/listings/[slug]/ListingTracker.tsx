"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  listingId: string;
}

/** Fires a listing_view event once when the detail page mounts. */
export default function ListingTracker({ listingId }: Props) {
  useEffect(() => {
    trackEvent("listing_view", { listingId });
  }, [listingId]);

  return null;
}
