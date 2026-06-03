/**
 * Enriches programme records by scraping their websites and extracting
 * structured data using regex patterns. Only updates fields that are currently null/empty.
 * No API key required.
 *
 * Usage:
 *   npm run db:enrich                    # enrich all programmes missing data
 *   npm run db:enrich -- --limit 50      # process first 50
 *   npm run db:enrich -- --slug my-slug  # enrich one specific programme
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SECTOR_OPTIONS = [
  "AI & Machine Learning", "Fintech", "Healthtech", "Edtech", "Cleantech",
  "Deep Tech", "Consumer", "SaaS / B2B Software", "Marketplace", "Govtech",
  "Agritech", "Proptech", "Legaltech", "Media & Creative", "Social Impact",
  "Future of Work", "Cybersecurity", "Web3 & Crypto", "Hardware & IoT",
  "Space Tech", "Marinetech",
];

const SECTOR_PATTERNS: Array<[RegExp, string]> = [
  [/fintech|financial\s+tech|banking.*tech|payment.*tech|insurtech|regtech|insurance\s+tech/i, "Fintech"],
  [/health.*tech|digital.*health|\bnhs\b|healthcare|medical.*tech|biomedical|pharma|life\s+science|biotech|clinical|medtech/i, "Healthtech"],
  [/\bai\b|artificial\s+intelligence|machine\s+learning|deep\s+learning|generative/i, "AI & Machine Learning"],
  [/clean.*tech|climate.*tech|renewable\s+energy|clean\s+energy|sustainability|carbon|net.?zero|green\s+tech|low\s+carbon/i, "Cleantech"],
  [/prop.*tech|property\s+tech|real\s+estate.*tech|geospatial|construction\s+tech/i, "Proptech"],
  [/edtech|education\s+tech|e-?learning|learning\s+tech|employability/i, "Edtech"],
  [/cyber.?security|information\s+security|cybersec/i, "Cybersecurity"],
  [/space\s+tech|spacetech|satellite|aerospace/i, "Space Tech"],
  [/deep\s+tech|deeptech|quantum|semiconductor|robotics|engineering\s+innov|hard\s+tech/i, "Deep Tech"],
  [/gov.*tech|public\s+sector.*tech|civic\s+tech|government.*innov/i, "Govtech"],
  [/agri.*tech|agriculture.*tech|food.*tech|precision\s+farm/i, "Agritech"],
  [/legal.*tech|law.*tech/i, "Legaltech"],
  [/media.*tech|music\s+tech|entertainment.*tech|creative.*tech|content\s+tech/i, "Media & Creative"],
  [/social\s+impact|social\s+enterprise/i, "Social Impact"],
  [/future.*work|hr\s+tech|talent\s+tech|workforce\s+tech/i, "Future of Work"],
  [/marketplace\s+tech|platform\s+business|two.?sided/i, "Marketplace"],
  [/consumer\s+tech|d2c|direct.?to.?consumer/i, "Consumer"],
  [/web3|blockchain|crypto|defi|distributed\s+ledger/i, "Web3 & Crypto"],
  [/hardware|\biot\b|internet.?of.?things|connected\s+device/i, "Hardware & IoT"],
  [/marine.*tech|maritime.*tech|ocean\s+tech/i, "Marinetech"],
];

// ─── Fetch page ────────────────────────────────────────────────────────────────

interface PageData {
  text: string;
  metaDescription: string | null;
  applyLinks: string[];
}

async function fetchPageData(url: string): Promise<PageData | null> {
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

    const metaDescription = extractMetaDescription(html);
    const applyLinks = extractApplyLinks(html, url);

    const text = html
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
      .trim()
      .slice(0, 8000);

    return { text, metaDescription, applyLinks };
  } catch {
    return null;
  }
}

function extractMetaDescription(html: string): string | null {
  const m =
    html.match(/<meta\s+(?:[^>]*\s+)?name=["']description["'][^>]*content=["']([^"']{10,300})["']/i) ??
    html.match(/<meta\s+content=["']([^"']{10,300})["'][^>]*name=["']description["']/i) ??
    html.match(/<meta\s+(?:[^>]*\s+)?property=["']og:description["'][^>]*content=["']([^"']{10,300})["']/i);
  return m ? m[1].trim() : null;
}

function extractApplyLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  let base: URL;
  try { base = new URL(baseUrl); } catch { return []; }

  const anchorRe = /<a\s[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const href = m[1].trim();
    const text = m[2].replace(/<[^>]+>/g, "").toLowerCase().trim();
    const lowerHref = href.toLowerCase();

    const isApplyLink =
      /apply|application|apply-now|submit-application|enrol|enroll/.test(lowerHref) ||
      /^apply(\s+now|\s+here)?$|^start\s+application$|^submit\s+application$/.test(text);

    if (isApplyLink) {
      try {
        const full = href.startsWith("http") ? href : new URL(href, base).toString();
        if (!links.includes(full)) links.push(full);
      } catch { /* skip invalid */ }
    }
  }
  return links.slice(0, 3);
}

// ─── Structured extraction ────────────────────────────────────────────────────

function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  const mMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*m(?:illion)?$/i);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1_000_000);
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*k$/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1_000);
  const numMatch = cleaned.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1]);
  return null;
}

function extractInvestment(text: string): { min: number | null; max: number | null } {
  const sentences = text.split(/[.\n]/).filter(s =>
    /invest|fund(?:ing)?|award|grant|offer|provid|receiv/i.test(s) && /[£€\$]/.test(s)
  );
  const ctx = sentences.join(" ") || text;

  // Range: £50,000–£100,000 or £50k–£100k
  const rangeMatch = ctx.match(
    /[£€\$]([\d,.]+\s*(?:k|m(?:illion)?)?)\s*[-–—to]+\s*[£€\$]([\d,.]+\s*(?:k|m(?:illion)?)?)/i
  );
  if (rangeMatch) {
    const min = parseMoney(rangeMatch[1]);
    const max = parseMoney(rangeMatch[2]);
    if (min && max && min <= max) return { min, max };
  }

  // "up to £X"
  const upTo = ctx.match(/up\s+to\s+[£€\$]([\d,.]+\s*(?:k|m(?:illion)?)?)/i);
  if (upTo) {
    const max = parseMoney(upTo[1]);
    if (max) return { min: null, max };
  }

  // Single amount
  const single = ctx.match(/[£€\$]([\d,.]+\s*(?:k|m(?:illion)?)?)/i);
  if (single) {
    const amt = parseMoney(single[1]);
    if (amt && amt >= 1000) return { min: amt, max: amt };
  }

  return { min: null, max: null };
}

function extractEquity(text: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*%\s+equity/i,
    /equity\s+(?:of|stake\s+of|at)\s+(\d+(?:\.\d+)?)\s*%/i,
    /take\s+(\d+(?:\.\d+)?)\s*%/i,
    /(\d+(?:\.\d+)?)\s*%\s+(?:stake|ownership|share)/i,
    /equity[^.]{0,30}(\d+(?:\.\d+)?)\s*%/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 0 && val <= 50) return val;
    }
  }
  return null;
}

function extractCohortSize(text: string): number | null {
  const patterns = [
    /cohort\s+of\s+(\d+)/i,
    /(\d+)\s+(?:startups?|companies|ventures?|teams?)\s+per\s+cohort/i,
    /accept(?:s|ing)?\s+(\d+)\s+(?:startups?|companies?|teams?)/i,
    /(\d+)\s+(?:startups?|companies?)\s+(?:join|selected|each\s+(?:year|cohort|round))/i,
    /intake\s+of\s+(\d+)/i,
    /select\s+(\d+)\s+(?:startups?|companies?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1]);
      if (n >= 2 && n <= 200) return n;
    }
  }
  return null;
}

function extractDurationWeeks(text: string): number | null {
  const durationCtx = text
    .split(/[.\n]/)
    .filter(s => /programme|program|duration|lasts?|runs?\s+for|over\s+\d|spanning|period/i.test(s))
    .join(" ");

  const src = durationCtx || text;

  const weeksMatch = src.match(/(\d+)[\s-]*weeks?/i);
  if (weeksMatch) return parseInt(weeksMatch[1]);

  const monthRange = src.match(/(\d+)\s*[-–]\s*(\d+)\s*months?/i);
  if (monthRange) return Math.round(((parseInt(monthRange[1]) + parseInt(monthRange[2])) / 2) * 4.3);

  const monthsMatch = src.match(/(\d+(?:\.\d+)?)\s*months?/i);
  if (monthsMatch) return Math.round(parseFloat(monthsMatch[1]) * 4.3);

  const yearsMatch = src.match(/(\d+)\s*years?/i);
  if (yearsMatch) {
    const y = parseInt(yearsMatch[1]);
    if (y <= 3) return y * 52;
  }

  return null;
}

function extractSectors(text: string): string[] {
  const sectors = new Set<string>();
  for (const [pattern, sector] of SECTOR_PATTERNS) {
    if (pattern.test(text)) sectors.add(sector);
  }
  if (sectors.size === 0 && /technology|tech|digital|software|startup|innovation/i.test(text)) {
    sectors.add("SaaS / B2B Software");
  }
  return [...sectors].slice(0, 5);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf("--limit");
  const slugArg = args.indexOf("--slug");

  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : undefined;
  const targetSlug = slugArg !== -1 ? args[slugArg + 1] : undefined;

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
      id: true, slug: true, name: true, websiteUrl: true,
      sectors: true, stages: true, investmentMin: true, investmentMax: true,
      equityTaken: true, applyUrl: true, cohortSize: true, durationWeeks: true,
      isRemote: true, seisEligible: true, eisEligible: true, description: true,
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

    const data = await fetchPageData(p.websiteUrl);
    if (!data) {
      console.log("  ✗ Could not fetch website");
      failed++;
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    const { text, metaDescription, applyLinks } = data;
    const update: Record<string, unknown> = {};

    // Description from meta/og tag
    if (metaDescription && p.description.length < 80) {
      update.description = metaDescription;
    }

    // Apply URL from link scanning
    if (!p.applyUrl && applyLinks.length > 0) {
      update.applyUrl = applyLinks[0];
    }

    // Sectors from keyword regex
    if (p.sectors.length === 0) {
      const sectors = extractSectors(text).filter(s => SECTOR_OPTIONS.includes(s));
      if (sectors.length) update.sectors = sectors;
    }

    // Investment amounts
    if (p.investmentMin === null && p.investmentMax === null) {
      const { min, max } = extractInvestment(text);
      if (min) update.investmentMin = min;
      if (max) update.investmentMax = max;
    }

    // Equity percentage
    if (p.equityTaken === null) {
      const eq = extractEquity(text);
      if (eq !== null) update.equityTaken = eq;
    }

    // Cohort size
    if (p.cohortSize === null) {
      const cs = extractCohortSize(text);
      if (cs) update.cohortSize = cs;
    }

    // Duration
    if (p.durationWeeks === null) {
      const dw = extractDurationWeeks(text);
      if (dw) update.durationWeeks = dw;
    }

    // Remote / hybrid
    if (!p.isRemote && /\bremote\b|\bhybrid\b|online\s+programme|virtual\s+programme/i.test(text)) {
      update.isRemote = true;
    }

    // SEIS / EIS mentions
    if (!p.seisEligible && /\bSEIS\b/.test(text)) update.seisEligible = true;
    if (!p.eisEligible && /\bEIS\b/.test(text)) update.eisEligible = true;

    if (Object.keys(update).length === 0) {
      console.log("  ✓ Nothing new to update");
      skipped++;
    } else {
      await prisma.programme.update({ where: { id: p.id }, data: update });
      console.log(`  ✓ Updated: ${Object.keys(update).join(", ")}`);
      enriched++;
    }

    // 1s between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nDone: ${enriched} enriched, ${skipped} unchanged, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
