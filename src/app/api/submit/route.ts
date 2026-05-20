import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  websiteUrl: z.string().url(),
  applyUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(20).max(2000),
  type: z.enum(["ACCELERATOR", "VENTURE_STUDIO", "VC", "ANGEL_NETWORK", "INCUBATOR", "GRANT"]),
  location: z.string().min(1),
  isRemote: z.boolean().default(false),
  sectors: z.array(z.string()).default([]),
  stages: z.array(z.string()).default([]),
  seisEligible: z.boolean().default(false),
  eisEligible: z.boolean().default(false),
  equityTaken: z.number().min(0).max(100).nullable().optional(),
  investmentMin: z.number().int().min(0).nullable().optional(),
  investmentMax: z.number().int().min(0).nullable().optional(),
  cohortSize: z.number().int().min(1).nullable().optional(),
  durationWeeks: z.number().int().min(0).nullable().optional(),
  submitterEmail: z.string().email(),
});

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().slice(0, 60);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    let slug = slugify(data.name);
    let suffix = 1;
    while (await prisma.programme.findUnique({ where: { slug } })) {
      slug = `${slugify(data.name)}-${++suffix}`;
    }

    await prisma.programme.create({
      data: {
        slug,
        name: data.name,
        websiteUrl: data.websiteUrl,
        applyUrl: data.applyUrl || null,
        description: data.description,
        type: data.type,
        location: data.location,
        isRemote: data.isRemote,
        sectors: data.sectors,
        stages: data.stages as never[],
        seisEligible: data.seisEligible,
        eisEligible: data.eisEligible,
        equityTaken: data.equityTaken ?? null,
        investmentMin: data.investmentMin ?? null,
        investmentMax: data.investmentMax ?? null,
        cohortSize: data.cohortSize ?? null,
        durationWeeks: data.durationWeeks ?? null,
        submitterEmail: data.submitterEmail,
        isActive: false,
        isFeatured: false,
        isSponsored: false,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
