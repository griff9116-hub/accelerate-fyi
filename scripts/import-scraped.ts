/**
 * Imports scraped-data.json into the database via Prisma upsert.
 * Safe to run multiple times — won't duplicate or overwrite existing records.
 *
 * Usage: npm run db:import
 * Requires: DATABASE_URL env var set (e.g. in .env.local)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ScrapedProgramme {
  name: string;
  description: string;
  website: string;
  applyUrl: string;
  location: string;
  country: string;
  type: string;
  source: string;
  sourceId: string;
  applicationDeadline: string | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function currencyForCountry(country: string): string {
  const gbp = ["UK"];
  return gbp.includes(country) ? "GBP" : "EUR";
}

async function main() {
  const inputPath = path.join(__dirname, "scraped-data.json");
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    console.error("Run npm run scrape first.");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf-8");
  const programmes: ScrapedProgramme[] = JSON.parse(raw);
  console.log(`Importing ${programmes.length} programmes...`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of programmes) {
    if (!p.name || !p.country) {
      skipped++;
      continue;
    }

    const baseSlug = slugify(p.name);
    if (!baseSlug) {
      skipped++;
      continue;
    }

    // Find a unique slug — append source suffix if needed
    let slug = baseSlug;
    const existing = await prisma.programme.findUnique({ where: { slug } });
    if (existing) {
      // Check if it's the same programme by name similarity
      if (existing.name.toLowerCase().trim() === p.name.toLowerCase().trim()) {
        skipped++;
        continue;
      }
      // Different programme with same slug — append country suffix
      slug = `${baseSlug}-${p.country.toLowerCase().replace(/\s+/g, "-")}`;
      const existing2 = await prisma.programme.findUnique({ where: { slug } });
      if (existing2) {
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
          name: p.name,
          type: (p.type as "ACCELERATOR" | "VC" | "VENTURE_STUDIO" | "ANGEL_NETWORK" | "INCUBATOR" | "GRANT") || "ACCELERATOR",
          description: p.description || `${p.name} is a startup programme based in ${p.location || p.country}.`,
          websiteUrl: p.website || "",
          applyUrl: p.applyUrl || p.website || null,
          location: p.location || "",
          country: p.country,
          currency: currencyForCountry(p.country),
          sectors: [],
          stages: [],
          isActive: true,
          isFeatured: false,
          isSponsored: false,
          seisEligible: p.country === "UK",
          applicationDeadline: p.applicationDeadline ? new Date(p.applicationDeadline) : null,
        },
      });
      created++;
    } catch (err) {
      console.error(`  Error importing "${p.name}":`, err);
      errors++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (duplicates), ${errors} errors.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
