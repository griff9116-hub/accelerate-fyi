import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResend, buildAlertEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = await prisma.alertSubscription.findMany({
    where: { isActive: true },
    include: { matches: { select: { programmeId: true } } },
  });

  let sent = 0;

  for (const sub of subscribers) {
    const seen = new Set(sub.matches.map((m) => m.programmeId));

    const where: Record<string, unknown> = {
      isActive: true,
      id: { notIn: [...seen] },
    };
    if (sub.sectors.length) where.sectors = { hasSome: sub.sectors };
    if (sub.stages.length) where.stages = { hasSome: sub.stages };
    if (sub.types.length) where.type = { in: sub.types };
    if (sub.location) where.location = { contains: sub.location, mode: "insensitive" };
    if (sub.seisOnly) where.seisEligible = true;

    const matches = await prisma.programme.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 8,
    });

    if (!matches.length) continue;

    const html = buildAlertEmail(matches);
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? "alerts@accelerate-fyi.vercel.app",
      to: sub.email,
      subject: `${matches.length} new programme${matches.length > 1 ? "s" : ""} matching your preferences`,
      html,
    });

    await prisma.alertMatch.createMany({
      data: matches.map((p) => ({ alertId: sub.id, programmeId: p.id, sentAt: new Date() })),
      skipDuplicates: true,
    });

    sent++;
  }

  return NextResponse.json({ ok: true, emailsSent: sent });
}
