/**
 * Imports accelerators from a Beauhurst CSV export into the database.
 * Safe to run multiple times — skips programmes that already exist by name or slug.
 *
 * Usage: npm run db:import-beauhurst
 * Or:    npm run db:import-beauhurst -- data/beauhurst-accelerators.csv
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type Stage = "PRE_IDEA" | "PRE_SEED" | "SEED" | "SERIES_A" | "SERIES_B_PLUS" | "ANY";

// ─── Slugify ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ─── Sector inference ─────────────────────────────────────────────────────────

const SECTOR_PATTERNS: Array<[RegExp, string]> = [
  [/fintech|financial\s+tech|banking.*tech|payment.*tech|insurtech|regtech|lending.*tech|insurance\s+tech/i, "Fintech"],
  [/health.*tech|digital.*health|\bnhs\b|healthcare|medical.*tech|biomedical|pharma|life\s+science|biotech|clinical|medtech/i, "Healthtech"],
  [/\bai\b|artificial\s+intelligence|machine\s+learning|deep\s+learning|generative/i, "AI & Machine Learning"],
  [/clean.*tech|climate.*tech|renewable\s+energy|clean\s+energy|sustainability|carbon|net.?zero|green\s+tech|low\s+carbon/i, "Cleantech"],
  [/prop.*tech|property\s+tech|real\s+estate.*tech|geospatial|construction\s+tech|hm\s+land\s+registry/i, "Proptech"],
  [/edtech|education\s+tech|e-?learning|learning\s+tech|employability/i, "Edtech"],
  [/cyber.?security|information\s+security|cybersec|lorca/i, "Cybersecurity"],
  [/space\s+tech|spacetech|\besa\b.*incubat|satellite|aerospace/i, "Space Tech"],
  [/deep\s+tech|deeptech|quantum|semiconductor|robotics|engineering\s+innov|hard\s+tech|science.*commerciali/i, "Deep Tech"],
  [/gov.*tech|public\s+sector.*tech|civic\s+tech|government.*innov/i, "Govtech"],
  [/agri.*tech|agriculture.*tech|food.*tech|precision\s+farm/i, "Agritech"],
  [/legal.*tech|law.*tech|dealtech|lawtech/i, "Legaltech"],
  [/media.*tech|music\s+tech|entertainment.*tech|creative.*tech|content\s+tech/i, "Media & Creative"],
  [/social\s+impact|social\s+enterprise|social.*challenge|positive.*social|societal/i, "Social Impact"],
  [/future.*work|hr\s+tech|talent\s+tech|workforce\s+tech/i, "Future of Work"],
  [/marketplace\s+tech|platform\s+business|two.?sided/i, "Marketplace"],
  [/consumer\s+tech|d2c|direct.?to.?consumer/i, "Consumer"],
  [/web3|blockchain|crypto|defi|distributed\s+ledger/i, "Web3 & Crypto"],
  [/hardware|\biot\b|internet.?of.?things|physical\s+product.*tech|connected\s+device/i, "Hardware & IoT"],
  [/marine.*tech|maritime.*tech|ocean\s+tech/i, "Marinetech"],
  [/transport|mobility\s+tech|autonomous\s+vehicle|smart\s+city|travel.*tech/i, "Future of Work"],
];

// Perks → sector hints
const PERK_SECTOR_HINTS: Array<[RegExp, string]> = [
  [/financial\s+investment/i, "SaaS / B2B Software"], // generic fallback
];

function inferSectors(summary: string, eligibility: string): string[] {
  const text = `${summary} ${eligibility}`;
  const sectors = new Set<string>();

  for (const [pattern, sector] of SECTOR_PATTERNS) {
    if (pattern.test(text)) sectors.add(sector);
  }

  // Generic tech fallback
  if (sectors.size === 0 && /technology|tech|digital|software|startup|innovation/i.test(text)) {
    sectors.add("SaaS / B2B Software");
  }

  return [...sectors].slice(0, 5);
}

// ─── Stage inference ──────────────────────────────────────────────────────────

function inferStages(summary: string, eligibility: string): Stage[] {
  const text = `${summary} ${eligibility}`.toLowerCase();
  const stages = new Set<Stage>();

  if (/pre.?idea|co.?founder\s+match|before.*start|no.*co.?founder|putting.*entrepreneur.*together/i.test(text)) {
    stages.add("PRE_IDEA");
  }
  if (/pre.?seed|very\s+early|prototype|mvp|minimum\s+viable|early.?stage.*start|concept\s+stage|idea\s+stage|proof\s+of\s+concept/i.test(text)) {
    stages.add("PRE_SEED");
  }
  if (/seed\s+stage|seed\s+fund|first\s+revenue|early\s+traction|series\s+a.*eligible|raising.*first\s+round/i.test(text)) {
    stages.add("SEED");
  }
  if (/series\s+a|scale.?up|scaling\s+business|growth\s+stage|£1m.*revenue|€1m.*revenue|10%.*month/i.test(text)) {
    stages.add("SERIES_A");
  }

  if (stages.size === 0) stages.add("PRE_SEED");
  return [...stages];
}

// ─── Duration parsing ─────────────────────────────────────────────────────────

function parseDurationWeeks(raw: string): number | null {
  if (!raw?.trim()) return null;

  const weeksMatch = raw.match(/(\d+)\s*weeks?/i);
  if (weeksMatch) return parseInt(weeksMatch[1]);

  const monthsMatch = raw.match(/(\d+(?:\.\d+)?)\s*months?/i);
  if (monthsMatch) return Math.round(parseFloat(monthsMatch[1]) * 4.3);

  const monthRange = raw.match(/(\d+)\s*-\s*(\d+)\s*months?/i);
  if (monthRange) return Math.round(((parseInt(monthRange[1]) + parseInt(monthRange[2])) / 2) * 4.3);

  const yearsMatch = raw.match(/(\d+)\s*years?/i);
  if (yearsMatch) return parseInt(yearsMatch[1]) * 52;

  const yearRange = raw.match(/(\d+)\s*-\s*(\d+)\s*years?/i);
  if (yearRange) return Math.round(((parseInt(yearRange[1]) + parseInt(yearRange[2])) / 2) * 52);

  return null;
}

// ─── Location mapping ─────────────────────────────────────────────────────────

const REGION_TO_CITY: Record<string, string> = {
  "London": "London",
  "East of England": "Cambridge",
  "South East": "Oxford",
  "South West": "Bristol",
  "East Midlands": "Nottingham",
  "West Midlands": "Birmingham",
  "Yorkshire and The Humber": "Leeds",
  "Yorkshire and the Humber": "Leeds",
  "North East": "Newcastle",
  "North West": "Manchester",
  "Scotland": "Edinburgh",
  "East of Scotland": "Edinburgh",
  "West of Scotland": "Glasgow",
  "Tayside": "Dundee",
  "Highlands and Islands": "Inverness",
  "Aberdeen": "Aberdeen",
  "Wales": "Cardiff",
  "Northern Ireland": "Belfast",
};

const LOCAL_AUTH_OVERRIDE: Record<string, string> = {
  "Cambridge": "Cambridge",
  "Oxford": "Oxford",
  "Manchester": "Manchester",
  "Birmingham": "Birmingham",
  "Bristol": "Bristol",
  "Leeds": "Leeds",
  "Sheffield": "Sheffield",
  "Liverpool": "Liverpool",
  "Newcastle upon Tyne": "Newcastle",
  "Edinburgh": "Edinburgh",
  "Glasgow City": "Glasgow",
  "Cardiff": "Cardiff",
  "Belfast": "Belfast",
  "Aberdeen City": "Aberdeen",
  "Coventry": "Coventry",
  "Southampton": "Southampton",
  "Brighton and Hove": "Brighton",
  "Exeter": "Exeter",
  "Bath and North East Somerset": "Bath",
  "South Cambridgeshire": "Cambridge",
  "Cambridge": "Cambridge",
  "Vale of White Horse": "Oxford",
  "Middlesbrough": "Middlesbrough",
  "Newport": "Newport",
  "Hackney": "London",
  "Westminster": "London",
  "Southwark": "London",
  "City of London": "London",
  "Camden": "London",
  "Islington": "London",
  "Tower Hamlets": "London",
  "Hammersmith and Fulham": "London",
  "Kensington and Chelsea": "London",
  "Wandsworth": "London",
  "Hillingdon": "London",
  "Ealing": "London",
};

function getCity(region: string, localAuth: string): string {
  if (localAuth && LOCAL_AUTH_OVERRIDE[localAuth]) return LOCAL_AUTH_OVERRIDE[localAuth];
  if (region && REGION_TO_CITY[region]) return REGION_TO_CITY[region];
  return localAuth || region || "UK-wide";
}

// ─── Date parsing ─────────────────────────────────────────────────────────────

function parseDate(raw: string): Date | null {
  if (!raw?.trim()) return null;
  // ISO format: YYYY-MM-DD
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}`);
    // Skip past dates
    if (d > new Date()) return d;
    return null;
  }
  return null;
}

// ─── CSV parser (handles multi-line quoted fields) ────────────────────────────

function parseCSV(content: string): string[][] {
  const records: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field);
        field = "";
      } else if (ch === '\n') {
        current.push(field);
        records.push(current);
        current = [];
        field = "";
      } else if (ch !== '\r') {
        field += ch;
      }
    }
  }

  if (current.length > 0 || field) {
    current.push(field);
    if (current.some(f => f.trim())) records.push(current);
  }

  return records;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2] ?? "data/beauhurst-accelerators.csv";
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const rows = parseCSV(content);
  const data = rows.slice(1).filter(r => r.length >= 12);

  console.log(`Parsed ${data.length} records from ${path.basename(fullPath)}`);

  // Load existing records for deduplication
  const existing = await prisma.programme.findMany({
    select: { slug: true, name: true },
  });
  const existingSlugs = new Set(existing.map(p => p.slug));
  const existingNames = new Set(existing.map(p => p.name.toLowerCase().trim()));
  console.log(`Existing programmes in DB: ${existing.length}`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of data) {
    const name = row[0]?.trim();
    if (!name) { skipped++; continue; }

    // Skip if already exists by name
    if (existingNames.has(name.toLowerCase().trim())) {
      console.log(`  ⟳ Skipped (exists): ${name}`);
      skipped++;
      continue;
    }

    const websiteRaw = row[12]?.trim() || "";
    const websiteUrl = websiteRaw.startsWith("http") ? websiteRaw : websiteRaw ? `https://${websiteRaw}` : "";
    const summary = row[9]?.trim() || "";
    const eligibility = row[10]?.trim() || "";
    const region = row[16]?.trim() || "";
    const localAuth = row[15]?.trim() || "";
    const durationRaw = row[6]?.trim() || "";
    const deadlineRaw = row[5]?.trim() || "";

    const country = "UK";
    const location = getCity(region, localAuth);
    const sectors = inferSectors(summary, eligibility);
    const stages = inferStages(summary, eligibility);
    const durationWeeks = parseDurationWeeks(durationRaw);
    const applicationDeadline = parseDate(deadlineRaw);
    const description = summary || `${name} is a startup accelerator programme based in ${location}.`;

    // Generate unique slug
    let slug = slugify(name);
    if (existingSlugs.has(slug)) {
      slug = `${slug}-uk`;
      if (existingSlugs.has(slug)) {
        // Final fallback with location
        slug = `${slugify(name)}-${slugify(location)}`;
        if (existingSlugs.has(slug)) {
          console.log(`  ⟳ Skipped (slug conflict): ${name}`);
          skipped++;
          continue;
        }
      }
    }

    try {
      await prisma.programme.create({
        data: {
          slug,
          name,
          type: "ACCELERATOR",
          country,
          currency: "GBP",
          location,
          description,
          websiteUrl,
          applyUrl: null,
          sectors,
          stages,
          durationWeeks,
          applicationDeadline,
          isActive: true,
          isFeatured: false,
          isSponsored: false,
        },
      });
      existingSlugs.add(slug);
      existingNames.add(name.toLowerCase().trim());
      console.log(`  ✓ ${name} (${location}${sectors.length ? ` · ${sectors.slice(0, 2).join(", ")}` : ""})`);
      created++;
    } catch (err) {
      console.error(`  ✗ Error "${name}":`, err instanceof Error ? err.message : err);
      errors++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
