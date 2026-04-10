import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        We couldn&apos;t find what you were looking for. It may have moved or the URL might be wrong.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-brand-green text-white font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors text-sm"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:border-brand-green hover:text-brand-green transition-colors text-sm"
        >
          Browse listings
        </Link>
      </div>
    </div>
  );
}
