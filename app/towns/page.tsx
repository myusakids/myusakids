import Link from "next/link";
import type { Metadata } from "next";
import { getTowns } from "@/lib/queries";
import { getStateConfig } from "@/lib/state-context";

export async function generateMetadata(): Promise<Metadata> {
  const { name } = getStateConfig();
  return {
    title: `${name} Towns`,
    description: `Browse kids activities by ${name} town. Find family-friendly classes, camps, and events across ${name}.`,
  };
}

export const revalidate = 86400;

export default async function TownsIndexPage() {
  const { name } = getStateConfig();
  const towns = await getTowns();

  // Group towns by county, deriving counties from the data rather than
  // hardcoding per-state. Towns without a county go into "Other".
  const byCounty = towns.reduce<Record<string, typeof towns>>((acc, town) => {
    const key = town.county ?? "Other";
    (acc[key] ??= []).push(town);
    return acc;
  }, {});
  const counties = Object.keys(byCounty).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Browse by {name} Town
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Find kids activities, classes, and events in all {towns.length} {name} municipalities.
      </p>

      <div className="space-y-8">
        {counties.map((county) => (
          <div key={county}>
            <h2 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">
              {county}{county === "Other" ? "" : " County"}
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
