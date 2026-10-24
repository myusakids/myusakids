import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedPosts, getBlogCategories } from "@/lib/blog-queries";
import { getStateConfig } from "@/lib/state-context";

export async function generateMetadata(): Promise<Metadata> {
  const { name, siteName } = getStateConfig();
  return {
    title: "Blog",
    description: `Tips, guides, and ideas for ${name} families — camps, activities, birthday ideas, seasonal fun, and more.`,
    openGraph: {
      title: `${siteName} Blog`,
      description: `Family guides and activity ideas for ${name} parents.`,
    },
  };
}

export const revalidate = 3600;

export default async function BlogPage() {
  const { name } = getStateConfig();
  const [posts, categories] = await Promise.all([
    getPublishedPosts(24),
    getBlogCategories(),
  ]);

  const [featured, ...rest] = posts;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Family Activity Blog
        </h1>
        <p className="text-gray-500 text-sm">
          Tips, guides, and ideas for {name} families.
        </p>
      </div>

      {/* Category nav */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-green-light hover:text-brand-green-dark transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">✍️</div>
          <p className="text-gray-500 text-sm">Coming soon — family guides and activity ideas.</p>
        </div>
      )}

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="block mb-10 group"
        >
          <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-brand-green-light mb-4">
            {featured.featured_image ? (
              <Image
                src={featured.featured_image}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 960px"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-5xl">📖</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {featured.categories.map((cat) => (
              <span key={cat.slug} className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-green-light text-brand-green-dark">
                {cat.name}
              </span>
            ))}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-brand-green transition-colors mb-1">
            {featured.title}
          </h2>
          {featured.excerpt && (
            <p className="text-gray-500 text-sm line-clamp-2">{featured.excerpt}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {featured.author_name} · {formatDate(featured.published_at ?? featured.created_at)}
          </p>
        </Link>
      )}

      {/* Post grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
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
              {post.categories.length > 0 && (
                <span className="text-xs font-medium text-brand-green mb-1">
                  {post.categories[0].name}
                </span>
              )}
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-green transition-colors mb-1 line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {formatDate(post.published_at ?? post.created_at)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
