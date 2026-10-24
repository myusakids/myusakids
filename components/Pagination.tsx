import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
  className,
}: Props) {
  if (totalPages <= 1) return null;

  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;
  const pages = pageWindow(currentPage, totalPages);

  return (
    <nav
      className={`flex items-center justify-center gap-1 flex-wrap mt-8 ${className ?? ""}`}
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={buildHref(basePath, prev, searchParams)}
          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          rel="prev"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-gray-300 rounded-lg border border-gray-100 cursor-not-allowed">
          ← Previous
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className="px-3 py-2 text-sm font-medium text-white bg-brand-green rounded-lg"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, searchParams)}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          >
            {p}
          </Link>
        )
      )}

      {next ? (
        <Link
          href={buildHref(basePath, next, searchParams)}
          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          rel="next"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-gray-300 rounded-lg border border-gray-100 cursor-not-allowed">
          Next →
        </span>
      )}
    </nav>
  );
}
