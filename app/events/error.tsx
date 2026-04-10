"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">📅</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn&apos;t load events</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        There was a problem loading the events calendar. Please try again.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="bg-brand-green text-white font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors text-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:border-brand-green hover:text-brand-green transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
