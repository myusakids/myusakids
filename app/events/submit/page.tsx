import type { Metadata } from "next";
import { getCategories, getTowns } from "@/lib/queries";
import EventSubmitForm from "./EventSubmitForm";

export const metadata: Metadata = {
  title: "Submit an event",
  description: "Submit a free family event to the MyConnecticutKids events calendar.",
};

export default async function EventSubmitPage() {
  const [categories, towns] = await Promise.all([
    getCategories().catch(() => []),
    getTowns().catch(() => []),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Submit an event</h1>
        <p className="text-gray-500 text-sm mt-1">
          Free to submit. We review every event before it goes live — usually within 1 business day.
        </p>
      </div>
      <EventSubmitForm categories={categories} towns={towns} />
    </div>
  );
}
