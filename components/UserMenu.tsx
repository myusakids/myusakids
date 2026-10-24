"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
}

export default function UserMenu({ profile }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-green transition-colors"
        aria-label="User menu"
      >
        {/* Avatar */}
        <span className="w-7 h-7 rounded-full bg-brand-green-light text-brand-green-dark text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-50">
            <p className="text-xs font-medium text-gray-900 truncate">
              {profile.full_name ?? profile.email}
            </p>
            {profile.full_name && (
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
            )}
          </div>

          {profile.role === "admin" ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Admin dashboard
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              My dashboard
            </Link>
          )}

          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
