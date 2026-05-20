import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { FilterBar } from "@/components/programme/FilterBar";
import { AdSlot } from "@/components/ui/AdSlot";
import { SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directory",
  description: "Browse all UK accelerators, venture studios, VCs and more.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sector?: string;
    stage?: string;
    location?: string;
    seis?: string;
    eis?: string;
    remote?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 18;

async function getProgrammes(sp: Awaited<PageProps["searchParams"]>) {
  const page = parseInt(sp.page ?? "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = { isActive: true };

  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
      { sectors: { has: sp.q } },
    ];
  }
  if (sp.type) where.type = sp.type;
  if (sp.sector) where.sectors = { has: sp.sector };
  if (sp.stage) where.stages = { has: sp.stage };
  if (sp.location) where.location = { contains: sp.location, mode: "insensitive" };
  if (sp.seis === "1") where.seisEligible = true;
  if (sp.eis === "1") where.eisEligible = true;
  if (sp.remote === "1") where.isRemote = true;

  const [total, rows] = await Promise.all([
    prisma.programme.count({ where }),
    prisma.programme.findMany({
      where,
      orderBy: [{ isSponsored: "desc" }, { isFeatured: "desc" }, { name: "asc" }],
      skip,
      take: PAGE_SIZE,
      include: { reviews: { where: { isApproved: true }, select: { overallRating: true } } },
    }),
  ]);

  const programmes = rows.map((p) => {
    const approved = p.reviews;
    const avgRating = approved.length
      ? Math.round((approved.reduce((a, r) => a + r.overallRating, 0) / approved.length) * 10) / 10
      : null;
    return {
      ...p,
      applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
      nextCohortDate: p.nextCohortDate?.toISOString() ?? null,
      avgRating,
      reviewCount: approved.length,
    };
  });

  return { programmes, total, page, pages: Math.ceil(total / PAGE_SIZE) };
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { programmes, total, page, pages } = await getProgrammes(sp);

  const hasFilters = sp.q || sp.type || sp.sector || sp.stage || sp.location || sp.seis || sp.eis || sp.remote;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">UK Programme Directory</h1>
        <p className="mt-1 text-zinc-500">
          {total} programme{total !== 1 ? "s" : ""} found
          {hasFilters ? " matching your filters" : ""}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
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
          {/* Mobile filter strip */}
          <div className="mb-4 lg:hidden">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <Suspense>
                <FilterBar />
              </Suspense>
            </div>
          </div>

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
