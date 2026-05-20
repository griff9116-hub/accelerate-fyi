import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (!ids.length) return NextResponse.json([]);

  const rows = await prisma.programme.findMany({
    where: { id: { in: ids }, isActive: true },
    include: { reviews: { where: { isApproved: true }, select: { overallRating: true } } },
  });

  const data = rows.map((p) => {
    const avgRating = p.reviews.length
      ? Math.round((p.reviews.reduce((a, r) => a + r.overallRating, 0) / p.reviews.length) * 10) / 10
      : null;
    return {
      ...p,
      applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
      nextCohortDate: p.nextCohortDate?.toISOString() ?? null,
      avgRating,
      reviewCount: p.reviews.length,
    };
  });

  return NextResponse.json(data);
}
