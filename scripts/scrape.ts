/**
 * Scrapes F6S public API for UK and European accelerator/startup programmes.
 * Outputs to scripts/scraped-data.json for review before import.
 *
 * Usage: npm run scrape
 * Requires: NODE_ENV with network access. No API key needed for public F6S data.
 */

import * as fs from "fs";
import * as path from "path";

interface F6SOpportunity {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  apply_url: string;
  website: string;
  type: string;
  deadline: string | null;
}

interface F6SResponse {
  opportunities: F6SOpportunity[];
  total: number;
  offset: number;
}

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

const COUNTRY_MAP: Record<string, string> = {
  "United Kingdom": "UK",
  "GB": "UK",
  "UK": "UK",
  "Germany": "Germany",
  "DE": "Germany",
  "France": "France",
  "FR": "France",
  "Netherlands": "Netherlands",
  "NL": "Netherlands",
  "Sweden": "Sweden",
  "SE": "Sweden",
  "Spain": "Spain",
  "ES": "Spain",
  "Ireland": "Ireland",
  "IE": "Ireland",
  "Estonia": "Estonia",
  "EE": "Estonia",
  "Denmark": "Denmark",
  "DK": "Denmark",
  "Finland": "Finland",
  "FI": "Finland",
  "Norway": "Norway",
  "NO": "Norway",
  "Switzerland": "Switzerland",
  "CH": "Switzerland",
  "Belgium": "Belgium",
  "BE": "Belgium",
  "Portugal": "Portugal",
  "PT": "Portugal",
  "Italy": "Italy",
  "IT": "Italy",
  "Austria": "Austria",
  "AT": "Austria",
  "Poland": "Poland",
  "PL": "Poland",
};

const TYPE_MAP: Record<string, string> = {
  "accelerator": "ACCELERATOR",
  "incubator": "INCUBATOR",
  "investor": "VC",
  "angel": "ANGEL_NETWORK",
  "grant": "GRANT",
  "competition": "GRANT",
  "startup program": "ACCELERATOR",
  "startup programme": "ACCELERATOR",
};

function normaliseCountry(raw: string): string | null {
  const mapped = COUNTRY_MAP[raw] || COUNTRY_MAP[raw?.toUpperCase()];
  return mapped || null;
}

function normaliseType(raw: string): string {
  const lower = raw?.toLowerCase() || "";
  for (const [key, val] of Object.entries(TYPE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "ACCELERATOR";
}

async function fetchF6SPage(type: string, country: string, offset: number): Promise<F6SResponse> {
  const url = `https://api.f6s.com/opportunities?type=${encodeURIComponent(type)}&country=${encodeURIComponent(country)}&limit=100&offset=${offset}`;
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; accelerate-fyi-scraper/1.0)",
    },
  });
  if (!res.ok) {
    console.warn(`  F6S API returned ${res.status} for ${type}/${country}`);
    return { opportunities: [], total: 0, offset };
  }
  return res.json() as Promise<F6SResponse>;
}

async function scrapeF6S(): Promise<ScrapedProgramme[]> {
  const results: ScrapedProgramme[] = [];
  const seen = new Set<string>();

  const types = ["accelerator", "incubator"];
  const countries = ["GB", "DE", "FR", "NL", "SE", "ES", "IE", "EE", "DK", "FI", "NO", "BE", "PT", "AT", "PL", "CH"];

  for (const type of types) {
    for (const country of countries) {
      let offset = 0;
      let total = Infinity;

      while (offset < total && offset < 300) {
        try {
          const data = await fetchF6SPage(type, country, offset);
          total = data.total || 0;

          for (const opp of data.opportunities || []) {
            const key = `f6s-${opp.id}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const normCountry = normaliseCountry(opp.country);
            if (!normCountry) continue;

            results.push({
              name: opp.name?.trim(),
              description: opp.description?.trim()?.slice(0, 500) || "",
              website: opp.website || opp.apply_url || "",
              applyUrl: opp.apply_url || "",
              location: opp.city || "",
              country: normCountry,
              type: normaliseType(opp.type || type),
              source: "f6s",
              sourceId: String(opp.id),
              applicationDeadline: opp.deadline || null,
            });
          }

          offset += 100;
          if (data.opportunities?.length < 100) break;

          // polite rate limiting
          await new Promise((r) => setTimeout(r, 500));
        } catch (err) {
          console.warn(`  Error fetching ${type}/${country} offset ${offset}:`, err);
          break;
        }
      }
    }
  }

  return results;
}

async function main() {
  console.log("Starting F6S scrape...");
  const programmes = await scrapeF6S();

  const valid = programmes.filter((p) => p.name && p.country);
  console.log(`\nScraped ${valid.length} programmes from F6S (${programmes.length - valid.length} skipped).`);

  const outputPath = path.join(__dirname, "scraped-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(valid, null, 2), "utf-8");
  console.log(`\nSaved to ${outputPath}`);
  console.log("Review the file, then run: npm run db:import");
}

main().catch(console.error);
