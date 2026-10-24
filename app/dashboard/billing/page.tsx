import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Listing } from "@/lib/types";
import PayPalButton from "./PayPalButton";

export const metadata: Metadata = { title: "Billing — Dashboard" };

const FEATURES = [
  "Homepage spotlight — appear in the featured section",
  "Priority placement in search results and category pages",
  "Bold highlighted card design to stand out",
  "📅 Unlimited event listings",
  "Analytics dashboard",
  "Priority email support",
];

// Replace these with your actual PayPal plan IDs from the PayPal developer dashboard
const PAYPAL_MONTHLY_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID ?? "";
const PAYPAL_ANNUAL_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_ANNUAL_PLAN_ID ?? "";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

export default async function BillingPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: listing } = await supabase
    .from("listings")
    .select("id, is_featured, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  const l = listing as Pick<Listing, "id" | "is_featured" | "name"> | null;
  const paypalReady = !!PAYPAL_CLIENT_ID && !!PAYPAL_MONTHLY_PLAN_ID;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Billing & plan</h1>
      <p className="text-sm text-gray-500 mb-8">
        {l
          ? `Managing plan for ${l.name}`
          : "Add your listing first before upgrading your plan."}
      </p>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
        {/* Free plan */}
        <div className={`border-2 rounded-2xl p-6 ${l && !l.is_featured ? "border-brand-green bg-brand-green-light" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Free</h2>
            {l && !l.is_featured && (
              <span className="text-xs bg-brand-green text-white px-2.5 py-1 rounded-full font-medium">Current plan</span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">$0</p>
          <p className="text-xs text-gray-400 mb-4">per month</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Listed in the directory</li>
            <li>✓ Appears in search results</li>
            <li>✓ Up to 2 event listings/month</li>
          </ul>
        </div>

        {/* Featured plan */}
        <div className={`border-2 rounded-2xl p-6 ${l?.is_featured ? "border-brand-green bg-brand-green-light" : "border-amber-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Featured ⭐</h2>
            {l?.is_featured && (
              <span className="text-xs bg-brand-green text-white px-2.5 py-1 rounded-full font-medium">Current plan</span>
            )}
          </div>

          {/* Pricing toggle */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 text-center border border-gray-200 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">$29</p>
              <p className="text-xs text-gray-400">/ month</p>
            </div>
            <div className="flex-1 text-center border border-amber-300 bg-amber-50 rounded-xl p-3 relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full font-medium">Save $49</span>
              <p className="text-2xl font-bold text-gray-900">$299</p>
              <p className="text-xs text-gray-400">/ year</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-600 mb-5">
            {FEATURES.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>

          {l?.is_featured ? (
            <div className="text-sm text-brand-green font-medium text-center py-2">
              ✓ You&apos;re on the Featured plan
            </div>
          ) : !l ? (
            <div className="text-sm text-gray-400 text-center py-2">
              Add a listing first to upgrade.
            </div>
          ) : paypalReady ? (
            <PayPalButton
              listingId={l.id}
              monthlyPlanId={PAYPAL_MONTHLY_PLAN_ID}
              annualPlanId={PAYPAL_ANNUAL_PLAN_ID}
              clientId={PAYPAL_CLIENT_ID}
              userEmail={user.email ?? ""}
            />
          ) : (
            <div className="mt-1">
              <div className="w-full text-center bg-amber-100 text-amber-800 font-medium py-3 rounded-xl text-sm">
                PayPal checkout coming soon
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Email <a href="mailto:hello@myconnecticutkids.com" className="text-brand-green hover:underline">hello@myconnecticutkids.com</a> to upgrade manually.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 max-w-sm">
        Subscriptions are managed through PayPal. Cancel any time from your PayPal account.
        Questions? Email <a href="mailto:hello@myconnecticutkids.com" className="text-brand-green hover:underline">hello@myconnecticutkids.com</a>.
      </p>
    </div>
  );
}
