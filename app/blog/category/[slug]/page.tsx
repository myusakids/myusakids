import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPostsByCategory, getBlogCategoryBySlug, getBlogCategories } from "@/lib/blog-queries";
import { getStateConfig } from "@/lib/state-context";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getBlogCategoryBySlug(params.slug);
  if (!cat) return {};
  const { name, siteName } = getStateConfig();
  return {
    title: `${cat.name} | ${siteName} Blog`,
    description: `Read our ${cat.name.toLowerCase()} guides and tips for ${name} families.`,
    alternates: { canonical: `/blog/category/${cat.slug}` },
  };
}

export const revalidate = 3600;

export default async function BlogCategoryPage({ params }: Props) {
  const [category, allCategories] = await Promise.all([
    getBlogCategoryBySlug(params.slug),
    getBlogCategories(),
  ]);
  if (!category) notFound();

  const posts = await getPostsByCategory(params.slug);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-4">
        <Link href="/blog" className="hover:text-brand-green">Blog</Link>
        {" → "}
        {category.name}
      </p>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
      <p className="text-gray-500 text-sm mb-8">
        {posts.length} article{posts.length !== 1 ? "s" : ""}
      </p>

      {/* Other categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allCategories
          .filter((c) => c.slug !== params.slug)
          .map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-green-light hover:text-brand-green-dark transition-colors"
            >
              {cat.name}
            </Link>
          ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">✍️</div>
          <p className="text-gray-500 text-sm">No posts yet in this category.</p>
          <Link href="/blog" className="mt-4 inline-block text-sm text-brand-green hover:underline">
            ← All posts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-brand-green-light mb-3 shrink-0">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-3xl">📖</div>
                )}
              </div>
              <h2 className="text-sm font-semibold text-gray-900 group-hover:text-brand-green transition-colors mb-1 line-clamp-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-xs text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
