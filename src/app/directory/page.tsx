import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { FilterBar } from "@/components/programme/FilterBar";
import { MobileFilterToggle } from "@/components/programme/MobileFilterToggle";
import { AdSlot } from "@/components/ui/AdSlot";
import { SlidersHorizontal } from "lucide-react";
import { CITY_COORDINATES } from "@/lib/constants";
import { haversineDistance } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directory",
  description: "Browse accelerators, venture studios, incubators, and grants across the UK and Europe.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sectors?: string;
    stage?: string;
    country?: string;
    location?: string;
    seis?: string;
    eis?: string;
    remote?: string;
    page?: string;
    postcode?: string;
    lat?: string;
    lng?: string;
  }>;
}

const PAGE_SIZE = 18;

async function getProgrammes(sp: Awaited<PageProps["searchParams"]>) {
  const page = parseInt(sp.page ?? "1", 10);

  const userLat = sp.lat ? parseFloat(sp.lat) : null;
  const userLng = sp.lng ? parseFloat(sp.lng) : null;
  const sortByDistance = userLat !== null && userLng !== null;

  const where: Record<string, unknown> = { isActive: true, NOT: { type: "VC" } };
  const andConditions: Record<string, unknown>[] = [];

  if (sp.q) {
    andConditions.push({
      OR: [
        { name: { contains: sp.q, mode: "insensitive" } },
        { description: { contains: sp.q, mode: "insensitive" } },
        { sectors: { has: sp.q } },
      ],
    });
  }

  if (sp.type) where.type = sp.type;
  const selectedSectors = sp.sectors ? sp.sectors.split(",").filter(Boolean) : [];
  if (selectedSectors.length) where.sectors = { hasSome: selectedSectors };
  if (sp.stage) where.stages = { has: sp.stage };
  if (sp.country) where.country = sp.country;

  if (sp.location) {
    // UK-wide programmes appear in every city search
    andConditions.push({
      OR: [
        { location: { contains: sp.location, mode: "insensitive" } },
        { location: "UK-wide" },
      ],
    });
  }

  if (sp.seis === "1") where.seisEligible = true;
  if (sp.eis === "1") where.eisEligible = true;
  if (sp.remote === "1") where.isRemote = true;
  if (andConditions.length) where.AND = andConditions;

  const skip = (page - 1) * PAGE_SIZE;

  // When sorting by distance we fetch all (no skip/take) then sort+paginate in JS
  const [total, rows] = await Promise.all([
    prisma.programme.count({ where }),
    prisma.programme.findMany({
      where,
      orderBy: sortByDistance ? [{ isSponsored: "desc" }, { isFeatured: "desc" }] : [{ isSponsored: "desc" }, { isFeatured: "desc" }, { name: "asc" }],
      skip: sortByDistance ? 0 : skip,
      take: sortByDistance ? undefined : PAGE_SIZE,
      include: { reviews: { where: { isApproved: true }, select: { overallRating: true } } },
    }),
  ]);

  let programmes = rows.map((p) => {
    const approved = p.reviews;
    const avgRating = approved.length
      ? Math.round((approved.reduce((a, r) => a + r.overallRating, 0) / approved.length) * 10) / 10
      : null;

    let distanceMiles: number | null = null;
    if (sortByDistance) {
      // Try exact match, then fuzzy match (e.g. "London, UK" → "London")
      let coords = CITY_COORDINATES[p.location];
      if (!coords) {
        const cityKey = Object.keys(CITY_COORDINATES).find((city) =>
          p.location.toLowerCase().startsWith(city.toLowerCase())
        );
        if (cityKey) coords = CITY_COORDINATES[cityKey];
      }
      if (coords) {
        distanceMiles = haversineDistance(userLat!, userLng!, coords[0], coords[1]);
      }
      // UK-wide stays null — shows after location-specific results in distance sort
    }

    return {
      ...p,
      applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
      nextCohortDate: p.nextCohortDate?.toISOString() ?? null,
      avgRating,
      reviewCount: approved.length,
      distanceMiles,
    };
  });

  if (sortByDistance) {
    programmes = programmes
      .sort((a, b) => {
        // Sponsored/featured first, then by distance (null = far away)
        if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1;
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        const da = a.distanceMiles ?? 9999;
        const db = b.distanceMiles ?? 9999;
        return da - db;
      })
      .slice(skip, skip + PAGE_SIZE);
  }

  return { programmes, total, page, pages: Math.ceil(total / PAGE_SIZE) };
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { programmes, total, page, pages } = await getProgrammes(sp);

  const hasFilters = sp.q || sp.type || sp.sectors || sp.stage || sp.country || sp.location || sp.seis || sp.eis || sp.remote || sp.postcode;
  const activeFilterCount = [sp.type, sp.sectors, sp.stage, sp.country, sp.location, sp.seis, sp.eis, sp.remote, sp.postcode].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">UK & European Programme Directory</h1>
        <p className="mt-1 text-zinc-500">
          {total} programme{total !== 1 ? "s" : ""} found
          {hasFilters ? " matching your filters" : ""}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>
            <Suspense>
              <FilterBar />
            </Suspense>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {/* Mobile filter toggle */}
          <MobileFilterToggle activeFilterCount={activeFilterCount} />

          {/* Ad: leaderboard above results */}
          <AdSlot slot="directory-top" format="horizontal" className="mb-4 hidden lg:block" />
          <AdSlot slot="directory-top-mobile" format="auto" className="mb-4 lg:hidden" />

          {programmes.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-500">No programmes match your filters.</p>
              <a href="/directory" className="mt-2 inline-block text-sm text-indigo-400 hover:text-indigo-300">
                Clear all filters
              </a>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {programmes.map((p) => (
                <ProgrammeCard key={p.slug} programme={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <a
                  href={`?${new URLSearchParams({ ...sp, page: String(page - 1) })}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-700"
                >
                  Previous
                </a>
              )}
              <span className="text-sm text-zinc-500">
                Page {page} of {pages}
              </span>
              {page < pages && (
                <a
                  href={`?${new URLSearchParams({ ...sp, page: String(page + 1) })}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-700"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
