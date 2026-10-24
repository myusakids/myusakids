"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import UserMenu from "./UserMenu";
import type { Profile } from "@/lib/types";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabaseBrowser
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data as Profile | null);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data } = await supabaseBrowser
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(data as Profile | null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const dashboardHref = profile?.role === "admin" ? "/admin" : "/dashboard";
  const dashboardLabel = profile?.role === "admin" ? "Admin" : "My dashboard";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="MyConnecticutKids.com"
            width={240}
            height={70}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/categories/camps" className="text-sm text-gray-600 hover:text-brand-green transition-colors">
            Camps
          </Link>
          <Link href="/categories/classes" className="text-sm text-gray-600 hover:text-brand-green transition-colors">
            Classes
          </Link>
          <Link href="/categories/things-to-do" className="text-sm text-gray-600 hover:text-brand-green transition-colors">
            Things to Do
          </Link>
          <Link href="/events" className="text-sm text-gray-600 hover:text-brand-green transition-colors">
            Events
          </Link>
          <Link href="/search" className="text-sm text-gray-600 hover:text-brand-green transition-colors">
            Browse all
          </Link>
        </div>

        {/* Auth / CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!authLoading && (
            <>
              {profile ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="text-sm text-gray-600 hover:text-brand-green transition-colors"
                  >
                    {dashboardLabel}
                  </Link>
                  <UserMenu profile={profile} />
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-brand-green transition-colors">
                    Sign in
                  </Link>
                  <Link
                    href="/submit"
                    className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-green-mid transition-colors"
                  >
                    List your business →
                  </Link>
                </>
              )}
            </>
          )}
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
            {profile ? (
              <>
                <Link href={dashboardHref} className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>
                  {dashboardLabel}
                </Link>
                <button
                  onClick={async () => {
                    await supabaseBrowser.auth.signOut();
                    setMenuOpen(false);
                    window.location.href = "/";
                  }}
                  className="text-left text-sm text-red-500 py-1"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link
                  href="/submit"
                  className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  List your business →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
