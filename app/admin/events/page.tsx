import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getStateConfig } from "@/lib/state-context";
import type { Event } from "@/lib/types";
import EventsAdminClient from "./EventsAdminClient";

export const metadata: Metadata = { title: "Events — Admin" };

interface Props {
  searchParams: { status?: string };
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const supabase = createSupabaseServer();
  const { abbr } = getStateConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("events")
    .select("*, event_categories(categories(name, slug, icon))")
    .eq("state", abbr)
    .order("created_at", { ascending: false });

  const events = (data ?? []) as (Event & {
    event_categories: { categories: { name: string; slug: string; icon: string } | null }[];
  })[];

  const initialStatus = (searchParams.status ?? "pending") as "all" | "pending" | "approved" | "rejected";

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Events</h1>
      <EventsAdminClient events={events} initialStatus={initialStatus} />
    </div>
  );
}
