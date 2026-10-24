"use client";

import { useState, useTransition } from "react";
import { importBusiness } from "@/lib/discover-actions";
import type { Category, Town } from "@/lib/types";

interface DiscoveredHour {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

interface Business {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  description: string | null;
  age_min: number | null;
  age_max: number | null;
  cost_description: string | null;
  is_free: boolean;
  facebook_url: string | null;
  instagram_url: string | null;
  hours: DiscoveredHour[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmt(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

interface Props {
  categories: Category[];
  towns: Town[];
}

export default function DiscoverClient({ categories, towns }: Props) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [townName, setTownName] = useState(towns[0]?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [cardStatus, setCardStatus] = useState<Record<number, "importing" | "done" | "error">>({});
  const [cardErrors, setCardErrors] = useState<Record<number, string>>({});
  const [, startTransition] = useTransition();

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const allDone = businesses.length > 0 && dismissed.size === businesses.length;

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setBusinesses([]);
    setDismissed(new Set());
    setImported(0);
    setSkipped(0);
    setCardStatus({});
    setCardErrors({});

    try {
      const res = await fetch("/api/admin/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory?.name, town: townName }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Unknown error");
      } else {
        setBusinesses(json.businesses ?? []);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function skip(idx: number) {
    setDismissed((prev) => { const next = new Set(prev); next.add(idx); return next; });
    setSkipped((n) => n + 1);
  }

  function handleImport(business: Business, idx: number) {
    setCardStatus((prev) => ({ ...prev, [idx]: "importing" }));
    startTransition(async () => {
      const result = await importBusiness(business, townName, categoryId);
      if (result.error) {
        setCardStatus((prev) => ({ ...prev, [idx]: "error" }));
        setCardErrors((prev) => ({ ...prev, [idx]: result.error! }));
      } else {
        setCardStatus((prev) => ({ ...prev, [idx]: "done" }));
        setDismissed((prev) => { const next = new Set(prev); next.add(idx); return next; });
        setImported((n) => n + 1);
      }
    });
  }

  const selectCls = "text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-green bg-white";

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select className={selectCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Town</label>
          <select className={selectCls} value={townName} onChange={(e) => setTownName(e.target.value)}>
            {towns.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-50"
        >
          {loading ? "Searching…" : "Find Businesses"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-8 text-gray-500 text-sm">
          <svg className="w-5 h-5 animate-spin text-brand-green" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Searching for <strong className="text-gray-700 mx-1">{selectedCategory?.name}</strong> businesses in <strong className="text-gray-700 mx-1">{townName}, CT</strong>…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Summary banner */}
      {allDone && (
        <div className="bg-brand-green-light border border-brand-green/20 text-brand-green-dark text-sm font-medium rounded-xl px-5 py-3 mb-6">
          Done — {imported} listing{imported !== 1 ? "s" : ""} imported, {skipped} skipped.
        </div>
      )}

      {/* Progress while working */}
      {businesses.length > 0 && !allDone && (
        <p className="text-xs text-gray-400 mb-4">
          {dismissed.size} of {businesses.length} processed · {imported} imported · {skipped} skipped
        </p>
      )}

      {/* Business cards */}
      <div className="space-y-4">
        {businesses.map((biz, idx) => {
          if (dismissed.has(idx)) return null;
          const status = cardStatus[idx];
          const openDays = biz.hours?.filter((h) => !h.is_closed) ?? [];

          return (
            <div key={idx} className="border border-gray-100 rounded-2xl p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{biz.name}</h3>
                  {biz.address && <p className="text-xs text-gray-400 mt-0.5">{biz.address}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {biz.website && (
                    <a href={biz.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-green hover:underline">
                      Website →
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              {biz.description && (
                <p className="text-xs text-gray-600 leading-relaxed">{biz.description}</p>
              )}

              {/* Info row */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {biz.phone && <span>📞 {biz.phone}</span>}
                {biz.email && <span>✉️ {biz.email}</span>}
                {(biz.age_min !== null || biz.age_max !== null) && (
                  <span>
                    👶 Ages {biz.age_min !== null && biz.age_max !== null
                      ? `${biz.age_min}–${biz.age_max}`
                      : biz.age_min !== null ? `${biz.age_min}+` : `up to ${biz.age_max}`}
                  </span>
                )}
                {biz.is_free
                  ? <span className="text-green-600 font-medium">Free</span>
                  : biz.cost_description
                  ? <span>💰 {biz.cost_description}</span>
                  : null}
                {biz.facebook_url && (
                  <a href={biz.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline">Facebook</a>
                )}
                {biz.instagram_url && (
                  <a href={biz.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="text-pink-500 hover:underline">Instagram</a>
                )}
              </div>

              {/* Hours summary */}
              {openDays.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {biz.hours?.map((h) => (
                    <span key={h.day_of_week}
                      className={`text-xs px-2 py-0.5 rounded-full ${h.is_closed ? "bg-gray-100 text-gray-400" : "bg-brand-green-light text-brand-green-dark"}`}>
                      {DAYS[h.day_of_week]}
                      {!h.is_closed && h.opens_at && ` ${fmt(h.opens_at)}–${fmt(h.closes_at)}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Error */}
              {status === "error" && cardErrors[idx] && (
                <p className="text-xs text-red-600">{cardErrors[idx]}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleImport(biz, idx)}
                  disabled={status === "importing"}
                  className="bg-brand-green text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-green-mid transition-colors disabled:opacity-50"
                >
                  {status === "importing" ? "Importing…" : "Import Listing"}
                </button>
                <button
                  onClick={() => skip(idx)}
                  disabled={status === "importing"}
                  className="bg-gray-100 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
