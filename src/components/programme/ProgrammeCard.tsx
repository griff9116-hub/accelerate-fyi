"use client";

import Link from "next/link";
import { MapPin, Clock, Users, TrendingUp, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { TYPE_LABELS, TYPE_COLORS, STAGE_LABELS } from "@/lib/constants";
import { formatInvestment, formatDeadline, formatEquity, cn } from "@/lib/utils";
import { useSaved } from "@/lib/hooks/useSaved";

// Deterministic colour per programme name — beats uniform grey for missing logos
const LOGO_BG = [
  "bg-indigo-600", "bg-violet-600", "bg-blue-600", "bg-sky-600",
  "bg-emerald-600", "bg-teal-600", "bg-amber-600", "bg-rose-600",
];
function logoColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return LOGO_BG[Math.abs(h) % LOGO_BG.length];
}

export interface ProgrammeCardData {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl?: string | null;
  type: string;
  location: string;
  country?: string | null;
  currency?: string | null;
  isRemote: boolean;
  sectors: string[];
  stages: string[];
  seisEligible: boolean;
  eisEligible: boolean;
  equityTaken?: number | null;
  investmentMin?: number | null;
  investmentMax?: number | null;
  cohortSize?: number | null;
  durationWeeks?: number | null;
  applicationDeadline?: Date | string | null;
  isFeatured: boolean;
  isSponsored: boolean;
  avgRating?: number | null;
  reviewCount?: number;
  distanceMiles?: number | null;
}

export function ProgrammeCard({ programme: p }: { programme: ProgrammeCardData }) {
  const { isSaved, toggle } = useSaved(p.id);
  const deadline = formatDeadline(p.applicationDeadline ? new Date(p.applicationDeadline) : null);

  const investment = formatInvestment(p.investmentMin, p.investmentMax, p.currency ?? "GBP");
  const equity = formatEquity(p.equityTaken);
  const showInvestment = investment !== "Undisclosed";
  const showEquity = equity !== "Undisclosed";
  const hasStats = showInvestment || showEquity || !!p.cohortSize || !!p.durationWeeks;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-zinc-900 transition-all duration-200 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20",
        p.isSponsored ? "border-indigo-500/40" : "border-zinc-800"
      )}
    >
      {/* Stretched link — entire card is clickable */}
      <Link
        href={`/programme/${p.slug}`}
        className="absolute inset-0 rounded-xl"
        aria-label={`View ${p.name}`}
      />

      {p.isSponsored && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-indigo-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
          Sponsored
        </div>
      )}

      <div className="pointer-events-none relative flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg text-base font-bold text-white",
            p.logoUrl ? "bg-zinc-800" : logoColor(p.name)
          )}>
            {p.logoUrl
              ? <img src={p.logoUrl} alt={p.name} className="h-full w-full object-contain p-1" />
              : p.name.charAt(0)
            }
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white">
                  {p.name}
                </h3>
                {p.isFeatured && (
                  <span className="mt-0.5 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                    Featured
                  </span>
                )}
              </div>
              <button
                onClick={(e) => { e.preventDefault(); toggle(); }}
                aria-label={isSaved ? "Remove from saved" : "Save programme"}
                className="pointer-events-auto relative z-10 shrink-0 rounded-md p-1 text-zinc-600 transition-colors hover:text-indigo-400"
              >
                {isSaved
                  ? <BookmarkCheck className="h-4 w-4 text-indigo-400" />
                  : <Bookmark className="h-4 w-4" />
                }
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", TYPE_COLORS[p.type])}>
                {TYPE_LABELS[p.type]}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" />
                {p.location}
                {p.country && p.country !== "UK" && `, ${p.country}`}
                {p.isRemote && " · Remote"}
                {p.distanceMiles != null && (
                  <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    ~{Math.round(p.distanceMiles)} mi
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">
          {p.description}
        </p>

        {/* Sector tags */}
        {p.sectors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.sectors.slice(0, 3).map((s) => <Badge key={s}>{s}</Badge>)}
            {p.sectors.length > 3 && <Badge>+{p.sectors.length - 3} more</Badge>}
          </div>
        )}

        {/* Key stats — hidden entirely when all undisclosed */}
        {hasStats && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-zinc-800 pt-4 text-xs text-zinc-400">
            {showInvestment && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-zinc-600" />
                {investment}
              </div>
            )}
            {showEquity && (
              <div className={cn("flex items-center gap-1.5", equity === "Equity-free" && "text-green-400")}>
                <span className="text-zinc-600">Equity:</span>
                {equity}
              </div>
            )}
            {!!p.cohortSize && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-zinc-600" />
                {p.cohortSize} per cohort
              </div>
            )}
            {!!p.durationWeeks && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-600" />
                {p.durationWeeks}w
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Footer — badges + View button */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-800 pt-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {p.seisEligible && <Badge variant="green">SEIS</Badge>}
            {p.eisEligible && <Badge variant="green">EIS</Badge>}
            {p.stages.slice(0, 2).map((s) => (
              <Badge key={s} variant="accent">{STAGE_LABELS[s] ?? s}</Badge>
            ))}
            {deadline.label === "Rolling" && <Badge>Rolling</Badge>}
            {deadline.label !== "Rolling" && deadline.label !== "Closed" && (
              <Badge variant={deadline.urgent ? "amber" : "default"}>
                {deadline.urgent && "⏱ "}{deadline.label}
              </Badge>
            )}
            {p.avgRating != null && (
              <div className="flex items-center gap-1">
                <StarRating rating={p.avgRating} />
                <span className="text-xs text-zinc-500">{p.avgRating}</span>
              </div>
            )}
          </div>

          <span className="shrink-0 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
