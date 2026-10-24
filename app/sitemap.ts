import type { MetadataRoute } from "next";
import { getAllApprovedListingSlugs, getAllTownSlugs, getCategories } from "@/lib/queries";
import { getAllPublishedPostSlugs, getBlogCategories } from "@/lib/blog-queries";

const BASE = "https://myconnecticutkids.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingSlugs, townSlugs, categories, postSlugs, blogCategories] = await Promise.all([
    getAllApprovedListingSlugs().catch(() => [] as string[]),
    getAllTownSlugs().catch(() => [] as string[]),
    getCategories().catch(() => []),
    getAllPublishedPostSlugs().catch(() => [] as string[]),
    getBlogCategories().catch(() => []),
  ]);

  const now = new Date().toISOString();

  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/towns`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/events/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const listing_pages: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
    url: `${BASE}/listings/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const town_pages: MetadataRoute.Sitemap = townSlugs.map((slug) => ({
    url: `${BASE}/towns/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const category_pages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE}/categories/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blog_posts: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blog_categories: MetadataRoute.Sitemap = blogCategories.map((cat) => ({
    url: `${BASE}/blog/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...static_pages,
    ...listing_pages,
    ...town_pages,
    ...category_pages,
    ...blog_posts,
    ...blog_categories,
  ];
}
