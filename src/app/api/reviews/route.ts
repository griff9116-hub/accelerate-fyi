import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  programmeId: z.string().min(1),
  authorName: z.string().min(1).max(100),
  cohortYear: z.coerce.number().min(2000).max(2030).optional().nullable(),
  overallRating: z.number().min(1).max(5),
  equityRating: z.number().min(1).max(5).optional().nullable(),
  mentorRating: z.number().min(1).max(5).optional().nullable(),
  networkRating: z.number().min(1).max(5).optional().nullable(),
  body: z.string().min(20).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await prisma.review.create({
      data: {
        programmeId: data.programmeId,
        authorName: data.authorName,
        cohortYear: data.cohortYear ?? null,
        overallRating: data.overallRating,
        equityRating: data.equityRating ?? null,
        mentorRating: data.mentorRating ?? null,
        networkRating: data.networkRating ?? null,
        body: data.body,
        isVerified: false,
        isApproved: false,
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
