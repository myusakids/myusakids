import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getStateConfig } from "@/lib/state-context";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/listings", label: "Listings", icon: "📋" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/blog", label: "Blog", icon: "✍️" },
  { href: "/admin/ads", label: "Ad Slots", icon: "📢" },
  { href: "/admin/discover", label: "Discover", icon: "🔍" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServer();
  const { siteName } = getStateConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🔧</span>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin</h1>
          <p className="text-xs text-gray-400">{siteName} — site management</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-brand-green-light hover:text-brand-green-dark transition-colors"
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
