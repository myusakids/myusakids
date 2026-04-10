import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategoryBySlug, getListingsByCategory, getTowns } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";
import TownPills from "@/components/TownPills";

interface Props {
  params: { slug: string };
  searchParams: { town?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: `${category.name} in Connecticut`,
    description: `Find ${category.name.toLowerCase()} for kids in Connecticut. Browse listings by town on MyConnecticutKids.`,
    openGraph: {
      title: `${category.name} in Connecticut | MyConnecticutKids`,
      description: `Find ${category.name.toLowerCase()} for kids in Connecticut.`,
    },
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params, searchParams }: Props) {
  const [category, towns] = await Promise.all([
    getCategoryBySlug(params.slug),
    getTowns(),
  ]);

  if (!category) notFound();

  const selectedTown = searchParams.town;
  const listings = await getListingsByCategory(params.slug, selectedTown).catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{category.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
        </div>
        <p className="text-gray-500 text-sm">
          {listings.length} listing{listings.length !== 1 ? "s" : ""} in Connecticut
          {selectedTown ? ` · ${selectedTown}` : ""}
        </p>
      </div>

      {/* Town filter */}
      <div className="mb-6">
        <Suspense>
          <TownPills towns={towns} selectedTown={selectedTown} />
        </Suspense>
      </div>

      {/* Listings grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
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
