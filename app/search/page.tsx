import { Suspense } from "react";
import type { Metadata } from "next";
import { searchListings, getCategories, getTowns, LISTINGS_PER_PAGE } from "@/lib/queries";
import { getStateConfig } from "@/lib/state-context";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import SearchFilters from "./SearchFilters";

interface Props {
  searchParams: { q?: string; town?: string; category?: string; page?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const { name } = getStateConfig();
  return {
    title: "Search listings",
    description: `Search camps, classes, sports programs, childcare and more for kids in ${name}.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, town, category } = searchParams;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [{ items: results, total }, categories, towns] = await Promise.all([
    searchListings({ q, town, category }, page).catch(() => ({ items: [], total: 0 })),
    getCategories().catch(() => []),
    getTowns().catch(() => []),
  ]);

  const hasQuery = q || town || category;
  const totalPages = Math.max(1, Math.ceil(total / LISTINGS_PER_PAGE));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar defaultValue={q} className="max-w-2xl" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar filters ──────────────────────────────────────────────── */}
        <aside className="w-full md:w-56 shrink-0">
          <Suspense>
            <SearchFilters
              categories={categories}
              towns={towns}
              selectedTown={town}
              selectedCategory={category}
              currentQ={q}
            />
          </Suspense>
        </aside>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {hasQuery ? (
                <>
                  <span className="font-medium text-gray-900">{total}</span> result
                  {total !== 1 ? "s" : ""}
                  {q ? ` for "${q}"` : ""}
                  {town ? ` in ${town}` : ""}
                  {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
                </>
              ) : (
                <>
                  Browse all listings
                  {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
                </>
              )}
            </p>
          </div>

          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/search"
                searchParams={{ q, town, category }}
              />
            </>
          ) : (
            <EmptyState q={q} town={town} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ q, town }: { q?: string; town?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">🔍</div>
      <h2 className="text-lg font-medium text-gray-900 mb-1">No results found</h2>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {q ? `No listings match "${q}"${town ? ` in ${town}` : ""}.` : "No listings found."} Try
        different keywords, a different town, or browse by category.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm">
        <a href="/categories/camps" className="text-brand-green hover:underline">Camps</a>
        <span className="text-gray-300">·</span>
        <a href="/categories/classes" className="text-brand-green hover:underline">Classes</a>
        <span className="text-gray-300">·</span>
        <a href="/categories/sports" className="text-brand-green hover:underline">Sports</a>
        <span className="text-gray-300">·</span>
        <a href="/categories/things-to-do" className="text-brand-green hover:underline">Things to Do</a>
      </div>
    </div>
  );
}
