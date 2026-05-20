import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface MatchRequest {
  stage: string;
  sectors: string[];
  priority: string;
  location: string;
  seisNeeded: string;
}

function scoreAndExplain(
  p: {
    stages: string[];
    sectors: string[];
    type: string;
    location: string;
    seisEligible: boolean;
    eisEligible: boolean;
    investmentMin: number | null;
    investmentMax: number | null;
    equityTaken: number | null;
  },
  answers: MatchRequest
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Stage match (+30)
  if (
    p.stages.length === 0 ||
    p.stages.includes(answers.stage) ||
    p.stages.includes("ANY")
  ) {
    score += 30;
    reasons.push("Matches your stage");
  }

  // Sector overlap (+20 per match, max 40)
  if (answers.sectors.length > 0) {
    const overlap = answers.sectors.filter((s) => p.sectors.includes(s));
    if (overlap.length > 0) {
      const pts = Math.min(overlap.length * 20, 40);
      score += pts;
      reasons.push(`Works with ${overlap.slice(0, 2).join(", ")}`);
    }
  } else {
    score += 10;
  }

  // Priority match (+15)
  if (answers.priority === "funding" && p.investmentMin && p.investmentMin >= 50000) {
    score += 15;
    reasons.push(`Strong funding: £${(p.investmentMin / 1000).toFixed(0)}k+`);
  } else if (answers.priority === "mentorship") {
    // Proxy: programmes with reviews that rate mentorship highly
    score += 8;
  } else if (answers.priority === "network" && p.investmentMax && p.investmentMax >= 100000) {
    score += 15;
    reasons.push("Substantial investment backing");
  } else if (answers.priority === "equity_free" && p.equityTaken === 0) {
    score += 15;
    reasons.push("Equity-free programme");
  }

  // Location match (+15)
  if (answers.location === "uk_wide") {
    score += 15;
  } else if (answers.location && p.location) {
    const locLower = p.location.toLowerCase();
    if (
      locLower.includes(answers.location.toLowerCase()) ||
      locLower.includes("uk-wide") ||
      locLower.includes("remote")
    ) {
      score += 15;
      reasons.push(`Based in ${answers.location}`);
    }
  } else {
    score += 5;
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

    const programmes = await prisma.programme.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        description: true,
        location: true,
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
