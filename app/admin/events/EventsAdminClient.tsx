"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { updateEventStatus } from "@/lib/actions";
import type { Event } from "@/lib/types";
import { formatEventDate } from "@/lib/date-utils";

type Tab = "all" | "pending" | "approved" | "rejected";

interface EventRow extends Event {
  event_categories: { categories: { name: string; slug: string; icon: string } | null }[];
}

interface Props {
  events: EventRow[];
  initialStatus: Tab;
}

export default function EventsAdminClient({ events, initialStatus }: Props) {
  const [tab, setTab] = useState<Tab>(initialStatus);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const filtered = tab === "all" ? events : events.filter((e) => e.status === tab);

  const counts = {
    all: events.length,
    pending: events.filter((e) => e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      await updateEventStatus(id, status);
      toast(status === "approved" ? "Event approved!" : "Event rejected");
      router.refresh();
    });
  }

  async function bulkAction(status: "approved" | "rejected") {
    startTransition(async () => {
      await Promise.all(Array.from(selected).map((id) => updateEventStatus(id, status)));
      toast(`${selected.size} event${selected.size > 1 ? "s" : ""} ${status}`);
      setSelected(new Set());
      router.refresh();
    });
  }

  const TABS: { value: Tab; label: string }[] = [
    { value: "pending", label: `Pending (${counts.pending})` },
    { value: "approved", label: `Approved (${counts.approved})` },
    { value: "rejected", label: `Rejected (${counts.rejected})` },
    { value: "all", label: `All (${counts.all})` },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => { setTab(t.value); setSelected(new Set()); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.value ? "bg-brand-green text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 bg-brand-green-light border border-brand-green/20 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-brand-green-dark">{selected.size} selected</span>
          <button onClick={() => bulkAction("approved")} disabled={isPending}
            className="text-sm bg-brand-green text-white px-3 py-1 rounded-lg hover:bg-brand-green-mid transition-colors disabled:opacity-40">
            Approve all
          </button>
          <button onClick={() => bulkAction("rejected")} disabled={isPending}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40">
            Reject all
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Clear</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No {tab === "all" ? "" : tab} events.</p>
      ) : (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={() => selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map((e) => e.id)))}
                    className="rounded border-gray-300 text-brand-green" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Town</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((event) => {
                const cat = event.event_categories?.[0]?.categories;
                const isExpanded = expanded === event.id;
                return (
                  <>
                    <tr key={event.id}
                      className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? "bg-gray-50" : ""}`}
                      onClick={() => setExpanded(isExpanded ? null : event.id)}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(event.id)} onChange={() => toggleSelect(event.id)}
                          className="rounded border-gray-300 text-brand-green" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {event.title}
                        {cat && <span className="ml-2 text-xs text-gray-400">{cat.icon}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{event.town}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatEventDate(event.start_date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={event.status} /></td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-end">
                          {event.status !== "approved" && (
                            <button onClick={() => handleAction(event.id, "approved")} disabled={isPending}
                              className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-200 font-medium disabled:opacity-40">
                              Approve
                            </button>
                          )}
                          {event.status !== "rejected" && (
                            <button onClick={() => handleAction(event.id, "rejected")} disabled={isPending}
                              className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-200 font-medium disabled:opacity-40">
                              Reject
                            </button>
                          )}
                          <Link href={`/events/${event.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-brand-green">View ↗</Link>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${event.id}-expanded`} className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="text-sm space-y-2">
                            {event.description && <p className="text-gray-700">{event.description}</p>}
                            <div className="flex gap-6 text-xs text-gray-400 flex-wrap">
                              {event.address && <span>📍 {event.address}</span>}
                              {event.is_free ? <span>✓ Free</span> : <span>💰 {event.cost}</span>}
                              {(event.age_min || event.age_max) && (
                                <span>Ages {event.age_min ?? "any"}–{event.age_max ?? "any"}</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
