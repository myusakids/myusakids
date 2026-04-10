"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Town } from "@/lib/types";

interface Props {
  towns: Town[];
  selectedTown?: string;
  baseHref?: string; // e.g. "/categories/camps" — if provided, navigates to this URL with ?town=
}

export default function TownPills({ towns, selectedTown, baseHref }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick(townName: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (townName) {
      params.set("town", townName);
    } else {
      params.delete("town");
    }
    const target = baseHref ?? pathname;
    router.push(`${target}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => handleClick(null)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !selectedTown
            ? "bg-brand-green text-white"
            : "bg-white border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
        }`}
      >
        All towns
      </button>
      {towns.map((town) => (
        <button
          key={town.slug}
          onClick={() => handleClick(town.name)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTown === town.name
              ? "bg-brand-green text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
          }`}
        >
          {town.name}
        </button>
      ))}
    </div>
  );
}
