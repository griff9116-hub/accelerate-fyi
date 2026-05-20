import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UK Startup Accelerators (2025) — Accelerate.fyi",
  description: "Browse every UK startup accelerator programme. Filter by sector, stage, location, SEIS/EIS eligibility and more. Find the right accelerator for your startup.",
  openGraph: {
    title: "UK Startup Accelerators (2025)",
    description: "Every UK startup accelerator in one place. Filter by sector, stage, equity terms and more.",
  },
};

export const revalidate = 3600;

export default async function AcceleratorsPage() {
  const programmes = await prisma.programme.findMany({
    where: { isActive: true, type: "ACCELERATOR" },
    orderBy: [{ isSponsored: "desc" }, { isFeatured: "desc" }, { name: "asc" }],
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
        <div className="mb-2 text-sm text-indigo-400"><Link href="/directory" className="hover:text-indigo-300">Directory</Link> / Accelerators</div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">UK Startup Accelerators</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {mapped.length} accelerator programmes across the UK. Accelerators typically invest pre-seed or seed capital, take a small equity stake, and run structured cohort programmes with mentorship and a Demo Day.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mapped.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
      </div>
    </div>
  );
}
