import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { AdSlot } from "@/components/ui/AdSlot";
import Link from "next/link";
import type { Metadata } from "next";
import { avgRating } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dutch Startup Accelerators & VCs (2025)",
  description: "The best startup accelerators, venture studios, and investors in the Netherlands — Amsterdam, Rotterdam, Eindhoven.",
};

export default async function NetherlandsPage() {
  const rows = await prisma.programme.findMany({
    where: { isActive: true, country: "Netherlands", NOT: { type: "VC" } },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="mb-2 text-sm text-zinc-500"><Link href="/europe" className="hover:text-zinc-300">Europe</Link> / Netherlands</p>
        <h1 className="text-4xl font-bold text-white">Dutch Startup Accelerators &amp; Investors</h1>
        <p className="mt-3 text-zinc-400">{programmes.length} programmes in the Netherlands.</p>
      </div>

      <AdSlot slot="category-netherlands" format="horizontal" className="mb-6" />

      {programmes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center">
          <p className="text-zinc-500">Dutch programmes coming soon.</p>
          <Link href="/submit" className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">Submit a programme →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {programmes.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
        </div>
      )}
    </div>
  );
}
