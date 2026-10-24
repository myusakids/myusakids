import type { Metadata } from "next";
import { getBlogCategories } from "@/lib/blog-queries";
import BlogPostForm from "../BlogPostForm";

export const metadata: Metadata = { title: "New Blog Post" };

export default async function NewBlogPostPage() {
  const categories = await getBlogCategories();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">New Blog Post</h2>
      <BlogPostForm categories={categories} />
    </div>
  );
}
