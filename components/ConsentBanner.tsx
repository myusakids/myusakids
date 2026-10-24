"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "mck-consent";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type Consent = "accepted" | "declined" | null;

export default function ConsentBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Consent) ?? null;
    setConsent(stored);
    setHydrated(true);
  }, []);

  function choose(value: Exclude<Consent, null>) {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  }

  const showBanner = hydrated && consent === null;
  const loadAds = hydrated && consent === "accepted" && !!ADSENSE_CLIENT;

  return (
    <>
      {loadAds && (
        <Script
          id="adsbygoogle-loader"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie and advertising consent"
          className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-gray-700 flex-1">
              We use cookies and third-party ads (Google AdSense) to keep this site
              free. See our{" "}
              <a href="/affiliate-disclosure" className="text-brand-green underline">
                privacy &amp; disclosures
              </a>{" "}
              for details.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => choose("declined")}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => choose("accepted")}
                className="text-sm px-4 py-2 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green-mid transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
