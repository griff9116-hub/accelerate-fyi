"use client";

import Link from "next/link";
import { MapPin, Clock, Users, TrendingUp, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { TYPE_LABELS, TYPE_COLORS, STAGE_LABELS } from "@/lib/constants";
import { formatInvestment, formatDeadline, formatEquity, cn } from "@/lib/utils";
import { useSaved } from "@/lib/hooks/useSaved";

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

interface ProgrammeCardProps {
  programme: ProgrammeCardData;
}

export function ProgrammeCard({ programme: p }: ProgrammeCardProps) {
  const { isSaved, toggle } = useSaved(p.id);
  const deadline = formatDeadline(p.applicationDeadline ? new Date(p.applicationDeadline) : null);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-zinc-900 p-5 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/50",
        p.isSponsored ? "border-indigo-500/40" : "border-zinc-800"
      )}
    >
      {p.isSponsored && (
        <div className="absolute right-3 top-3 rounded-full bg-indigo-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
          Sponsored
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-lg font-bold text-zinc-300">
          {p.logoUrl ? (
            <img src={p.logoUrl} alt={p.name} className="h-full w-full rounded-lg object-contain p-1" />
          ) : (
            p.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-zinc-100 leading-tight">{p.name}</h3>
            {p.isFeatured && (
              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 border border-amber-500/20">
                Featured
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", TYPE_COLORS[p.type])}>
              {TYPE_LABELS[p.type]}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-zinc-500">
              <MapPin className="h-3 w-3" />
              {p.location}{p.country && p.country !== "UK" && `, ${p.country}`}{p.isRemote && " · Remote"}
              {p.distanceMiles != null && (
                <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                  ~{Math.round(p.distanceMiles)} mi
                </span>
              )}
            </span>
          </div>
        </div>

        <button
          onClick={() => toggle()}
          aria-label={isSaved ? "Remove from saved" : "Save programme"}
          className="flex-shrink-0 rounded-md p-1 text-zinc-600 transition-colors hover:text-indigo-400"
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4 text-indigo-400" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{p.description}</p>

      {/* Sectors */}
      {p.sectors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.sectors.slice(0, 3).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
          {p.sectors.length > 3 && (
            <Badge>+{p.sectors.length - 3} more</Badge>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-zinc-800 pt-4 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <TrendingUp className="h-3.5 w-3.5 text-zinc-600" />
          <span>{formatInvestment(p.investmentMin, p.investmentMax, p.currency ?? "GBP")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="text-zinc-600">Equity:</span>
          <span>{formatEquity(p.equityTaken)}</span>
        </div>
        {p.cohortSize && (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Users className="h-3.5 w-3.5 text-zinc-600" />
            <span>{p.cohortSize} per cohort</span>
          </div>
        )}
        {p.durationWeeks && (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-zinc-600" />
            <span>{p.durationWeeks}w programme</span>
          </div>
        )}
      </div>

      {/* Badges row */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.seisEligible && <Badge variant="green">SEIS</Badge>}
        {p.eisEligible && <Badge variant="green">EIS</Badge>}
        {p.stages.slice(0, 2).map((s) => (
          <Badge key={s} variant="accent">{STAGE_LABELS[s] ?? s}</Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        <Link
          href={`/programme/${p.slug}`}
          className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-indigo-600 hover:text-white"
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
