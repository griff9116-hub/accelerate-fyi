import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { AdSlot } from "@/components/ui/AdSlot";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "London Accelerators & Investors (2025) — Accelerate.fyi",
  description: "Every startup accelerator, venture studio, and VC based in London. The UK's startup capital has more programmes than anywhere else.",
};

export const revalidate = 3600;

export default async function LondonPage() {
  const programmes = await prisma.programme.findMany({
    where: { isActive: true, location: { contains: "London", mode: "insensitive" }, NOT: { type: "VC" } },
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
        <div className="mb-2 text-sm text-indigo-400"><Link href="/directory" className="hover:text-indigo-300">Directory</Link> / London</div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">London Accelerators & Investors</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {mapped.length} programmes based in London — Europe&apos;s startup capital. From pre-idea cohort builders like EF and Antler to leading seed VCs and corporate accelerators.
        </p>
      </div>
      <AdSlot slot="category-london" format="horizontal" className="mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mapped.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
      </div>
    </div>
  );
}
