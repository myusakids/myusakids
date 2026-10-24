"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileRole } from "@/lib/actions";
import { useToast } from "@/components/Toast";
import type { Profile } from "@/lib/types";

interface Props {
  profiles: Profile[];
  currentUserId: string;
}

export default function UsersAdminClient({ profiles, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [changing, setChanging] = useState<string | null>(null);

  async function toggleRole(profile: Profile) {
    const newRole = profile.role === "admin" ? "owner" : "admin";
    if (!confirm(`Change ${profile.email} to ${newRole}?`)) return;

    setChanging(profile.id);
    startTransition(async () => {
      await updateProfileRole(profile.id, newRole);
      toast(`${profile.email} is now ${newRole}`);
      router.refresh();
      setChanging(null);
    });
  }

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {profiles.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-medium truncate max-w-[200px]">{p.email}</td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.full_name ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  p.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {p.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                {p.id !== currentUserId && (
                  <button
                    onClick={() => toggleRole(p)}
                    disabled={isPending && changing === p.id}
                    className="text-xs text-brand-green hover:underline disabled:opacity-40"
                  >
                    {changing === p.id ? "Changing…" : `Make ${p.role === "admin" ? "owner" : "admin"}`}
                  </button>
                )}
                {p.id === currentUserId && (
                  <span className="text-xs text-gray-300">you</span>
                )}
              </td>
            </tr>
          ))}
          {profiles.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No users yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
