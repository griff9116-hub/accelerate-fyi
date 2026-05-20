import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  stage: z.string().min(1),
  sectors: z.array(z.string()).default([]),
  priority: z.string().min(1),
  country: z.string().default("UK"),
  city: z.string().default(""),
  seisNeeded: z.string().default("doesnt_matter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    await prisma.wizardResponse.create({
      data: {
        email: body.email || null,
        stage: body.stage,
        sectors: body.sectors,
        priority: body.priority,
        country: body.country,
        seisNeeded: body.seisNeeded,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
