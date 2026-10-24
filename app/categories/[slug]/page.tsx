import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getListingsByCategory, getTowns, LISTINGS_PER_PAGE } from "@/lib/queries";
import { getActiveAdMap } from "@/lib/ad-slot-queries";
import { getStateConfig } from "@/lib/state-context";
import ListingCard from "@/components/ListingCard";
import TownPills from "@/components/TownPills";
import AdSlot from "@/components/AdSlot";
import Pagination from "@/components/Pagination";

interface Props {
  params: { slug: string };
  searchParams: { town?: string; page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  const { name, siteName } = getStateConfig();
  return {
    title: `${category.name} in ${name}`,
    description: `Find ${category.name.toLowerCase()} for kids in ${name}. Browse listings by town on ${siteName}.`,
    openGraph: {
      title: `${category.name} in ${name} | ${siteName}`,
      description: `Find ${category.name.toLowerCase()} for kids in ${name}.`,
    },
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { name: stateName } = getStateConfig();
  const [category, towns, adMap] = await Promise.all([
    getCategoryBySlug(params.slug),
    getTowns(),
    getActiveAdMap(),
  ]);

  if (!category) notFound();

  const selectedTown = searchParams.town;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const { items: listings, total } = await getListingsByCategory(
    params.slug,
    selectedTown,
    page
  ).catch(() => ({ items: [], total: 0 }));

  const totalPages = Math.max(1, Math.ceil(total / LISTINGS_PER_PAGE));
  const midIndex = Math.min(6, listings.length);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{category.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
        </div>
        <p className="text-gray-500 text-sm">
          {total} listing{total !== 1 ? "s" : ""} in {stateName}
          {selectedTown ? ` · ${selectedTown}` : ""}
          {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
        </p>
      </div>

      {/* Town filter */}
      <div className="mb-6">
        <Suspense>
          <TownPills towns={towns} selectedTown={selectedTown} />
        </Suspense>
      </div>

      {/* Ad: above grid */}
      {adMap["category_top"] && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 text-center">
            Advertisement
          </p>
          <AdSlot code={adMap["category_top"]} className="flex justify-center" minHeight={90} />
        </div>
      )}

      {/* Listings grid */}
      {listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.slice(0, midIndex).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {adMap["category_mid"] && listings.length > midIndex && (
            <div className="my-6">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 text-center">
                Advertisement
              </p>
              <AdSlot code={adMap["category_mid"]} className="flex justify-center" minHeight={250} />
            </div>
          )}
          {listings.length > midIndex && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {listings.slice(midIndex).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/categories/${params.slug}`}
            searchParams={{ town: selectedTown }}
          />
        </>
      ) : (
        <EmptyState category={category.name} town={selectedTown} />
      )}
    </div>
  );
}

function EmptyState({ category, town }: { category: string; town?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">🔍</div>
      <h2 className="text-lg font-medium text-gray-900 mb-1">No listings found</h2>
      <p className="text-gray-500 text-sm">
        No {category.toLowerCase()} found{town ? ` in ${town}` : ""}.{" "}
        {town ? "Try a different town or " : ""}Check back soon — we&apos;re adding listings daily.
      </p>
    </div>
  );
}
