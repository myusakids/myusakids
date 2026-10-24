import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getStateConfig } from "@/lib/state-context";

/**
 * POST /api/blog/publish
 * Secured with BLOG_API_KEY header or ?api_key= query param.
 *
 * Body (JSON):
 *   title          string  required
 *   slug           string  required
 *   body           string  required  (HTML)
 *   excerpt?       string
 *   meta_title?    string
 *   meta_description? string
 *   featured_image? string  (URL)
 *   author_name?   string
 *   categories?    string[]  (slugs)
 *   keywords?      string[]
 *   status?        "published" | "draft"  (default: "published")
 */
export async function POST(req: NextRequest) {
  // Auth check
  const apiKey = process.env.BLOG_API_KEY;
  const incoming =
    req.headers.get("x-api-key") ??
    req.nextUrl.searchParams.get("api_key");

  if (!apiKey || incoming !== apiKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { title, slug, body: postBody, excerpt, meta_title, meta_description, featured_image, author_name, categories: categorySlugs, keywords, status } = body as {
    title?: string;
    slug?: string;
    body?: string;
    excerpt?: string;
    meta_title?: string;
    meta_description?: string;
    featured_image?: string;
    author_name?: string;
    categories?: string[];
    keywords?: string[];
    status?: string;
  };

  if (!title || !slug || !postBody) {
    return NextResponse.json({ error: "title, slug, and body are required" }, { status: 400 });
  }

  const postStatus = status ?? "published";
  const state = getStateConfig();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;

  // Upsert post.
  // Note: onConflict uses "slug" alone — a (state, slug) composite unique
  // constraint should be added before launching a second state to avoid
  // cross-state slug collisions overwriting posts.
  const { data: post, error: postErr } = await admin
    .from("blog_posts")
    .upsert(
      {
        title,
        slug,
        body: postBody,
        excerpt: excerpt ?? null,
        meta_title: meta_title ?? null,
        meta_description: meta_description ?? null,
        featured_image: featured_image ?? null,
        author_name: author_name ?? `${state.siteName} Team`,
        status: postStatus,
        state: state.abbr,
        published_at: postStatus === "published" ? new Date().toISOString() : null,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (postErr) {
    return NextResponse.json({ error: postErr.message }, { status: 500 });
  }

  const postId = post.id as string;

  // Sync categories by slug
  if (categorySlugs && categorySlugs.length > 0) {
    const { data: cats } = await admin
      .from("blog_categories")
      .select("id")
      .in("slug", categorySlugs);

    if (cats && cats.length > 0) {
      await admin.from("blog_post_categories").delete().eq("post_id", postId);
      await admin.from("blog_post_categories").insert(
        cats.map((c: { id: string }) => ({ post_id: postId, category_id: c.id }))
      );
    }
  }

  // Sync keywords
  if (keywords && keywords.length > 0) {
    await admin.from("blog_post_keywords").delete().eq("post_id", postId);
    await admin.from("blog_post_keywords").insert(
      keywords.map((keyword: string) => ({ post_id: postId, keyword }))
    );
  }

  return NextResponse.json({ ok: true, id: postId, slug, status: postStatus });
}
