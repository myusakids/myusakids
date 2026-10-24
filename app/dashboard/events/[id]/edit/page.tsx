import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getCategories, getTowns } from "@/lib/queries";
import EventForm from "../../EventForm";
import type { Event } from "@/lib/types";

export const metadata: Metadata = { title: "Edit event — Dashboard" };

interface Props {
  params: { id: string };
}

export default async function EditEventPage({ params }: Props) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: event }, categories, towns] = await Promise.all([
    supabase.from("events").select("*").eq("id", params.id).eq("owner_id", user.id).single(),
    getCategories().catch(() => []),
    getTowns().catch(() => []),
  ]);

  if (!event) notFound();

  const e = event as Event;

  // Get existing category slugs for this event
  const { data: ecRows } = await supabase
    .from("event_categories")
    .select("categories(slug)")
    .eq("event_id", e.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedCategories = (ecRows ?? []).map((row: any) => row.categories?.slug).filter(Boolean);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit event</h1>
      <EventForm
        categories={categories}
        towns={towns}
        eventId={e.id}
        initialValues={{
          title: e.title,
          town: e.town,
          start_date: e.start_date,
          end_date: e.end_date ?? "",
          start_time: e.start_time ?? "",
          end_time: e.end_time ?? "",
          is_free: e.is_free,
          cost: e.cost ?? "",
          age_min: e.age_min?.toString() ?? "",
          age_max: e.age_max?.toString() ?? "",
          description: e.description ?? "",
          address: e.address ?? "",
          is_recurring: e.is_recurring,
          recurrence_rule: e.recurrence_rule ?? "",
          selectedCategories,
        }}
      />
    </div>
  );
}
