"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-brand-green font-bold text-xl leading-none">
            MyConnecticut
            <span className="text-brand-green-dark">Kids</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/categories/camps"
            className="text-sm text-gray-600 hover:text-brand-green transition-colors"
          >
            Camps
          </Link>
          <Link
            href="/categories/classes"
            className="text-sm text-gray-600 hover:text-brand-green transition-colors"
          >
            Classes
          </Link>
          <Link
            href="/categories/things-to-do"
            className="text-sm text-gray-600 hover:text-brand-green transition-colors"
          >
            Things to Do
          </Link>
          <Link
            href="/events"
            className="text-sm text-gray-600 hover:text-brand-green transition-colors"
          >
            Events
          </Link>
          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-brand-green transition-colors"
          >
            Browse all
          </Link>
        </div>

        {/* Auth / CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/coming-soon"
            className="text-sm text-gray-600 hover:text-brand-green transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/submit"
            className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-green-mid transition-colors"
          >
            List your business →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          <Link href="/search" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>Browse all</Link>
          <Link href="/categories/camps" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>Camps</Link>
          <Link href="/categories/classes" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>Classes</Link>
          <Link href="/categories/things-to-do" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>Things to Do</Link>
          <Link href="/events" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>📅 Events</Link>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            <Link href="/coming-soon" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link
              href="/submit"
              className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg text-center"
              onClick={() => setMenuOpen(false)}
            >
              List your business →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
