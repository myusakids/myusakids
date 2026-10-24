"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { updateListingStatus } from "@/lib/actions";
import type { Listing } from "@/lib/types";

type Tab = "all" | "pending" | "approved" | "rejected";

interface ListingRow extends Listing {
  listing_categories: { categories: { name: string; slug: string; icon: string } | null }[];
}

interface Props {
  listings: ListingRow[];
  initialStatus: Tab;
}

export default function ListingsAdminClient({ listings, initialStatus }: Props) {
  const [tab, setTab] = useState<Tab>(initialStatus);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const filtered = tab === "all" ? listings : listings.filter((l) => l.status === tab);

  const counts = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      await updateListingStatus(id, status);
      toast(status === "approved" ? "Listing approved!" : "Listing rejected");
      router.refresh();
    });
  }

  async function bulkAction(status: "approved" | "rejected") {
    startTransition(async () => {
      await Promise.all(Array.from(selected).map((id) => updateListingStatus(id, status)));
      toast(`${selected.size} listing${selected.size > 1 ? "s" : ""} ${status}`);
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
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-100 pb-0">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setSelected(new Set()); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.value
                ? "bg-brand-green text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 bg-brand-green-light border border-brand-green/20 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-brand-green-dark">{selected.size} selected</span>
          <button
            onClick={() => bulkAction("approved")}
            disabled={isPending}
            className="text-sm bg-brand-green text-white px-3 py-1 rounded-lg hover:bg-brand-green-mid transition-colors disabled:opacity-40"
          >
            Approve all
          </button>
          <button
            onClick={() => bulkAction("rejected")}
            disabled={isPending}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            Reject all
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
            Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No {tab === "all" ? "" : tab} listings.</p>
      ) : (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Town</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((listing) => {
                const cat = listing.listing_categories?.[0]?.categories;
                const isExpanded = expanded === listing.id;
                return (
                  <>
                    <tr
                      key={listing.id}
                      className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? "bg-gray-50" : ""}`}
                      onClick={() => setExpanded(isExpanded ? null : listing.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(listing.id)}
                          onChange={() => toggleSelect(listing.id)}
                          className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{listing.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{listing.town}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                        {cat ? `${cat.icon} ${cat.name}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-end flex-nowrap">
                          {listing.status !== "approved" && (
                            <button
                              onClick={() => handleAction(listing.id, "approved")}
                              disabled={isPending}
                              className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-200 transition-colors font-medium disabled:opacity-40"
                            >
                              Approve
                            </button>
                          )}
                          {listing.status !== "rejected" && (
                            <button
                              onClick={() => handleAction(listing.id, "rejected")}
                              disabled={isPending}
                              className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-40"
                            >
                              Reject
                            </button>
                          )}
                          <Link
                            href={`/listings/${listing.slug}`}
                            target="_blank"
                            className="text-xs text-gray-400 hover:text-brand-green"
                          >
                            View ↗
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded inline preview */}
                    {isExpanded && (
                      <tr key={`${listing.id}-expanded`} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1.5">
                              {listing.description && (
                                <div><span className="text-gray-400 text-xs">Description</span><p className="text-gray-700 mt-0.5">{listing.description}</p></div>
                              )}
                              {listing.email && (
                                <div><span className="text-gray-400 text-xs">Email</span><p className="text-gray-700">{listing.email}</p></div>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              {listing.phone && (
                                <div><span className="text-gray-400 text-xs">Phone</span><p className="text-gray-700">{listing.phone}</p></div>
                              )}
                              {listing.website && (
                                <div><span className="text-gray-400 text-xs">Website</span><a href={listing.website} target="_blank" className="text-brand-green hover:underline" rel="noreferrer">{listing.website}</a></div>
                              )}
                              {listing.address && (
                                <div><span className="text-gray-400 text-xs">Address</span><p className="text-gray-700">{listing.address}</p></div>
                              )}
                              <div><span className="text-gray-400 text-xs">Plan</span><p className="text-gray-700">{listing.is_featured ? "⭐ Featured" : "Free"}</p></div>
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
