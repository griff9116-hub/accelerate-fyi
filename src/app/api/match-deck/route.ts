import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

interface DeckProfile {
  companyName: string | null;
  stage: string;
  sectors: string[];
  businessModel: string;
  marketSize: string;
  tractionSummary: string;
  teamStrength: number;
  deckQuality: number;
  strengths: string[];
  gaps: string[];
}

export async function POST(req: NextRequest) {
  let deckText = "";
  let name = "";
  let email = "";

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    name = (form.get("name") as string) ?? "";
    email = (form.get("email") as string) ?? "";
    const file = form.get("deck") as File | null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const parsed = await pdfParse(buffer);
      deckText = parsed.text.slice(0, 12000);
    } else {
      deckText = ((form.get("text") as string) ?? "").slice(0, 12000);
    }
  } else {
    const body = await req.json();
    name = body.name ?? "";
    email = body.email ?? "";
    deckText = (body.text ?? "").slice(0, 12000);
  }

  if (!name.trim() || !email.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!deckText.trim()) {
    return NextResponse.json({ error: "No deck content provided" }, { status: 400 });
  }

  // Analyse with Claude
  const client = new Anthropic();
  let profile: DeckProfile;

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyse this startup pitch deck and extract structured data. Return ONLY valid JSON with no markdown or explanation.

Deck content:
${deckText}

Return exactly this JSON structure:
{
  "companyName": "string or null",
  "stage": "PRE_IDEA or PRE_SEED or SEED or SERIES_A",
  "sectors": ["array matching from: AI & Machine Learning, Fintech, Healthtech, Edtech, Cleantech, Deep Tech, Consumer, SaaS / B2B Software, Marketplace, Govtech, Agritech, Proptech, Legaltech, Media & Creative, Social Impact, Future of Work, Cybersecurity, Web3 & Crypto, Hardware & IoT, Space Tech, Marinetech"],
  "businessModel": "1-sentence description",
  "marketSize": "1-sentence description",
  "tractionSummary": "1-sentence description of traction or revenue, or 'Pre-revenue' if none",
  "teamStrength": 1-5,
  "deckQuality": 1-5,
  "strengths": ["up to 3 key strengths as short strings"],
  "gaps": ["up to 3 key gaps or weaknesses as short strings"]
}`,
        },
      ],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    profile = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to analyse deck. Please try again." }, { status: 500 });
  }

  // Save lead to DB
  await prisma.deckReview.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      companyName: profile.companyName ?? null,
      stage: profile.stage ?? null,
      sectors: profile.sectors ?? [],
      deckQuality: profile.deckQuality ?? null,
      teamScore: profile.teamStrength ?? null,
      strengths: profile.strengths ?? [],
      gaps: profile.gaps ?? [],
    },
  });

  // Score programmes
  const programmes = await prisma.programme.findMany({
    where: { isActive: true, NOT: { type: "VC" } },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      country: true,
      location: true,
      sectors: true,
      stages: true,
      investmentMin: true,
      investmentMax: true,
      equityTaken: true,
      currency: true,
      description: true,
      applyUrl: true,
      websiteUrl: true,
    },
  });

  const STAGE_ORDER = ["PRE_IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B_PLUS", "ANY"];
  const deckStageIdx = STAGE_ORDER.indexOf(profile.stage);

  const scored = programmes.map((p) => {
    let score = 0;
    const reasons: string[] = [];

    // Stage match (0–30)
    const stageMatch = p.stages.length === 0 || p.stages.some((s) => {
      if (s === "ANY") return true;
      const idx = STAGE_ORDER.indexOf(s);
      return Math.abs(idx - deckStageIdx) <= 1;
    });
    if (p.stages.includes(profile.stage as never)) { score += 30; reasons.push("Stage is a direct match"); }
    else if (stageMatch) { score += 15; reasons.push("Stage is close"); }

    // Sector overlap (0–30)
    const overlap = (profile.sectors ?? []).filter((s) => p.sectors.includes(s));
    score += Math.min(overlap.length * 15, 30);
    if (overlap.length) reasons.push(`Invests in ${overlap.join(", ")}`);

    // Deck quality / team (0–20)
    score += ((profile.deckQuality ?? 3) - 1) * 3;
    score += ((profile.teamStrength ?? 3) - 1) * 4;

    // Traction bonus for seed+ programmes
    if (profile.tractionSummary && profile.tractionSummary !== "Pre-revenue") {
      if (p.stages.includes("SEED" as never) || p.stages.includes("SERIES_A" as never)) {
        score += 5;
        reasons.push("Programme values traction");
      }
    }

    return {
      ...p,
      fitScore: Math.min(Math.round(score), 100),
      fitReasons: reasons,
      applicationDeadline: null as null,
      nextCohortDate: null as null,
      avgRating: null as number | null,
      reviewCount: 0,
    };
  });

  const results = scored
    .filter((p) => p.fitScore > 10)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 15);

  return NextResponse.json({ profile, results });
}
