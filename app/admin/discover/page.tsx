import type { Metadata } from "next";
import { getCategories, getTowns } from "@/lib/queries";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = { title: "Discover Businesses" };

export default async function DiscoverPage() {
  const [categories, towns] = await Promise.all([getCategories(), getTowns()]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Discover Businesses</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use AI to find real local businesses and import them directly into the directory.
        </p>
      </div>
      <DiscoverClient categories={categories} towns={towns} />
    </div>
  );
}
