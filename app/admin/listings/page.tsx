import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Listing } from "@/lib/types";
import ListingsAdminClient from "./ListingsAdminClient";

export const metadata: Metadata = { title: "Listings — Admin" };

interface Props {
  searchParams: { status?: string };
}

export default async function AdminListingsPage({ searchParams }: Props) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  // Fetch all listings with their first category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("listings")
    .select("*, listing_categories(categories(name, slug, icon))")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as (Listing & {
    listing_categories: { categories: { name: string; slug: string; icon: string } | null }[];
  })[];

  const initialStatus = (searchParams.status ?? "pending") as "all" | "pending" | "approved" | "rejected";

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Listings</h1>
      <ListingsAdminClient listings={listings} initialStatus={initialStatus} />
    </div>
  );
}
