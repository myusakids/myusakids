import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Singleton browser client — safe to import in any client component
export const supabaseBrowser = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
