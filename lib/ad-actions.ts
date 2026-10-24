"use server";

import { createSupabaseAdmin } from "./supabase-admin";

export async function saveAdSlot(input: {
  id: string;
  code: string;
  is_active: boolean;
}): Promise<{ error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;
    const { error } = await admin
      .from("ad_slots")
      .update({
        code: input.code || null,
        is_active: input.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}
