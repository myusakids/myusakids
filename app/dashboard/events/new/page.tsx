import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getCategories, getTowns } from "@/lib/queries";
import EventForm from "../EventForm";

export const metadata: Metadata = { title: "Add event — Dashboard" };

export default async function NewEventPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [categories, towns] = await Promise.all([
    getCategories().catch(() => []),
    getTowns().catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Add new event</h1>
      <EventForm categories={categories} towns={towns} />
    </div>
  );
}
