import type { Metadata } from "next";
import { getCategories, getTowns } from "@/lib/queries";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Add your listing",
  description: "List your Connecticut kids business for free on MyConnecticutKids.",
};

export default async function SubmitPage() {
  const [categories, towns] = await Promise.all([
    getCategories().catch(() => []),
    getTowns().catch(() => []),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Add your business</h1>
        <p className="text-gray-500 text-sm mt-1">
          It&apos;s free and takes less than 5 minutes. We review every listing before it goes live.
        </p>
      </div>
      <SubmitForm categories={categories} towns={towns} />
    </div>
  );
}
