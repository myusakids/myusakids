"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Town } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { saveOwnerEvent } from "@/lib/actions";

interface FormState {
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
}

interface Props {
  categories: Category[];
  towns: Town[];
  initialValues?: Partial<FormState>;
  eventId?: string;
}

function initial(overrides?: Partial<FormState>): FormState {
  return {
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
    ...overrides,
  };
}

export default function EventForm({ categories, towns, initialValues, eventId }: Props) {
  const [form, setForm] = useState<FormState>(initial(initialValues));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  function patch(updates: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function toggleCat(slug: string) {
    patch({
      selectedCategories: form.selectedCategories.includes(slug)
        ? form.selectedCategories.filter((s) => s !== slug)
        : [...form.selectedCategories, slug],
    });
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await saveOwnerEvent(form, eventId);
    setSaving(false);

    if (error) {
      toast(error, "error");
    } else {
      toast(eventId ? "Event updated! Pending re-review." : "Event submitted for review!");
      router.push("/dashboard/events");
    }
  }

  const canSave = form.title && form.town && form.start_date && form.description.length >= 20;

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Event details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event title <span className="text-red-400">*</span></label>
          <input type="text" value={form.title} onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Spring Family Fun Run"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Town <span className="text-red-400">*</span></label>
          <select value={form.town} onChange={(e) => patch({ town: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green text-gray-700">
            <option value="">Select a town…</option>
            {towns.map((t) => <option key={t.slug} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const selected = form.selectedCategories.includes(cat.slug);
              return (
                <button key={cat.slug} type="button" onClick={() => toggleCat(cat.slug)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${
                    selected ? "border-brand-green bg-brand-green-light text-brand-green-dark" : "border-gray-200 text-gray-600 hover:border-brand-green"
                  }`}>
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Date & time */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date & time</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start date <span className="text-red-400">*</span></label>
            <input type="date" value={form.start_date} onChange={(e) => patch({ start_date: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End date <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="date" value={form.end_date} onChange={(e) => patch({ end_date: e.target.value })}
              min={form.start_date}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
            <input type="time" value={form.start_time} onChange={(e) => patch({ start_time: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
            <input type="time" value={form.end_time} onChange={(e) => patch({ end_time: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>
        </div>
      </section>

      {/* Cost & ages */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cost & ages</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => patch({ is_free: !form.is_free, cost: "" })}
            className={`relative w-10 h-6 rounded-full transition-colors ${form.is_free ? "bg-brand-green" : "bg-gray-200"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_free ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Free event</span>
        </label>
        {!form.is_free && (
          <input type="text" value={form.cost} onChange={(e) => patch({ cost: e.target.value })}
            placeholder='e.g. "$10/child, $25/family"'
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
        )}
        <div className="flex items-center gap-3">
          <input type="number" value={form.age_min} onChange={(e) => patch({ age_min: e.target.value })}
            placeholder="Min age" min={0} max={99}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="number" value={form.age_max} onChange={(e) => patch({ age_max: e.target.value })}
            placeholder="Max age" min={0} max={99}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
        </div>
      </section>

      {/* Description & location */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description & location</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-400">*</span></label>
          <textarea rows={5} value={form.description} onChange={(e) => patch({ description: e.target.value.slice(0, 500) })}
            placeholder="What will families experience? Who is it for?"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green resize-none" />
          <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address / location</label>
          <input type="text" value={form.address} onChange={(e) => patch({ address: e.target.value })}
            placeholder="123 Main St, Hartford, CT"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
        </div>
      </section>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.push("/dashboard/events")}
          className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:border-gray-300 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={saving || !canSave}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "Saving…" : (eventId ? "Save changes" : "Submit for review →")}
        </button>
      </div>
    </div>
  );
}
