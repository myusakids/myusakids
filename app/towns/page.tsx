import Link from "next/link";
import type { Metadata } from "next";
import { getTowns } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Connecticut Towns | MyConnecticutKids",
  description: "Browse kids activities by Connecticut town. Find family-friendly classes, camps, and events in all 169 CT municipalities.",
};

export const revalidate = 86400;

const COUNTIES = ["Fairfield", "Hartford", "Litchfield", "Middlesex", "New Haven", "New London", "Tolland", "Windham"];

export default async function TownsIndexPage() {
  const towns = await getTowns();

  const byCounty = COUNTIES.reduce<Record<string, typeof towns>>((acc, county) => {
    acc[county] = towns.filter((t) => t.county === county);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Browse by Connecticut Town
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Find kids activities, classes, and events in all 169 CT municipalities.
      </p>

      <div className="space-y-8">
        {COUNTIES.map((county) => (
          <div key={county}>
            <h2 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">
              {county} County
            </h2>
            <div className="flex flex-wrap gap-2">
              {byCounty[county]?.map((town) => (
                <Link
                  key={town.slug}
                  href={`/towns/${town.slug}`}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-brand-green-light hover:text-brand-green-dark transition-colors"
                >
                  {town.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
