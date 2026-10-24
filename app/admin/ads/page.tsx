import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getStateConfig } from "@/lib/state-context";
import AdSlotsClient from "./AdSlotsClient";

export const metadata: Metadata = { title: "Ad Slots" };
export const dynamic = "force-dynamic";

export default async function AdSlotsPage() {
  const { abbr } = getStateConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createSupabaseServer() as any;
  const { data: slots } = await supabase
    .from("ad_slots")
    .select("*")
    .eq("state", abbr)
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Ad Slots</h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste your AdSense or Amazon embed code for each slot. Toggle active to show on the site.
        </p>
      </div>

      <AdSlotsClient slots={slots ?? []} />
    </div>
  );
}
