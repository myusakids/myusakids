import { supabase } from "./supabase";
import { getStateConfig } from "./state-context";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  meta_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  status: string;
  author_name: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories: BlogCategory[];
  keywords: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePost(row: any): BlogPost {
  const categories: BlogCategory[] = (row.blog_post_categories ?? [])
    .map((bpc: { blog_categories: BlogCategory | null }) => bpc.blog_categories)
    .filter(Boolean);

  const keywords: string[] = (row.blog_post_keywords ?? []).map(
    (k: { keyword: string }) => k.keyword
  );

  return { ...row, categories, keywords };
}

export async function getPublishedPosts(limit = 20): Promise<BlogPost[]> {
  const { abbr } = getStateConfig();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, featured_image, author_name, published_at, created_at, status,
      blog_post_categories ( blog_categories ( id, name, slug ) )
    `)
    .eq("status", "published")
    .eq("state", abbr)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => normalizePost({ ...r, body: "", meta_title: null, meta_description: null, updated_at: r.created_at, blog_post_keywords: [] }));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { abbr } = getStateConfig();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      blog_post_categories ( blog_categories ( id, name, slug ) ),
      blog_post_keywords ( keyword )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("state", abbr)
    .single();

  if (error || !data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return normalizePost(data as any);
}

export async function getPostsByCategory(categorySlug: string, limit = 20): Promise<BlogPost[]> {
  const { abbr } = getStateConfig();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, featured_image, author_name, published_at, created_at, status,
      blog_post_categories!inner ( blog_categories!inner ( id, name, slug ) )
    `)
    .eq("status", "published")
    .eq("state", abbr)
    .eq("blog_post_categories.blog_categories.slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => normalizePost({ ...r, body: "", meta_title: null, meta_description: null, updated_at: r.created_at, blog_post_keywords: [] }));
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");
  if (error) return [];
  return (data ?? []) as BlogCategory[];
}

export async function getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as BlogCategory;
}

export async function getAllPublishedPostSlugs(): Promise<string[]> {
  const { abbr } = getStateConfig();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .eq("state", abbr);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}
