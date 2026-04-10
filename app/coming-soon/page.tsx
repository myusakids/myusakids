import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coming Soon" };

export default function ComingSoonPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h1>
      <p className="text-gray-500 max-w-sm">
        This feature is under construction. Check back soon — we&apos;re building it now!
      </p>
      <Link
        href="/"
        className="mt-6 inline-block bg-brand-green text-white font-medium px-5 py-2.5 rounded-xl hover:bg-brand-green-mid transition-colors text-sm"
      >
        ← Back to home
      </Link>
    </div>
  );
}
