"use client";

import { useState, useTransition } from "react";
import { saveBlogPost } from "@/lib/blog-actions";
import type { BlogCategory } from "@/lib/blog-queries";

interface InitialData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  status?: string;
  author_name?: string;
  keywords?: string[];
  categoryIds?: string[];
}

interface Props {
  initialData?: InitialData;
  categories: BlogCategory[];
}

export default function BlogPostForm({ initialData, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    body: initialData?.body ?? "",
    meta_title: initialData?.meta_title ?? "",
    meta_description: initialData?.meta_description ?? "",
    featured_image: initialData?.featured_image ?? "",
    author_name: initialData?.author_name ?? "MyConnecticutKids Team",
    postStatus: initialData?.status ?? "draft",
    keywords: (initialData?.keywords ?? []).join(", "),
    categoryIds: initialData?.categoryIds ?? [],
  });

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitle(val: string) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: initialData?.id ? f.slug : autoSlug(val),
    }));
  }

  function toggleCat(id: string) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const result = await saveBlogPost({
        id: initialData?.id,
        ...form,
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      });
      if (result.error) {
        setStatus(`Error: ${result.error}`);
      } else {
        setStatus(result.published ? "Published!" : "Saved as draft.");
        if (!initialData?.id && result.id) {
          window.location.href = `/admin/blog/${result.id}`;
        }
      }
    });
  }

  const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input className={inputCls} value={form.title} onChange={(e) => handleTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input className={inputCls} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
        </div>
      </div>

      <div>
        <label className={labelCls}>Excerpt (shown in listing cards)</label>
        <textarea className={inputCls} rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
      </div>

      <div>
        <label className={labelCls}>Body (HTML or Markdown) *</label>
        <textarea className={`${inputCls} font-mono text-xs`} rows={20} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} required />
        <p className="text-xs text-gray-400 mt-1">Paste HTML directly. Supports raw HTML from your AI writer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Featured image URL</label>
          <input className={inputCls} type="url" value={form.featured_image} onChange={(e) => setForm((f) => ({ ...f, featured_image: e.target.value }))} placeholder="https://..." />
        </div>
        <div>
          <label className={labelCls}>Author name</label>
          <input className={inputCls} value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Meta title (SEO)</label>
          <input className={inputCls} value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Meta description (SEO)</label>
          <input className={inputCls} value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Keywords (comma-separated)</label>
        <input className={inputCls} value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="kids camps, summer CT, ..." />
      </div>

      <div>
        <label className={labelCls}>Categories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCat(cat.id)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                form.categoryIds.includes(cat.id)
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-green"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
          value={form.postStatus}
          onChange={(e) => setForm((f) => ({ ...f, postStatus: e.target.value }))}
        >
          <option value="draft">Save as Draft</option>
          <option value="published">Publish</option>
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2 rounded-xl hover:bg-brand-green-mid transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save post"}
        </button>

        {status && (
          <span className={`text-sm ${status.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
            {status}
          </span>
        )}
      </div>
    </form>
  );
}
