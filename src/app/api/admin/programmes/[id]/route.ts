import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["isActive", "isFeatured", "isSponsored", "name", "description", "websiteUrl", "applyUrl"];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  await prisma.programme.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
