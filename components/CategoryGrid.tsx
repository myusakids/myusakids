import Link from "next/link";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categories/${cat.slug}`}
          className="group flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-green hover:shadow-sm transition-all text-center"
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="text-sm font-medium text-gray-800 group-hover:text-brand-green transition-colors leading-tight">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
