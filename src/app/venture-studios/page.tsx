import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UK Venture Studios (2025) — Accelerate.fyi",
  description: "Every UK venture studio in one place. Venture studios co-found companies with founders, providing capital, resources, and operational support in exchange for equity.",
};

export const revalidate = 3600;

export default async function VentureStudiosPage() {
  const programmes = await prisma.programme.findMany({
    where: { isActive: true, type: "VENTURE_STUDIO" },
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
        <div className="mb-2 text-sm text-indigo-400"><Link href="/directory" className="hover:text-indigo-300">Directory</Link> / Venture Studios</div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">UK Venture Studios</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {mapped.length} venture studios operating in the UK. Unlike accelerators, venture studios co-found companies — they typically take more equity but provide significant operational support, capital, and resources to build companies from scratch.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mapped.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
      </div>
    </div>
  );
}
