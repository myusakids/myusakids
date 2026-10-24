"use server";

import { createSupabaseAdmin } from "./supabase-admin";

interface SaveBlogPostInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  author_name: string;
  postStatus: string;
  keywords: string[];
  categoryIds: string[];
}

export async function saveBlogPost(input: SaveBlogPostInput): Promise<{
  id?: string;
  published?: boolean;
  error?: string;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;

    const payload = {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      body: input.body,
      meta_title: input.meta_title || null,
      meta_description: input.meta_description || null,
      featured_image: input.featured_image || null,
      author_name: input.author_name,
      status: input.postStatus,
      published_at:
        input.postStatus === "published"
          ? new Date().toISOString()
          : null,
    };

    let postId = input.id;

    if (input.id) {
      await admin.from("blog_posts").update(payload).eq("id", input.id);
    } else {
      const { data, error } = await admin
        .from("blog_posts")
        .insert(payload)
        .select("id")
        .single();
      if (error) return { error: error.message };
      postId = data.id;
    }

    if (!postId) return { error: "No post ID" };

    // Sync categories
    await admin.from("blog_post_categories").delete().eq("post_id", postId);
    if (input.categoryIds.length > 0) {
      await admin.from("blog_post_categories").insert(
        input.categoryIds.map((category_id) => ({ post_id: postId, category_id }))
      );
    }

    // Sync keywords
    await admin.from("blog_post_keywords").delete().eq("post_id", postId);
    if (input.keywords.length > 0) {
      await admin.from("blog_post_keywords").insert(
        input.keywords.map((keyword) => ({ post_id: postId, keyword }))
      );
    }

    return { id: postId, published: input.postStatus === "published" };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteBlogPost(id: string): Promise<{ error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createSupabaseAdmin() as any;
    await admin.from("blog_posts").delete().eq("id", id);
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}
