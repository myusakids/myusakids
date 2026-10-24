import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const claim = searchParams.get("claim"); // listing ID to claim after login
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // Exchange the magic-link code for a session (uses session client for cookies)
    const supabase = createSupabaseServer();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Use admin client for DB writes — bypasses RLS so we can read/update
      // pending/unclaimed listings that the anon key can't see.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createSupabaseAdmin() as any;

      // If there's a ?claim= param, associate that specific listing
      if (claim) {
        await admin
          .from("listings")
          .update({ owner_id: data.user.id })
          .eq("id", claim)
          .is("owner_id", null);
      }

      // Auto-associate any listings submitted with this email that are unclaimed
      const { data: listingsToLink } = await admin
        .from("listings")
        .select("id")
        .eq("email", data.user.email ?? "")
        .is("owner_id", null);

      if (listingsToLink && listingsToLink.length > 0) {
        await admin
          .from("listings")
          .update({ owner_id: data.user.id })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .in("id", listingsToLink.map((l: any) => l.id));
      }

      const redirectTo = claim ? "/dashboard" : next;
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth failed
  return NextResponse.redirect(`${origin}/auth/signin?error=true`);
}
