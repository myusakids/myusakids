"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/lib/actions";
import { useToast } from "@/components/Toast";

export default function DashboardEventActions({ eventId }: { eventId: string }) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await deleteEvent(eventId);
    if (error) {
      toast(error, "error");
    } else {
      toast("Event deleted");
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link
        href={`/dashboard/events/${eventId}/edit`}
        className="text-xs text-brand-green hover:underline"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs text-red-500 hover:underline disabled:opacity-40"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
