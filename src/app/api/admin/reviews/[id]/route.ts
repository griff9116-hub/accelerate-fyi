import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = schema.parse(await req.json());

  if (body.action === "approve") {
    await prisma.review.update({ where: { id }, data: { isApproved: true } });
  } else {
    await prisma.review.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
