"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category, Town } from "@/lib/types";

interface Props {
  categories: Category[];
  towns: Town[];
  selectedTown?: string;
  selectedCategory?: string;
  currentQ?: string;
}

export default function SearchFilters({
  categories,
  towns,
  selectedTown,
  selectedCategory,
  currentQ,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      {/* Town */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Town</h3>
        <select
          value={selectedTown ?? ""}
          onChange={(e) => update("town", e.target.value || null)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-green text-gray-700"
        >
          <option value="">All towns</option>
          {towns.map((town) => (
            <option key={town.slug} value={town.name}>
              {town.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={!selectedCategory}
              onChange={() => update("category", null)}
              className="text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm text-gray-700">All categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={selectedCategory === cat.slug}
                onChange={() => update("category", cat.slug)}
                className="text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-gray-700">
                {cat.icon} {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      {(selectedTown || selectedCategory || currentQ) && (
        <button
          onClick={() => router.push("/search")}
          className="text-xs text-brand-green hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
