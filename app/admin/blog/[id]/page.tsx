import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getBlogCategories } from "@/lib/blog-queries";
import { getStateConfig } from "@/lib/state-context";
import BlogPostForm from "../BlogPostForm";

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: "Edit Blog Post" };
export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: Props) {
  const { siteName, abbr } = getStateConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;

  const [{ data: post }, categories] = await Promise.all([
    admin
      .from("blog_posts")
      .select(`
        *,
        blog_post_categories ( category_id ),
        blog_post_keywords ( keyword )
      `)
      .eq("id", params.id)
      .eq("state", abbr)
      .single(),
    getBlogCategories(),
  ]);

  if (!post) notFound();

  const categoryIds = (post.blog_post_categories ?? []).map(
    (bpc: { category_id: string }) => bpc.category_id
  );
  const keywords = (post.blog_post_keywords ?? []).map(
    (k: { keyword: string }) => k.keyword
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Edit Blog Post</h2>
        <div className="flex gap-3">
          {post.status === "published" && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="text-sm text-brand-green hover:underline"
            >
              View post →
            </Link>
          )}
          <Link href="/admin/blog" className="text-sm text-gray-400 hover:text-gray-700">
            ← All posts
          </Link>
        </div>
      </div>

      <BlogPostForm
        categories={categories}
        defaultAuthorName={`${siteName} Team`}
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          body: post.body,
          meta_title: post.meta_title ?? "",
          meta_description: post.meta_description ?? "",
          featured_image: post.featured_image ?? "",
          status: post.status,
          author_name: post.author_name,
          keywords,
          categoryIds,
        }}
      />
    </div>
  );
}
