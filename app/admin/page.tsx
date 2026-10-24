import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getStateConfig } from "@/lib/state-context";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = getStateConfig();
  return { title: `Admin — ${siteName}` };
}

export default async function AdminPage() {
  const supabase = createSupabaseServer();
  const { abbr } = getStateConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [
    { count: totalListings },
    { count: pendingListings },
    { count: totalEvents },
    { count: pendingEvents },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("state", abbr),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("state", abbr).eq("status", "pending"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("state", abbr),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("state", abbr).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total listings", value: totalListings ?? 0, href: "/admin/listings", urgent: false },
    { label: "Pending listings", value: pendingListings ?? 0, href: "/admin/listings?status=pending", urgent: (pendingListings ?? 0) > 0 },
    { label: "Total events", value: totalEvents ?? 0, href: "/admin/events", urgent: false },
    { label: "Pending events", value: pendingEvents ?? 0, href: "/admin/events?status=pending", urgent: (pendingEvents ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`border rounded-2xl p-5 hover:shadow-sm transition-shadow block ${
              s.urgent ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white"
            }`}
          >
            <p className={`text-3xl font-bold mb-1 ${s.urgent ? "text-amber-700" : "text-gray-900"}`}>
              {s.value}
            </p>
            <p className={`text-xs ${s.urgent ? "text-amber-600 font-medium" : "text-gray-400"}`}>
              {s.label}
              {s.urgent && " ⚠️"}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/listings?status=pending"
          className="border border-gray-100 rounded-2xl p-6 hover:border-brand-green transition-colors block"
        >
          <h2 className="font-semibold text-gray-900 mb-1">Review listings queue</h2>
          <p className="text-sm text-gray-500">
            {pendingListings ? `${pendingListings} listing${pendingListings > 1 ? "s" : ""} waiting for review` : "No pending listings"}
          </p>
        </Link>
        <Link
          href="/admin/events?status=pending"
          className="border border-gray-100 rounded-2xl p-6 hover:border-brand-green transition-colors block"
        >
          <h2 className="font-semibold text-gray-900 mb-1">Review events queue</h2>
          <p className="text-sm text-gray-500">
            {pendingEvents ? `${pendingEvents} event${pendingEvents > 1 ? "s" : ""} waiting for review` : "No pending events"}
          </p>
        </Link>
      </div>
    </div>
  );
}
