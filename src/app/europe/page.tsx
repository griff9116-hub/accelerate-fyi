import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { AdSlot } from "@/components/ui/AdSlot";
import Link from "next/link";
import { Globe } from "lucide-react";
import type { Metadata } from "next";
import { avgRating } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "European Startup Accelerators & Investors (2025)",
  description: "Browse the best startup accelerators, VCs, and venture studios across Europe — Germany, France, Netherlands, Sweden, Spain and more.",
};

export default async function EuropePage() {
  const rows = await prisma.programme.findMany({
    where: { isActive: true, NOT: { country: "UK" } },
    orderBy: [{ isSponsored: "desc" }, { isFeatured: "desc" }, { name: "asc" }],
    include: { reviews: { where: { isApproved: true }, select: { overallRating: true } } },
  });

  const programmes = rows.map((p) => ({
    ...p,
    applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
    nextCohortDate: p.nextCohortDate?.toISOString() ?? null,
    avgRating: avgRating(p.reviews.map((r) => r.overallRating)),
    reviewCount: p.reviews.length,
  }));

  const byCountry: Record<string, typeof programmes> = {};
  for (const p of programmes) {
    if (!byCountry[p.country]) byCountry[p.country] = [];
    byCountry[p.country].push(p);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
          <Globe className="h-3.5 w-3.5" />
          Europe
        </div>
        <h1 className="text-4xl font-bold text-white">European Startup Accelerators &amp; Investors</h1>
        <p className="mt-3 text-zinc-400">
          {programmes.length} programmes across Europe. From Berlin to Paris to Lisbon.
        </p>
      </div>

      <AdSlot slot="category-europe" format="horizontal" className="mb-8" />

      {programmes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center">
          <p className="text-zinc-500">European programmes coming soon.</p>
          <Link href="/submit" className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">
            Submit a programme →
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(byCountry).sort().map(([country, progs]) => (
            <div key={country}>
              <h2 className="mb-4 text-lg font-semibold text-zinc-300">{country} <span className="ml-2 text-sm font-normal text-zinc-600">({progs.length})</span></h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {progs.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-sm text-zinc-500">Know a programme we&apos;re missing?</p>
        <Link href="/submit" className="mt-2 inline-block text-sm text-indigo-400 hover:text-indigo-300">Submit a programme →</Link>
      </div>
    </div>
  );
}
