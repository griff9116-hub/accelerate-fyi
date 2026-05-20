import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  sectors: z.array(z.string()).default([]),
  stages: z.array(z.string()).default([]),
  types: z.array(z.string()).default([]),
  location: z.string().optional().nullable(),
  seisOnly: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await prisma.alertSubscription.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        sectors: data.sectors,
        stages: data.stages as never[],
        types: data.types as never[],
        location: data.location ?? null,
        seisOnly: data.seisOnly,
        isActive: true,
      },
      update: {
        sectors: data.sectors,
        stages: data.stages as never[],
        types: data.types as never[],
        location: data.location ?? null,
        seisOnly: data.seisOnly,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
