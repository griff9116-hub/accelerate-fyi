"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export function AdminReviewActions({ id }: { id: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState(false);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setDone(true);
  }

  if (done) return <span className="text-xs text-zinc-600">Done</span>;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={!!loading}
        className="flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-500/20 disabled:opacity-40"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {loading === "approve" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={!!loading}
        className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
      >
        <XCircle className="h-3.5 w-3.5" />
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}
