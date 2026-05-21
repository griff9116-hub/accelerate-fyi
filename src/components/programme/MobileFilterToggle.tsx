"use client";

import { useState, Suspense } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { FilterBar } from "./FilterBar";

export function MobileFilterToggle({ activeFilterCount }: { activeFilterCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>
      )}
    </div>
  );
}
