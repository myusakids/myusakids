"use client";

import { useState } from "react";
import type { Category, Town } from "@/lib/types";

interface FormData {
  title: string;
  town: string;
  selectedCategories: string[];
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_free: boolean;
  cost: string;
  age_min: string;
  age_max: string;
  description: string;
  address: string;
  is_recurring: boolean;
  recurrence_rule: string;
  email: string;
  listing_name: string;
}

const initial: FormData = {
  title: "",
  town: "",
  selectedCategories: [],
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  is_free: true,
  cost: "",
  age_min: "",
  age_max: "",
  description: "",
  address: "",
  is_recurring: false,
  recurrence_rule: "",
  email: "",
  listing_name: "",
};

interface Props {
  categories: Category[];
  towns: Town[];
}

export default function EventSubmitForm({ categories, towns }: Props) {
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);

  function patch(updates: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function toggleCat(slug: string) {
    patch({
      selectedCategories: form.selectedCategories.includes(slug)
        ? form.selectedCategories.filter((s) => s !== slug)
        : [...form.selectedCategories, slug],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Event submission:", form);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Event submitted!</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Thanks! We&apos;ll review your event within 1 business day and email you when it goes live.
        </p>
        <a
          href="/events"
          className="inline-block bg-brand-green text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-green-mid transition-colors text-sm"
        >
          View events calendar →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Basic info ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Event details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Spring Family Fun Run"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Town <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={form.town}
            onChange={(e) => patch({ town: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green text-gray-700"
          >
            <option value="">Select a town…</option>
            {towns.map((t) => (
              <option key={t.slug} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const selected = form.selectedCategories.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggleCat(cat.slug)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${
                    selected
                      ? "border-brand-green bg-brand-green-light text-brand-green-dark"
                      : "border-gray-200 text-gray-600 hover:border-brand-green"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Date & time ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date & time</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => patch({ start_date: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => patch({ end_date: e.target.value })}
              min={form.start_date}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => patch({ start_time: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => patch({ end_time: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        {/* Recurring */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => patch({ is_recurring: !form.is_recurring })}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                form.is_recurring ? "bg-brand-green" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_recurring ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">This is a recurring event</span>
          </label>

          {form.is_recurring && (
            <select
              value={form.recurrence_rule}
              onChange={(e) => patch({ recurrence_rule: e.target.value })}
              className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green text-gray-700"
            >
              <option value="">Select recurrence…</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every two weeks</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom (describe in description)</option>
            </select>
          )}
        </div>
      </section>

      {/* ── Cost & ages ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cost & ages</h2>

        <div>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <div
              onClick={() => patch({ is_free: !form.is_free, cost: "" })}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                form.is_free ? "bg-brand-green" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_free ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Free event</span>
          </label>

          {!form.is_free && (
            <input
              type="text"
              value={form.cost}
              onChange={(e) => patch({ cost: e.target.value })}
              placeholder='e.g. "$10/child, $25/family"'
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age range <span className="text-gray-400 font-normal">(optional — leave blank for all ages)</span>
          </label>
          <div className="flex items-center gap-3">
            <select
              value={form.age_min}
              onChange={(e) => patch({ age_min: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-green text-gray-700"
            >
              <option value="">Min age</option>
              {Array.from({ length: 19 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n === 0 ? "0 (infant)" : n}</option>
              ))}
            </select>
            <span className="text-gray-400 text-sm shrink-0">to</span>
            <select
              value={form.age_max}
              onChange={(e) => patch({ age_max: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-green text-gray-700"
            >
              <option value="">Max age</option>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n === 18 ? "18+" : n}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Description & location ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description & location</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => patch({ description: e.target.value.slice(0, 500) })}
            placeholder="What is this event? What will families experience? Who is it for?"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address / location</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => patch({ address: e.target.value })}
            placeholder="123 Main St, Hartford, CT 06103 (or park/venue name)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link to existing listing <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.listing_name}
            onChange={(e) => patch({ listing_name: e.target.value })}
            placeholder="Business name (e.g. Sonny's Place)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
          />
          <p className="text-xs text-gray-400 mt-1">
            If this event is hosted by a business already listed on MyConnecticutKids, enter the name and we&apos;ll link them.
          </p>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
          />
          <p className="text-xs text-gray-400 mt-1">
            We&apos;ll email you when your event is approved. Not displayed publicly.
          </p>
        </div>
      </section>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={!form.title || !form.town || !form.start_date || !form.email || form.description.length < 20}
        className="w-full bg-brand-green text-white font-medium py-3.5 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        Submit event →
      </button>
    </form>
  );
}
