import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog-queries";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getStateConfig } from "@/lib/state-context";
import AdSlot from "@/components/AdSlot";

interface Props {
  params: { slug: string };
}

// Multi-tenant: blog post slugs are per-state; skip pre-rendering and
// let each host render on-demand (cached via `revalidate`).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? "",
    openGraph: {
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? post.excerpt ?? "",
      images: post.featured_image ? [{ url: post.featured_image }] : [],
      type: "article",
    },
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.keywords,
  };
}

export const revalidate = 3600;

export default async function BlogPostPage({ params }: Props) {
  const { abbr, siteName } = getStateConfig();
  const [post, related] = await Promise.all([
    getPostBySlug(params.slug),
    getPublishedPosts(4),
  ]);
  if (!post) notFound();

  // Fetch active ad slots (server side, not gated by user session)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createSupabaseAdmin() as any;
  const { data: adSlots } = await admin
    .from("ad_slots")
    .select("name, code, ad_type")
    .eq("is_active", true)
    .eq("state", abbr);

  const adMap: Record<string, string> = {};
  for (const slot of adSlots ?? []) {
    adMap[slot.name] = slot.code ?? "";
  }

  const relatedPosts = related.filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? "",
    author: { "@type": "Organization", name: post.author_name },
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    image: post.featured_image ?? undefined,
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: "/icon.png" },
    },
    keywords: post.keywords.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* ── Main column ────────────────────────────────────────────────── */}
          <article className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <p className="text-xs text-gray-400 mb-4">
              <Link href="/blog" className="hover:text-brand-green">Blog</Link>
              {post.categories.length > 0 && (
                <>
                  {" → "}
                  <Link href={`/blog/category/${post.categories[0].slug}`} className="hover:text-brand-green">
                    {post.categories[0].name}
                  </Link>
                </>
              )}
              {" → "}
              {post.title}
            </p>

            {/* Category tags */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog/category/${cat.slug}`}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-green-light text-brand-green-dark hover:bg-brand-green hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {post.title}
            </h1>

            <p className="text-xs text-gray-400 mb-6">
              By {post.author_name} · {formatDate(post.published_at ?? post.created_at)}
            </p>

            {/* Featured image */}
            {post.featured_image && (
              <div className="relative w-full h-52 md:h-72 rounded-2xl overflow-hidden mb-6">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 700px"
                  priority
                />
              </div>
            )}

            {/* Body */}
            <div
              className="prose prose-sm md:prose-base max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            {/* Post bottom ad */}
            {adMap["blog_post_bottom"] && (
              <div className="mt-8">
                <AdSlot code={adMap["blog_post_bottom"]} />
              </div>
            )}

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-10">
                <h2 className="text-base font-semibold text-gray-900 mb-4">More from the blog</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-brand-green-light mb-2">
                        {p.featured_image ? (
                          <Image src={p.featured_image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="300px" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-2xl">📖</div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-brand-green transition-colors line-clamp-2">
                        {p.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-6">
            {adMap["blog_sidebar_top"] && (
              <AdSlot code={adMap["blog_sidebar_top"]} />
            )}

            {/* Category nav in sidebar */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Categories
              </h3>
              <div className="space-y-1">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog/category/${cat.slug}`}
                    className="block text-sm text-gray-600 hover:text-brand-green"
                  >
                    → {cat.name}
                  </Link>
                ))}
                <Link href="/blog" className="block text-sm text-gray-400 hover:text-brand-green mt-2">
                  ← All posts
                </Link>
              </div>
            </div>

            {adMap["blog_sidebar_bottom"] && (
              <AdSlot code={adMap["blog_sidebar_bottom"]} />
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
