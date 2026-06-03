import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  stage: z.string().min(1),
  // New wizard fields
  sector: z.string().optional(),
  challenge: z.string().optional(),
  supportType: z.string().optional(),
  outcome: z.string().optional(),
  // Legacy fields (kept for backward compat)
  sectors: z.array(z.string()).default([]),
  priority: z.string().default(""),
  country: z.string().default("UK"),
  seisNeeded: z.string().default("doesnt_matter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    await prisma.wizardResponse.create({
      data: {
        email: body.email || null,
        stage: body.stage,
        // Map new fields onto existing DB columns
        sectors: body.sector ? [body.sector] : body.sectors,
        priority: body.challenge ?? body.priority,
        country: body.country,
        seisNeeded: body.outcome ?? body.seisNeeded,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
