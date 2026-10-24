import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, listing_id, event_id, session_id } = body;

    const validTypes = [
      "listing_view",
      "website_click",
      "directions_click",
      "listing_save",
      "event_view",
      "event_save",
    ];

    if (!event_type || !validTypes.includes(event_type)) {
      return NextResponse.json({ error: "invalid event_type" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;
    await admin.from("analytics_events").insert({
      event_type,
      listing_id: listing_id ?? null,
      event_id: event_id ?? null,
      session_id: session_id ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never fail loudly — analytics must not break the site
    return NextResponse.json({ ok: true });
  }
}
