"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { SECTORS, UK_LOCATIONS, STAGE_LABELS, TYPE_LABELS, EUROPEAN_COUNTRIES, CITIES_BY_COUNTRY } from "@/lib/constants";

const TYPES = Object.entries(TYPE_LABELS);
const STAGES = Object.entries(STAGE_LABELS);

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const sector = params.get("sector") ?? "";
  const stage = params.get("stage") ?? "";
  const country = params.get("country") ?? "";
  const location = params.get("location") ?? "";
  const seis = params.get("seis") === "1";
  const eis = params.get("eis") === "1";
  const remote = params.get("remote") === "1";

  const hasFilters = type || sector || stage || country || location || seis || eis || remote;

  const citiesForCountry = country && CITIES_BY_COUNTRY[country]
    ? CITIES_BY_COUNTRY[country]
    : UK_LOCATIONS as unknown as string[];

  function clearAll() {
    router.push(pathname + (q ? `?q=${q}` : ""));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search programmes..."
          defaultValue={q}
          onKeyDown={(e) => {
            if (e.key === "Enter") set("q", (e.target as HTMLInputElement).value || null);
          }}
          onBlur={(e) => set("q", e.target.value || null)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Type */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => set("type", type === val ? null : val)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                type === val
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Stage</p>
        <div className="flex flex-wrap gap-2">
          {STAGES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => set("stage", stage === val ? null : val)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                stage === val
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sector */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Sector</p>
        <select
          value={sector}
          onChange={(e) => set("sector", e.target.value || null)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Country</p>
        <select
          value={country}
          onChange={(e) => {
            set("country", e.target.value || null);
            // Clear city when country changes
            if (location) set("location", null);
          }}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All countries</option>
          {EUROPEAN_COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">City</p>
        <select
          value={location}
          onChange={(e) => set("location", e.target.value || null)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">{country ? `All ${country}` : "All locations"}</option>
          {citiesForCountry.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Options</p>
        <div className="flex flex-col gap-2">
          {[
            { key: "seis", label: "SEIS eligible", active: seis },
            { key: "eis", label: "EIS eligible", active: eis },
            { key: "remote", label: "Remote / hybrid", active: remote },
          ].map(({ key, label, active }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5">
              <div
                onClick={() => set(key, active ? null : "1")}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  active ? "bg-indigo-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    active ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-zinc-400">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
