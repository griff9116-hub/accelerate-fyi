import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface MatchRequest {
  stage: string;      // idea_preseed | seed | growth | series_a_plus
  sector: string;     // tech_software | hardware_iot | biotech_healthtech | climate_cleantech | fintech | other
  challenge: string;  // product_development | customer_acquisition | funding | team_building | market_validation | scaling
  supportType: string; // mentorship_networking | funding_opps | industry_resources | biz_dev_sales | technical_expertise
  outcome: string;    // fundraising | product_tech | sales_gtm | hiring_people | pr_comms
}

const STAGE_MAP: Record<string, string[]> = {
  idea_preseed: ["PRE_IDEA", "PRE_SEED"],
  seed: ["PRE_SEED", "SEED"],
  growth: ["SEED", "SERIES_A"],
  series_a_plus: ["SERIES_A", "SERIES_B_PLUS"],
};

const SECTOR_MAP: Record<string, string[]> = {
  tech_software: ["SaaS / B2B Software", "AI & Machine Learning"],
  hardware_iot: ["Hardware & IoT", "Deep Tech"],
  biotech_healthtech: ["Healthtech"],
  climate_cleantech: ["Cleantech"],
  fintech: ["Fintech"],
  other: [],
};

function scoreAndExplain(
  p: {
    stages: string[];
    sectors: string[];
    type: string;
    investmentMin: number | null;
    investmentMax: number | null;
    equityTaken: number | null;
    isFeatured: boolean;
  },
  answers: MatchRequest
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const targetStages = STAGE_MAP[answers.stage] ?? [];
  const targetSectors = SECTOR_MAP[answers.sector] ?? [];

  // 1. Stage match (0-30)
  const stagesOpen = p.stages.length === 0 || p.stages.includes("ANY");
  if (stagesOpen || targetStages.some((s) => p.stages.includes(s))) {
    score += 30;
    if (!stagesOpen) reasons.push("Matches your stage");
  }

  // 2. Sector match (0-40)
  if (answers.sector === "other" || targetSectors.length === 0) {
    score += p.sectors.length === 0 ? 20 : 10;
  } else {
    const overlap = targetSectors.filter((s) => p.sectors.includes(s));
    if (overlap.length > 0) {
      score += Math.min(overlap.length * 20, 40);
      reasons.push(`Works with ${overlap.slice(0, 2).join(", ")}`);
    } else if (p.sectors.length === 0) {
      score += 15; // sector-agnostic programme
    }
  }

  // 3. Challenge match (0-20)
  switch (answers.challenge) {
    case "product_development":
      if (p.type === "VENTURE_STUDIO") { score += 20; reasons.push("Venture studio: product-first support"); }
      else if (p.type === "INCUBATOR") { score += 15; }
      else if (p.type === "ACCELERATOR") { score += 10; }
      break;
    case "customer_acquisition":
      if (p.type === "ACCELERATOR") { score += 20; reasons.push("Accelerator network drives growth"); }
      else if (p.type === "INCUBATOR") { score += 10; }
      break;
    case "funding":
      if (p.investmentMin && p.investmentMin > 0) { score += 20; reasons.push("Provides direct funding"); }
      else if (p.type === "ANGEL_NETWORK") { score += 20; reasons.push("Angel investor access"); }
      else if (p.type === "GRANT") { score += 15; }
      break;
    case "team_building":
      if (p.type === "VENTURE_STUDIO") { score += 20; reasons.push("Venture studio: co-builds teams"); }
      else if (p.type === "ACCELERATOR") { score += 10; }
      break;
    case "market_validation":
      if (p.type === "ACCELERATOR") { score += 18; reasons.push("Accelerator: validates market fit"); }
      else if (p.type === "INCUBATOR") { score += 12; }
      break;
    case "scaling": {
      const growthFocused = p.stages.some((s) => ["SERIES_A", "SERIES_B_PLUS"].includes(s));
      if (growthFocused) { score += 20; reasons.push("Targets scale-up companies"); }
      else if (p.investmentMin && p.investmentMin >= 250000) { score += 15; }
      else if (p.type === "ACCELERATOR") { score += 10; }
      break;
    }
  }

  // 4. Support type match (0-20)
  switch (answers.supportType) {
    case "mentorship_networking":
      if (p.type === "ACCELERATOR" || p.type === "ANGEL_NETWORK") { score += 20; reasons.push("Strong mentorship & network"); }
      else if (p.type === "INCUBATOR") { score += 14; }
      else { score += 8; }
      break;
    case "funding_opps":
      if (p.investmentMin && p.investmentMin > 0) { score += 20; reasons.push("Direct investment opportunity"); }
      else if (p.type === "GRANT" || p.type === "ANGEL_NETWORK") { score += 20; }
      else { score += 5; }
      break;
    case "industry_resources": {
      const industryMatch = targetSectors.some((s) => p.sectors.includes(s));
      if (industryMatch) { score += 20; reasons.push("Specialist industry programme"); }
      else if (p.sectors.length === 0) { score += 10; }
      else { score += 5; }
      break;
    }
    case "biz_dev_sales":
      if (p.type === "ACCELERATOR") { score += 18; reasons.push("Accelerator: sales & GTM access"); }
      else { score += 8; }
      break;
    case "technical_expertise": {
      if (p.type === "INCUBATOR" || p.type === "VENTURE_STUDIO") { score += 20; reasons.push("Deep technical support"); }
      const techSectors = ["AI & Machine Learning", "Deep Tech", "Hardware & IoT", "Cybersecurity"];
      if (p.sectors.some((s) => techSectors.includes(s))) { score += 10; }
      break;
    }
  }

  // 5. Outcome match (0-10)
  switch (answers.outcome) {
    case "fundraising":
      if (p.investmentMin && p.investmentMin > 0) { score += 10; }
      else if (p.type === "ANGEL_NETWORK") { score += 10; }
      break;
    case "product_tech":
      if (p.type === "VENTURE_STUDIO" || p.type === "INCUBATOR") { score += 10; reasons.push("Product & tech focused"); }
      break;
    case "sales_gtm":
      if (p.type === "ACCELERATOR") { score += 10; }
      break;
    case "hiring_people":
      if (p.type === "VENTURE_STUDIO") { score += 10; reasons.push("Team-building expertise"); }
      break;
    case "pr_comms":
      score += p.isFeatured ? 10 : 5;
      if (p.isFeatured) reasons.push("High-profile programme");
      break;
  }

  return { score, reasons };
}

export async function POST(req: Request) {
  try {
    const body: MatchRequest = await req.json();

    const programmes = await prisma.programme.findMany({
      where: { isActive: true, NOT: { type: "VC" } },
      select: {
        id: true, slug: true, name: true, type: true, description: true,
        location: true, country: true, currency: true,
        stages: true, sectors: true,
        seisEligible: true, eisEligible: true,
        investmentMin: true, investmentMax: true, equityTaken: true,
        applicationDeadline: true, logoUrl: true,
        isFeatured: true, isSponsored: true,
      },
    });

    const scored = programmes
      .map((p) => {
        const { score, reasons } = scoreAndExplain(p, body);
        return { ...p, matchScore: score, matchReasons: reasons };
      })
      .filter((p) => p.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({ results: scored });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
