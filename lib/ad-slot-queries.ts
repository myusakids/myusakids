import { createSupabaseAdmin } from "./supabase-admin";

export type AdMap = Record<string, string>;

export async function getActiveAdMap(): Promise<AdMap> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;
    const { data } = await admin
      .from("ad_slots")
      .select("name, code")
      .eq("is_active", true);

    const map: AdMap = {};
    for (const slot of (data ?? []) as { name: string; code: string | null }[]) {
      if (slot.code) map[slot.name] = slot.code;
    }
    return map;
  } catch {
    return {};
  }
}
