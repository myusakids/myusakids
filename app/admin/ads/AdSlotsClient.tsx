"use client";

import { useState, useTransition } from "react";
import { saveAdSlot } from "@/lib/ad-actions";

interface AdSlot {
  id: string;
  name: string;
  label: string;
  ad_type: string;
  code: string | null;
  is_active: boolean;
}

interface Props {
  slots: AdSlot[];
}

export default function AdSlotsClient({ slots }: Props) {
  const [slotState, setSlotState] = useState<Record<string, { code: string; is_active: boolean }>>(
    Object.fromEntries(
      slots.map((s) => [s.id, { code: s.code ?? "", is_active: s.is_active }])
    )
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  function update(id: string, field: "code" | "is_active", value: string | boolean) {
    setSlotState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  function handleSave(slot: AdSlot) {
    setSaving(slot.id);
    startTransition(async () => {
      const result = await saveAdSlot({
        id: slot.id,
        code: slotState[slot.id]?.code ?? "",
        is_active: slotState[slot.id]?.is_active ?? false,
      });
      setSaving(null);
      setMessages((prev) => ({
        ...prev,
        [slot.id]: result.error ? `Error: ${result.error}` : "Saved!",
      }));
      setTimeout(() => setMessages((prev) => ({ ...prev, [slot.id]: "" })), 3000);
    });
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const state = slotState[slot.id];
        return (
          <div key={slot.id} className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                <p className="text-xs text-gray-400">{slot.name} · {slot.ad_type}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <span className="text-xs text-gray-500">Active</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={state?.is_active ?? false}
                    onChange={(e) => update(slot.id, "is_active", e.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${state?.is_active ? "bg-brand-green" : "bg-gray-200"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${state?.is_active ? "translate-x-5" : ""}`} />
                </div>
              </label>
            </div>

            <textarea
              className="w-full text-xs font-mono border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
              rows={4}
              placeholder={`Paste your ${slot.ad_type} embed code here…`}
              value={state?.code ?? ""}
              onChange={(e) => update(slot.id, "code", e.target.value)}
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => handleSave(slot)}
                disabled={saving === slot.id}
                className="bg-brand-green text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-brand-green-mid transition-colors disabled:opacity-50"
              >
                {saving === slot.id ? "Saving…" : "Save"}
              </button>
              {messages[slot.id] && (
                <span className={`text-xs ${messages[slot.id]?.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                  {messages[slot.id]}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
