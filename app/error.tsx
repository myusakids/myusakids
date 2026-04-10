"use client";

import { useEffect } from "react";

export default function Error({
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
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-brand-green text-white font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors text-sm"
      >
        Try again
      </button>
    </div>
  );
}
