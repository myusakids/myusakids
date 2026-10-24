import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client — bypasses RLS. Use ONLY in server-side code
 * (server components, server actions, route handlers). Never expose to the client.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Get it from: Supabase dashboard → Project Settings → API → service_role (secret).
 */
export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Fall back to anon key if service role key not configured yet.
  // With anon key, RLS applies — pending/unclaimed listings won't be visible,
  // but the page will render rather than crash.
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
