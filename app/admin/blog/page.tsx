import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Blog Admin" };

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;
  const { data: posts } = await admin
    .from("blog_posts")
    .select("id, title, slug, status, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Blog Posts</h2>
        <Link
          href="/admin/blog/new"
          className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-green-mid transition-colors"
        >
          + New post
        </Link>
      </div>

      {(!posts || posts.length === 0) ? (
        <div className="text-center py-12 text-gray-400 text-sm">No posts yet.</div>
      ) : (
        <div className="space-y-2">
          {posts.map((post: { id: string; title: string; slug: string; status: string; published_at: string | null; created_at: string }) => (
            <div key={post.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-400">
                  /blog/{post.slug} · {post.status === "published"
                    ? `Published ${formatDate(post.published_at ?? post.created_at)}`
                    : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  post.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {post.status}
                </span>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="text-xs text-brand-green hover:underline"
                >
                  Edit
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
