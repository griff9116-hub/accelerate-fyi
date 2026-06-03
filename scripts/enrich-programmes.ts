/**
 * Enriches programme records by scraping their websites and extracting
 * structured data using Claude. Only updates fields that are currently null/empty.
 *
 * Usage:
 *   npm run db:enrich                    # enrich all programmes missing data
 *   npm run db:enrich -- --limit 50      # process first 50
 *   npm run db:enrich -- --slug my-slug  # enrich one specific programme
 *
 * Set ANTHROPIC_API_KEY in your environment before running.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic();

const SECTOR_OPTIONS = [
  "AI & Machine Learning", "Fintech", "Healthtech", "Edtech", "Cleantech",
  "Deep Tech", "Consumer", "SaaS / B2B Software", "Marketplace", "Govtech",
  "Agritech", "Proptech", "Legaltech", "Media & Creative", "Social Impact",
  "Future of Work", "Cybersecurity", "Web3 & Crypto", "Hardware & IoT",
  "Space Tech", "Marinetech",
];

const STAGE_OPTIONS = ["PRE_IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B_PLUS"];

// ─── Fetch + strip HTML ───────────────────────────────────────────────────────

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AccelerateFYI/1.0; +https://accelerate-fyi.vercel.app)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();

    // Strip scripts, styles, nav, footer
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&#\d+;/g, " ")
      .replace(/\s{3,}/g, "\n")
      .trim();

    // Cap at 8000 chars — enough for Claude to understand the programme
    return cleaned.slice(0, 8000);
  } catch {
    return null;
  }
}

// ─── Claude extraction ────────────────────────────────────────────────────────

interface ExtractedData {
  sectors: string[];
  stages: string[];
  investmentMin: number | null;
  investmentMax: number | null;
  equityTaken: number | null;
  applyUrl: string | null;
  cohortSize: number | null;
  durationWeeks: number | null;
  isRemote: boolean | null;
  seisEligible: boolean | null;
  eisEligible: boolean | null;
  description: string | null;
}

async function extractWithClaude(
  name: string,
  pageText: string,
  websiteUrl: string
): Promise<ExtractedData | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Extract structured data from this accelerator/startup programme website. Return ONLY valid JSON, no commentary.

Programme name: ${name}
Website: ${websiteUrl}

Page content:
${pageText}

Return this exact JSON structure (use null if unknown):
{
  "sectors": [/* subset of: ${SECTOR_OPTIONS.join(", ")} */],
  "stages": [/* subset of: ${STAGE_OPTIONS.join(", ")} */],
  "investmentMin": null,
  "investmentMax": null,
  "equityTaken": null,
  "applyUrl": null,
  "cohortSize": null,
  "durationWeeks": null,
  "isRemote": null,
  "seisEligible": null,
  "eisEligible": null,
  "description": null
}

Rules:
- investmentMin/Max: integer in GBP/EUR (no symbols), e.g. 50000
- equityTaken: number only, e.g. 6 for 6%
- applyUrl: full URL to application form if different from main site
- cohortSize: approximate startups per cohort
- durationWeeks: programme length in weeks
- isRemote: true only if explicitly remote/hybrid option mentioned
- seisEligible/eisEligible: true only if explicitly mentioned
- description: 1-2 sentences summarising what the programme does and who it's for. Only provide if meaningfully better than the name alone.`,
        },
      ],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    // Extract JSON from response (Claude may add markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ExtractedData;
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf("--limit");
  const slugArg = args.indexOf("--slug");

  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : undefined;
  const targetSlug = slugArg !== -1 ? args[slugArg + 1] : undefined;

  // Find programmes that are missing enrichment data
  const where = targetSlug
    ? { slug: targetSlug }
    : {
        isActive: true,
        websiteUrl: { not: "" },
        OR: [
          { sectors: { isEmpty: true } },
          { investmentMin: null },
          { equityTaken: null },
          { applyUrl: null },
        ],
      };

  const programmes = await prisma.programme.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      websiteUrl: true,
      sectors: true,
      stages: true,
      investmentMin: true,
      investmentMax: true,
      equityTaken: true,
      applyUrl: true,
      cohortSize: true,
      durationWeeks: true,
      isRemote: true,
      seisEligible: true,
      eisEligible: true,
      description: true,
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  console.log(`Enriching ${programmes.length} programmes...`);

  let enriched = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < programmes.length; i++) {
    const p = programmes[i];
    console.log(`\n[${i + 1}/${programmes.length}] ${p.name}`);

    if (!p.websiteUrl) {
      console.log("  ⟳ No website URL — skipping");
      skipped++;
      continue;
    }

    // Fetch website
    const pageText = await fetchPageText(p.websiteUrl);
    if (!pageText) {
      console.log("  ✗ Could not fetch website");
      failed++;
      // Small delay even on failure
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    // Extract with Claude
    const extracted = await extractWithClaude(p.name, pageText, p.websiteUrl);
    if (!extracted) {
      console.log("  ✗ Claude extraction failed");
      failed++;
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    // Build update — only set fields that are currently missing
    const update: Record<string, unknown> = {};

    if (p.sectors.length === 0 && extracted.sectors?.length) {
      const validSectors = extracted.sectors.filter(s => SECTOR_OPTIONS.includes(s));
      if (validSectors.length) update.sectors = validSectors;
    }
    if (p.stages.length === 0 && extracted.stages?.length) {
      const validStages = extracted.stages.filter(s => STAGE_OPTIONS.includes(s));
      if (validStages.length) update.stages = validStages;
    }
    if (p.investmentMin === null && extracted.investmentMin) update.investmentMin = extracted.investmentMin;
    if (p.investmentMax === null && extracted.investmentMax) update.investmentMax = extracted.investmentMax;
    if (p.equityTaken === null && extracted.equityTaken !== null) update.equityTaken = extracted.equityTaken;
    if (!p.applyUrl && extracted.applyUrl) update.applyUrl = extracted.applyUrl;
    if (p.cohortSize === null && extracted.cohortSize) update.cohortSize = extracted.cohortSize;
    if (p.durationWeeks === null && extracted.durationWeeks) update.durationWeeks = extracted.durationWeeks;
    if (p.isRemote === false && extracted.isRemote === true) update.isRemote = true;
    if (p.seisEligible === false && extracted.seisEligible === true) update.seisEligible = true;
    if (p.eisEligible === false && extracted.eisEligible === true) update.eisEligible = true;
    if (extracted.description && p.description.length < 80) update.description = extracted.description;

    if (Object.keys(update).length === 0) {
      console.log("  ✓ Nothing new to update");
      skipped++;
    } else {
      await prisma.programme.update({ where: { id: p.id }, data: update });
      console.log(`  ✓ Updated: ${Object.keys(update).join(", ")}`);
      enriched++;
    }

    // Respectful rate limit: 1.5s between requests
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\nDone: ${enriched} enriched, ${skipped} unchanged, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
