"use client";

import { useEffect, useState } from "react";
import { useSavedIds } from "@/lib/hooks/useSaved";
import { ProgrammeCard, type ProgrammeCardData } from "@/components/programme/ProgrammeCard";
import { Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  const ids = useSavedIds();
  const [programmes, setProgrammes] = useState<ProgrammeCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setProgrammes([]);
      return;
    }
    setLoading(true);
    fetch(`/api/programmes?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProgrammes(data))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/20">
          <Bookmark className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Saved programmes</h1>
          <p className="text-sm text-zinc-500">{ids.length} saved</p>
        </div>
      </div>

      {ids.length === 0 ? (
        <div className="py-24 text-center">
          <Bookmark className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
          <p className="text-zinc-500">You haven&apos;t saved any programmes yet.</p>
          <Link
            href="/directory"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Browse the directory <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ids.map((id) => (
            <div key={id} className="h-60 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => (
            <ProgrammeCard key={p.slug} programme={p} />
          ))}
        </div>
      )}
    </div>
  );
}
