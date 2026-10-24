import { createSupabaseAdmin } from "./supabase-admin";
import { getStateConfig } from "./state-context";

export type AdMap = Record<string, string>;

export async function getActiveAdMap(): Promise<AdMap> {
  try {
    const { abbr } = getStateConfig();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;
    const { data } = await admin
      .from("ad_slots")
      .select("name, code")
      .eq("is_active", true)
      .eq("state", abbr);

    const map: AdMap = {};
    for (const slot of (data ?? []) as { name: string; code: string | null }[]) {
      if (slot.code) map[slot.name] = slot.code;
    }
    return map;
  } catch {
    return {};
  }
}
