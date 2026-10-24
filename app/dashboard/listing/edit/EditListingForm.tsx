"use client";

import { useState } from "react";
import HoursEditor, { type DayHours } from "@/components/HoursEditor";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/components/Toast";
import { updateListing } from "@/lib/actions";
import type { ListingImage } from "@/lib/types";

interface FormState {
  name: string;
  description: string;
  town: string;
  address: string;
  phone: string;
  website: string;
  age_min: string;
  age_max: string;
  hours: DayHours[];
}

interface Props {
  listingId: string;
  initialForm: FormState;
  initialImages: ListingImage[];
}

export default function EditListingForm({ listingId, initialForm, initialImages }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<ListingImage[]>(initialImages);
  const [saving, setSaving] = useState(false);

  function patch(updates: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateListing({ listingId, ...form });
    setSaving(false);
    if (error) {
      toast(error, "error");
    } else {
      toast("Listing saved!");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit listing</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Town</label>
            <input
              type="text"
              value={form.town}
              onChange={(e) => patch({ town: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value.slice(0, 300) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/300</p>
          </div>
        </section>

        {/* Contact & location */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact & location</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={form.website} onChange={(e) => patch({ website: e.target.value })}
              placeholder="https://yoursite.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => patch({ phone: e.target.value })}
              placeholder="(860) 555-1234"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={form.address} onChange={(e) => patch({ address: e.target.value })}
              placeholder="123 Main St, Hartford, CT 06103"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age range</label>
            <div className="flex items-center gap-3">
              <input type="number" value={form.age_min} onChange={(e) => patch({ age_min: e.target.value })}
                placeholder="Min" min={0} max={99}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="number" value={form.age_max} onChange={(e) => patch({ age_max: e.target.value })}
                placeholder="Max" min={0} max={99}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
            </div>
          </div>
        </section>

        {/* Hours */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Hours</h2>
          <HoursEditor value={form.hours} onChange={(hours) => patch({ hours })} />
        </section>

        {/* Photos */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Photos</h2>
          <ImageUploader
            listingId={listingId}
            initialImages={images}
            onSaved={setImages}
          />
        </section>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-green text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
