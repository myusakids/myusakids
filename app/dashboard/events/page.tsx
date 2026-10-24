import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import StatusBadge from "@/components/StatusBadge";
import { formatEventDate } from "@/lib/date-utils";
import type { Event } from "@/lib/types";
import DashboardEventActions from "./DashboardEventActions";

export const metadata: Metadata = { title: "My events — Dashboard" };

export default async function DashboardEventsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("owner_id", user.id)
    .order("start_date", { ascending: false });

  const rows = (events ?? []) as Event[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">My events</h1>
        <Link
          href="/dashboard/events/new"
          className="bg-brand-green text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors"
        >
          + Add new event
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm text-gray-500 mb-4">You haven&apos;t submitted any events yet.</p>
          <Link
            href="/dashboard/events/new"
            className="inline-block bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors"
          >
            Add your first event →
          </Link>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-gray-500">{formatEventDate(event.start_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={event.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <DashboardEventActions eventId={event.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
