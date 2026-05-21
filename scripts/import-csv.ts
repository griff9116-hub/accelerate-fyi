/**
 * Imports programmes from a filled-in CSV template into the database.
 * Safe to run multiple times — skips programmes that already exist by name.
 *
 * Usage: npm run db:import-csv -- templates/programmes-template.csv
 * Or:    npm run db:import-csv -- /path/to/my-programmes.csv
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type ProgrammeType = "ACCELERATOR" | "VC" | "VENTURE_STUDIO" | "ANGEL_NETWORK" | "INCUBATOR" | "GRANT";
type Stage = "PRE_IDEA" | "PRE_SEED" | "SEED" | "SERIES_A" | "SERIES_B_PLUS" | "ANY";

const TYPE_MAP: Record<string, ProgrammeType> = {
  "accelerator": "ACCELERATOR",
  "venture studio": "VENTURE_STUDIO",
  "incubator": "INCUBATOR",
  "grant": "GRANT",
  "angel network": "ANGEL_NETWORK",
  "vc": "VC",
};

const STAGE_MAP: Record<string, Stage> = {
  "pre-idea": "PRE_IDEA",
  "pre idea": "PRE_IDEA",
  "pre-seed": "PRE_SEED",
  "pre seed": "PRE_SEED",
  "seed": "SEED",
  "series a": "SERIES_A",
  "series-a": "SERIES_A",
  "series b": "SERIES_B_PLUS",
  "series b+": "SERIES_B_PLUS",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseType(raw: string): ProgrammeType {
  return TYPE_MAP[raw.trim().toLowerCase()] ?? "ACCELERATOR";
}

function parseStages(raw: string): Stage[] {
  if (!raw?.trim()) return [];
  return raw.split("|").map((s) => STAGE_MAP[s.trim().toLowerCase()]).filter(Boolean) as Stage[];
}

function parseSectors(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw.split("|").map((s) => s.trim()).filter(Boolean);
}

function parseBoolean(raw: string): boolean {
  return raw?.trim().toLowerCase() === "yes";
}

function parseNumber(raw: string): number | null {
  const n = parseInt(raw?.trim(), 10);
  return isNaN(n) ? null : n;
}

function parseFloat2(raw: string): number | null {
  const n = parseFloat(raw?.trim());
  return isNaN(n) ? null : n;
}

function parseDate(raw: string): Date | null {
  if (!raw?.trim()) return null;
  const [day, month, year] = raw.trim().split("/");
  if (!day || !month || !year) return null;
  const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  return isNaN(d.getTime()) ? null : d;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter(Boolean);
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let headerFound = false;

  for (const line of lines) {
    const cols = parseCSVLine(line);

    // Skip instruction/option rows
    if (cols[0]?.startsWith("INSTRUCTIONS") || cols[0]?.startsWith("TYPE OPTIONS") ||
        cols[0]?.startsWith("STAGE OPTIONS") || cols[0]?.startsWith("SECTOR OPTIONS") ||
        cols[0]?.startsWith("COUNTRY OPTIONS")) continue;

    // Detect header row
    if (!headerFound && cols[0] === "Name *") {
      headers = cols.map((h) => h.replace(" *", "").trim());
      headerFound = true;
      continue;
    }

    if (!headerFound) continue;

    // Skip empty rows
    if (!cols[0]?.trim()) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (cols[i] ?? "").trim(); });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  const filePath = process.argv[2] ?? "templates/programmes-template.csv";
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const rows = parseCSV(content);
  console.log(`Parsed ${rows.length} programme rows from ${path.basename(fullPath)}`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const name = row["Name"]?.trim();
    if (!name) { skipped++; continue; }

    const baseSlug = slugify(name);
    const country = row["Country"]?.trim() || "UK";
    const currency = row["Currency"]?.trim().toUpperCase() === "EUR" ? "EUR" : "GBP";

    // Check for existing by slug, append country suffix if collision with different programme
    let slug = baseSlug;
    const existing = await prisma.programme.findUnique({ where: { slug } });
    if (existing) {
      if (existing.name.toLowerCase().trim() === name.toLowerCase().trim()) {
        console.log(`  ⟳ Skipped (already exists): ${name}`);
        skipped++;
        continue;
      }
      slug = `${baseSlug}-${country.toLowerCase().replace(/\s+/g, "-")}`;
      const existing2 = await prisma.programme.findUnique({ where: { slug } });
      if (existing2) {
        console.log(`  ⟳ Skipped (slug conflict): ${name}`);
        skipped++;
        continue;
      }
    }

    try {
      await prisma.programme.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name,
          type: parseType(row["Type"] ?? ""),
          country,
          currency,
          location: row["City"]?.trim() || "",
          description: row["Description"]?.trim() || `${name} is a startup programme based in ${country}.`,
          websiteUrl: row["Website URL"]?.trim() || "",
          applyUrl: row["Apply URL"]?.trim() || null,
          sectors: parseSectors(row["Sectors (pipe-separated)"] ?? ""),
          stages: parseStages(row["Stages (pipe-separated)"] ?? ""),
          investmentMin: parseNumber(row["Investment Min (number only)"] ?? ""),
          investmentMax: parseNumber(row["Investment Max (number only)"] ?? ""),
          equityTaken: parseFloat2(row["Equity %"] ?? ""),
          seisEligible: parseBoolean(row["SEIS Eligible (yes/no)"] ?? ""),
          eisEligible: parseBoolean(row["EIS Eligible (yes/no)"] ?? ""),
          isRemote: parseBoolean(row["Remote/Hybrid (yes/no)"] ?? ""),
          cohortSize: parseNumber(row["Cohort Size"] ?? ""),
          durationWeeks: parseNumber(row["Duration (weeks)"] ?? ""),
          applicationDeadline: parseDate(row["Application Deadline (DD/MM/YYYY)"] ?? ""),
          nextCohortDate: parseDate(row["Next Cohort Date (DD/MM/YYYY)"] ?? ""),
          isFeatured: parseBoolean(row["Featured (yes/no)"] ?? ""),
          isSponsored: false,
          isActive: true,
        },
      });
      console.log(`  ✓ ${name} (${country})`);
      created++;
    } catch (err) {
      console.error(`  ✗ Error importing "${name}":`, err);
      errors++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
