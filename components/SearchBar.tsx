"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search camps, classes, sports…",
  className = "",
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <input
        ref={inputRef}
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-l-xl border border-gray-200 focus:outline-none focus:border-brand-green text-gray-900 placeholder:text-gray-400 text-sm"
      />
      <button
        type="submit"
        className="bg-brand-green text-white px-5 py-3 rounded-r-xl font-medium text-sm hover:bg-brand-green-mid transition-colors shrink-0"
      >
        Search
      </button>
    </form>
  );
}
