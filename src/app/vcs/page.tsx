import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UK Seed VCs & Early-Stage Investors (2025) — Accelerate.fyi",
  description: "UK venture capital funds and early-stage investors. Find seed and pre-seed VCs investing in UK startups across every sector.",
};

export const revalidate = 3600;

export default async function VCsPage() {
  const programmes = await prisma.programme.findMany({
    where: { isActive: true, type: "VC" },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    include: { reviews: { where: { isApproved: true }, select: { overallRating: true } } },
  });

  const mapped = programmes.map((p) => ({
    ...p,
    applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
    nextCohortDate: p.nextCohortDate?.toISOString() ?? null,
    avgRating: p.reviews.length ? Math.round((p.reviews.reduce((a, r) => a + r.overallRating, 0) / p.reviews.length) * 10) / 10 : null,
    reviewCount: p.reviews.length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <div className="mb-2 text-sm text-indigo-400"><Link href="/directory" className="hover:text-indigo-300">Directory</Link> / VCs</div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">UK Seed VCs & Early-Stage Investors</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {mapped.length} venture capital funds investing in UK startups. From pre-seed to Series A+, these are the institutional investors backing the next generation of UK tech companies.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mapped.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
      </div>
    </div>
  );
}
