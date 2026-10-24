"use client";

import { useState } from "react";
import StepProgress from "@/components/StepProgress";
import HoursEditor, { defaultHours, type DayHours } from "@/components/HoursEditor";
import type { Category, Town } from "@/lib/types";
import { submitListing } from "@/lib/actions";

const STEPS = ["Business info", "Details", "Plan", "Review"];

interface FormData {
  name: string;
  selectedCategories: string[];
  town: string;
  age_min: string;
  age_max: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  hours: DayHours[];
  plan: "free" | "featured";
  email: string;
}

const initialForm: FormData = {
  name: "",
  selectedCategories: [],
  town: "",
  age_min: "",
  age_max: "",
  description: "",
  website: "",
  phone: "",
  address: "",
  hours: defaultHours(),
  plan: "free",
  email: "",
};

interface Props {
  categories: Category[];
  towns: Town[];
}

export default function SubmitForm({ categories, towns }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function patch(updates: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function toggleCategory(slug: string) {
    patch({
      selectedCategories: form.selectedCategories.includes(slug)
        ? form.selectedCategories.filter((s) => s !== slug)
        : [...form.selectedCategories, slug],
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");

    const { error, magicLinkSent: sent } = await submitListing(form);

    setSubmitting(false);
    if (error) {
      setSubmitError(error);
    } else {
      setMagicLinkSent(sent);
      setSubmitted(true);
    }
  }

  if (submitted) return <SuccessScreen email={form.email} magicLinkSent={magicLinkSent} />;

  return (
    <div>
      <div className="mb-8">
        <StepProgress steps={STEPS} currentStep={step} />
      </div>

      {/* ── Step 1: Business info ─────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Sonny's Place"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-400">*</span>{" "}
              <span className="text-gray-400 font-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const selected = form.selectedCategories.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${
                      selected
                        ? "border-brand-green bg-brand-green-light text-brand-green-dark"
                        : "border-gray-200 text-gray-600 hover:border-brand-green"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Town <span className="text-red-400">*</span>
            </label>
            <select
              value={form.town}
              onChange={(e) => patch({ town: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green text-gray-700"
            >
              <option value="">Select a town…</option>
              {towns.map((town) => (
                <option key={town.slug} value={town.name}>{town.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age range</label>
            <div className="flex items-center gap-3">
              <input type="number" value={form.age_min} onChange={(e) => patch({ age_min: e.target.value })}
                placeholder="Min age" min={0} max={99}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="number" value={form.age_max} onChange={(e) => patch({ age_max: e.target.value })}
                placeholder="Max age" min={0} max={99}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
            </div>
          </div>

          <StepNav step={step} total={STEPS.length} onNext={() => setStep(1)}
            nextDisabled={!form.name || !form.town || form.selectedCategories.length === 0} />
        </div>
      )}

      {/* ── Step 2: Details ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea value={form.description} onChange={(e) => patch({ description: e.target.value.slice(0, 300) })}
              rows={4} placeholder="Tell families what you offer, who it's for, and what makes you special…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green resize-none" />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/300</p>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
            <HoursEditor value={form.hours} onChange={(hours) => patch({ hours })} />
          </div>

          <StepNav step={step} total={STEPS.length} onBack={() => setStep(0)} onNext={() => setStep(2)}
            nextDisabled={form.description.length < 20} />
        </div>
      )}

      {/* ── Step 3: Plan ──────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Choose how you want your listing to appear.</p>

          {[
            { value: "free" as const, label: "Free listing", desc: "Listed in our directory. Shows up in search and category pages.", price: "$0/mo" },
            { value: "featured" as const, label: "Featured listing", desc: "Everything in Free, plus priority placement on homepage and category pages.", price: "$29/mo", badge: "⭐ Popular" },
          ].map((plan) => (
            <label key={plan.value}
              className={`block border-2 rounded-xl p-5 cursor-pointer transition-colors ${
                form.plan === plan.value ? "border-brand-green bg-brand-green-light" : "border-gray-200 hover:border-gray-300"
              }`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="plan" value={plan.value} checked={form.plan === plan.value}
                  onChange={() => patch({ plan: plan.value })}
                  className="mt-0.5 text-brand-green focus:ring-brand-green" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{plan.label}</p>
                    {plan.badge && <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">{plan.badge}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
                  <p className="text-lg font-bold text-brand-green mt-2">{plan.price}</p>
                </div>
              </div>
            </label>
          ))}

          <StepNav step={step} total={STEPS.length} onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      )}

      {/* ── Step 4: Review ────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="border border-gray-100 rounded-xl p-5 bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preview</p>
            <p className="font-medium text-gray-900 text-base">{form.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">📍 {form.town}, CT</p>
            {form.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{form.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {form.selectedCategories.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return cat ? (
                  <span key={slug} className="text-xs bg-brand-green-light text-brand-green-dark px-2 py-0.5 rounded-full">
                    {cat.icon} {cat.name}
                  </span>
                ) : null;
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Plan: <span className="font-medium text-gray-600">{form.plan === "featured" ? "⭐ Featured ($29/mo)" : "Free"}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your email <span className="text-red-400">*</span>
            </label>
            <input type="email" value={form.email} onChange={(e) => patch({ email: e.target.value })}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green" />
            <p className="text-xs text-gray-400 mt-1">We&apos;ll email you when your listing goes live. No spam, ever.</p>
          </div>

          {submitError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{submitError}</p>
          )}

          <StepNav step={step} total={STEPS.length} onBack={() => setStep(2)} onNext={handleSubmit}
            nextLabel={submitting ? "Submitting…" : "Submit listing →"}
            nextDisabled={!form.email || !form.email.includes("@") || submitting} />
        </div>
      )}
    </div>
  );
}

// ── Step navigation ───────────────────────────────────────────────────────────

interface StepNavProps {
  step: number;
  total: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

function StepNav({ step, onNext, onBack, nextLabel, nextDisabled }: StepNavProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      {onBack ? (
        <button type="button" onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          ← Back
        </button>
      ) : <div />}
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {nextLabel ?? (step < 3 ? "Continue →" : "Submit")}
        </button>
      )}
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ email, magicLinkSent }: { email: string; magicLinkSent: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re submitted!</h2>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
        Thanks for adding your business. We review listings within 1–2 business days.
      </p>

      {magicLinkSent && (
        <div className="bg-brand-green-light border border-brand-green/20 rounded-xl px-5 py-4 max-w-sm mx-auto mb-6 text-left">
          <p className="text-sm font-medium text-brand-green-dark">📬 Check your email</p>
          <p className="text-xs text-gray-600 mt-1">
            We sent a magic link to <strong>{email}</strong>. Click it to create your account and manage your listing.
          </p>
        </div>
      )}

      <a href="/" className="inline-block bg-brand-green text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-green-mid transition-colors text-sm">
        Back to home
      </a>
    </div>
  );
}
