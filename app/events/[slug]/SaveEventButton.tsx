"use client";

import { useState, useEffect } from "react";

interface Props {
  slug: string;
  title: string;
}

export default function SaveEventButton({ slug, title }: Props) {
  const key = `saved_event_${slug}`;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(localStorage.getItem(key) === "1");
  }, [key]);

  function toggle() {
    if (saved) {
      localStorage.removeItem(key);
      setSaved(false);
    } else {
      localStorage.setItem(key, "1");
      setSaved(true);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? `Unsave ${title}` : `Save ${title}`}
      className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors ${
        saved
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white border-gray-200 text-gray-700 hover:border-brand-green hover:text-brand-green"
      }`}
    >
      <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {saved ? "Saved" : "Save event"}
    </button>
  );
}
