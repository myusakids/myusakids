import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/paypal/subscription-approved
 * Called client-side from PayPalButton.tsx onApprove callback.
 * Marks the listing as featured.
 *
 * Note: For production, you should verify the subscription with PayPal's
 * API before marking as featured. This is a simplified placeholder.
 * Set up PayPal webhooks at developer.paypal.com for server-to-server events.
 */
export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, listingId, cycle } = await req.json();

    if (!subscriptionId || !listingId) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;

    // Mark listing as featured
    await admin
      .from("listings")
      .update({
        is_featured: true,
        // Store subscription metadata for reference
        // (You may want to add a subscriptions table in a future phase)
      })
      .eq("id", listingId);

    console.log(`[PayPal] Subscription approved: ${subscriptionId} for listing ${listingId} (${cycle})`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[PayPal] subscription-approved error:", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
