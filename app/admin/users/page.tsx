import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Profile } from "@/lib/types";
import UsersAdminClient from "./UsersAdminClient";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const profiles = (data ?? []) as Profile[];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Users</h1>
      <p className="text-sm text-gray-500 mb-6">
        To make the first admin: sign up, then change your role here.
      </p>
      <UsersAdminClient profiles={profiles} currentUserId={user.id} />
    </div>
  );
}
