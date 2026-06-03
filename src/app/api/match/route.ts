import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface MatchRequest {
  stage: string;
  sectors: string[];
  priority: string;
  country: string;
  city: string;
  seisNeeded: string;
}

function scoreAndExplain(
  p: {
    stages: string[];
    sectors: string[];
    type: string;
    location: string;
    country: string;
    seisEligible: boolean;
    investmentMin: number | null;
    investmentMax: number | null;
    equityTaken: number | null;
  },
  answers: MatchRequest
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Stage match (+30)
  if (p.stages.length === 0 || p.stages.includes(answers.stage) || p.stages.includes("ANY")) {
    score += 30;
    reasons.push("Matches your stage");
  }

  // Sector overlap (+20 per match, max 40)
  if (answers.sectors.length > 0) {
    const overlap = answers.sectors.filter((s) => p.sectors.includes(s));
    if (overlap.length > 0) {
      score += Math.min(overlap.length * 20, 40);
      reasons.push(`Works with ${overlap.slice(0, 2).join(", ")}`);
    }
  } else {
    score += 10;
  }

  // Priority match (+15)
  if (answers.priority === "funding" && p.investmentMin && p.investmentMin >= 50000) {
    score += 15;
    reasons.push(`Strong funding: ${p.investmentMin >= 1000000 ? `${p.investmentMin / 1000000}m` : `${p.investmentMin / 1000}k`}+`);
  } else if (answers.priority === "mentorship") {
    score += 8;
  } else if (answers.priority === "network" && p.investmentMax && p.investmentMax >= 100000) {
    score += 15;
    reasons.push("Substantial investment backing");
  } else if (answers.priority === "equity_free" && p.equityTaken === 0) {
    score += 15;
    reasons.push("Equity-free programme");
  }

  // Country match (+20)
  if (answers.country && p.country === answers.country) {
    score += 20;
    reasons.push(`Based in ${answers.country}`);
  }

  // City match (+10) — UK-wide programmes count for any city
  if (answers.city) {
    const isUKWide = p.location.toLowerCase() === "uk-wide";
    const isCityMatch = p.location.toLowerCase().includes(answers.city.toLowerCase());
    if (isCityMatch) {
      score += 10;
      reasons.push(`Located in ${answers.city}`);
    } else if (isUKWide) {
      score += 10;
      reasons.push("Available UK-wide");
    }
  }

  // SEIS match (+10)
  if (answers.seisNeeded === "yes" && p.seisEligible) {
    score += 10;
    reasons.push("SEIS eligible");
  } else if (answers.seisNeeded === "no" || answers.seisNeeded === "doesnt_matter") {
    score += 5;
  }

  return { score, reasons };
}

export async function POST(req: Request) {
  try {
    const body: MatchRequest = await req.json();

    const countryFilter = body.country
      ? { OR: [{ country: body.country }, { country: "Pan-European" }] }
      : {};

    const programmes = await prisma.programme.findMany({
      where: { isActive: true, NOT: { type: "VC" }, ...countryFilter },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        description: true,
        location: true,
        country: true,
        currency: true,
        stages: true,
        sectors: true,
        seisEligible: true,
        eisEligible: true,
        investmentMin: true,
        investmentMax: true,
        equityTaken: true,
        applicationDeadline: true,
        logoUrl: true,
        isFeatured: true,
        isSponsored: true,
      },
    });

    const scored = programmes
      .map((p) => {
        const { score, reasons } = scoreAndExplain(p, body);
        return { ...p, matchScore: score, matchReasons: reasons };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({ results: scored });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
