import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function main() {
  console.log("Creating tables via HTTP...");

  await sql`
    CREATE TABLE IF NOT EXISTS "Programme" (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      "websiteUrl" TEXT NOT NULL,
      "applyUrl" TEXT,
      description TEXT NOT NULL,
      "logoUrl" TEXT,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      "isRemote" BOOLEAN NOT NULL DEFAULT false,
      sectors TEXT[] NOT NULL DEFAULT '{}',
      stages TEXT[] NOT NULL DEFAULT '{}',
      "seisEligible" BOOLEAN NOT NULL DEFAULT false,
      "eisEligible" BOOLEAN NOT NULL DEFAULT false,
      "equityTaken" DOUBLE PRECISION,
      "investmentMin" INTEGER,
      "investmentMax" INTEGER,
      "cohortSize" INTEGER,
      "durationWeeks" INTEGER,
      "applicationDeadline" TIMESTAMPTZ,
      "nextCohortDate" TIMESTAMPTZ,
      "isFeatured" BOOLEAN NOT NULL DEFAULT false,
      "isSponsored" BOOLEAN NOT NULL DEFAULT false,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Review" (
      id TEXT PRIMARY KEY,
      "programmeId" TEXT NOT NULL REFERENCES "Programme"(id),
      "authorName" TEXT NOT NULL,
      "cohortYear" INTEGER,
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      "isApproved" BOOLEAN NOT NULL DEFAULT false,
      "overallRating" INTEGER NOT NULL,
      "equityRating" INTEGER,
      "mentorRating" INTEGER,
      "networkRating" INTEGER,
      body TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "AlertSubscription" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      sectors TEXT[] NOT NULL DEFAULT '{}',
      stages TEXT[] NOT NULL DEFAULT '{}',
      location TEXT,
      "seisOnly" BOOLEAN NOT NULL DEFAULT false,
      types TEXT[] NOT NULL DEFAULT '{}',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "AlertMatch" (
      id TEXT PRIMARY KEY,
      "alertId" TEXT NOT NULL REFERENCES "AlertSubscription"(id),
      "programmeId" TEXT NOT NULL REFERENCES "Programme"(id),
      "sentAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE("alertId", "programmeId")
    )
  `;

  console.log("Tables created. Seeding programmes...");

  const programmes = [
    { slug: "entrepreneur-first", name: "Entrepreneur First", websiteUrl: "https://www.joinef.com", applyUrl: "https://www.joinef.com/apply", description: "EF is the world's leading talent investor. They invest in exceptional individuals before they have a co-founder or idea, and help them form companies. EF backs deep tech, AI, and enterprise software founders at the earliest possible stage.", type: "ACCELERATOR", location: "London", isRemote: false, sectors: ["AI & Machine Learning","Deep Tech","SaaS / B2B Software"], stages: ["PRE_IDEA"], seisEligible: true, eisEligible: false, equityTaken: 10, investmentMin: 80000, investmentMax: 80000, cohortSize: 80, durationWeeks: 12, isFeatured: true, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "antler-uk", name: "Antler", websiteUrl: "https://www.antler.co/location/united-kingdom", applyUrl: "https://www.antler.co/apply", description: "Antler is a global early-stage VC enabling the next generation of exceptional founders. They bring together exceptional individuals at the pre-idea stage, help them form co-founder pairs, and build companies from scratch with initial funding.", type: "ACCELERATOR", location: "London", isRemote: false, sectors: ["AI & Machine Learning","SaaS / B2B Software","Fintech","Consumer"], stages: ["PRE_IDEA","PRE_SEED"], seisEligible: true, eisEligible: false, equityTaken: 9, investmentMin: 100000, investmentMax: 100000, cohortSize: 50, durationWeeks: 10, isFeatured: true, isSponsored: false, applicationDeadline: "2025-09-01", nextCohortDate: "2025-10-01" },
    { slug: "founders-factory", name: "Founders Factory", websiteUrl: "https://foundersfactory.com", applyUrl: "https://foundersfactory.com/apply", description: "Founders Factory is a London-based venture studio and accelerator backed by major corporates including L'Oréal, easyJet, and Guardian Media Group. They build new companies from scratch and accelerate existing startups with corporate partnerships.", type: "VENTURE_STUDIO", location: "London", isRemote: false, sectors: ["AI & Machine Learning","Healthtech","Consumer","Media & Creative","Cleantech"], stages: ["PRE_SEED","SEED"], seisEligible: true, eisEligible: true, equityTaken: 8, investmentMin: 250000, investmentMax: 500000, cohortSize: 20, durationWeeks: 24, isFeatured: true, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "seedcamp", name: "Seedcamp", websiteUrl: "https://seedcamp.com", applyUrl: "https://seedcamp.com/apply", description: "Europe's pre-eminent seed fund and accelerator. Seedcamp invests early in world-class founders attacking large, global markets and solving real problems using technology. Portfolio includes UiPath, Wise, Revolut, and Grover.", type: "ACCELERATOR", location: "London", isRemote: true, sectors: ["SaaS / B2B Software","Fintech","AI & Machine Learning","Marketplace","Deep Tech"], stages: ["PRE_SEED","SEED"], seisEligible: true, eisEligible: true, equityTaken: 7, investmentMin: 200000, investmentMax: 200000, cohortSize: 30, durationWeeks: 0, isFeatured: true, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "bethnal-green-ventures", name: "Bethnal Green Ventures", websiteUrl: "https://bethnalgreenventures.com", applyUrl: "https://bethnalgreenventures.com/apply", description: "BGV is the UK's leading tech for good accelerator and early stage VC. They back founders using technology to tackle big social and environmental challenges. SEIS eligible with a strong community of mission-driven founders.", type: "ACCELERATOR", location: "London", isRemote: true, sectors: ["Social Impact","Cleantech","Healthtech","Edtech","Govtech"], stages: ["PRE_SEED","SEED"], seisEligible: true, eisEligible: false, equityTaken: 6, investmentMin: 30000, investmentMax: 30000, cohortSize: 15, durationWeeks: 12, isFeatured: true, isSponsored: false, applicationDeadline: "2025-07-15", nextCohortDate: "2025-09-01" },
    { slug: "zinc-vc", name: "Zinc VC", websiteUrl: "https://zinc.vc", applyUrl: "https://zinc.vc/apply", description: "Zinc is a unique venture studio that recruits world-class experts and connects them with exceptional entrepreneurs to co-found startups addressing the biggest challenges in mental health, longevity, and the future of work.", type: "VENTURE_STUDIO", location: "London", isRemote: false, sectors: ["Healthtech","Future of Work","Social Impact","AI & Machine Learning"], stages: ["PRE_IDEA","PRE_SEED"], seisEligible: true, eisEligible: false, equityTaken: 8.5, investmentMin: 50000, investmentMax: 50000, cohortSize: 12, durationWeeks: 24, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "ada-ventures", name: "Ada Ventures", websiteUrl: "https://ada.ventures", applyUrl: "https://ada.ventures/apply", description: "Ada Ventures is a pre-seed and seed fund backing underestimated founders tackling overlooked problems. They invest across sectors with a focus on diverse founding teams and problems that traditional investors overlook.", type: "VC", location: "London", isRemote: true, sectors: ["Healthtech","Fintech","Edtech","Future of Work","Social Impact"], stages: ["PRE_SEED","SEED"], seisEligible: true, eisEligible: true, equityTaken: null, investmentMin: 100000, investmentMax: 500000, cohortSize: null, durationWeeks: null, isFeatured: true, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "wayra-uk", name: "Wayra UK", websiteUrl: "https://wayra.com/uk", applyUrl: "https://wayra.com/uk/apply", description: "Wayra is Telefónica's startup accelerator. They invest in and partner with startups at the intersection of telco, digital, and technology. Startups get access to Telefónica's global network, customer base, and technical resources.", type: "ACCELERATOR", location: "London", isRemote: false, sectors: ["AI & Machine Learning","Cybersecurity","SaaS / B2B Software","IoT & Hardware","Healthtech"], stages: ["SEED","SERIES_A"], seisEligible: false, eisEligible: true, equityTaken: 5, investmentMin: 50000, investmentMax: 150000, cohortSize: 12, durationWeeks: 12, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "ignite-accelerator", name: "Ignite Accelerator", websiteUrl: "https://ignite.io", applyUrl: "https://ignite.io/apply", description: "Ignite is one of the UK's longest-running accelerator programmes, based in the North East. They support early-stage tech startups with funding, mentorship, and a strong Northern founder community. SEIS eligible investment.", type: "ACCELERATOR", location: "Newcastle", isRemote: true, sectors: ["SaaS / B2B Software","Consumer","Marketplace","AI & Machine Learning"], stages: ["PRE_SEED","SEED"], seisEligible: true, eisEligible: false, equityTaken: 8, investmentMin: 25000, investmentMax: 50000, cohortSize: 10, durationWeeks: 13, isFeatured: false, isSponsored: false, applicationDeadline: "2025-08-01", nextCohortDate: null },
    { slug: "barclays-eagle-labs", name: "Barclays Eagle Labs", websiteUrl: "https://labs.barclays", applyUrl: null, description: "Barclays Eagle Labs is a UK-wide network of incubators and accelerators supporting businesses at every stage. They offer workspace, mentorship, investor connections and sector-specific programmes across 40+ locations nationwide. Equity-free.", type: "INCUBATOR", location: "UK-wide", isRemote: true, sectors: ["Fintech","Cleantech","AI & Machine Learning","Deep Tech","Healthtech"], stages: ["PRE_SEED","SEED","SERIES_A"], seisEligible: false, eisEligible: false, equityTaken: 0, investmentMin: null, investmentMax: null, cohortSize: null, durationWeeks: 13, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "microsoft-for-startups", name: "Microsoft for Startups Founders Hub", websiteUrl: "https://foundershub.startups.microsoft.com", applyUrl: null, description: "Microsoft for Startups provides free Azure cloud credits (up to $150k), GitHub Enterprise, Microsoft 365, and access to Microsoft's technical experts and partner network. Open to B2B SaaS and AI startups at any stage.", type: "GRANT", location: "UK-wide", isRemote: true, sectors: ["AI & Machine Learning","SaaS / B2B Software","Deep Tech","Cybersecurity"], stages: ["PRE_SEED","SEED","SERIES_A","ANY"], seisEligible: false, eisEligible: false, equityTaken: 0, investmentMin: null, investmentMax: null, cohortSize: null, durationWeeks: null, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "local-globe", name: "LocalGlobe", websiteUrl: "https://localglobe.vc", applyUrl: null, description: "LocalGlobe is one of Europe's most active seed-stage investors, backing exceptional founders at the earliest stages across all sectors. Led by Robin and Saul Klein, they've backed Improbable, Zoopla, Citymapper, and many more.", type: "VC", location: "London", isRemote: false, sectors: ["SaaS / B2B Software","Marketplace","Consumer","Fintech","Deep Tech","AI & Machine Learning"], stages: ["SEED"], seisEligible: true, eisEligible: true, equityTaken: null, investmentMin: 500000, investmentMax: 3000000, cohortSize: null, durationWeeks: null, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "octopus-ventures", name: "Octopus Ventures", websiteUrl: "https://octopusventures.com", applyUrl: null, description: "Octopus Ventures is one of the UK's most active venture capital investors. They back companies in health, deep tech, fintech, and consumer categories. Known for a hands-on approach and strong portfolio support.", type: "VC", location: "London", isRemote: false, sectors: ["Healthtech","Deep Tech","Fintech","Consumer","AI & Machine Learning"], stages: ["SEED","SERIES_A"], seisEligible: false, eisEligible: true, equityTaken: null, investmentMin: 1000000, investmentMax: 10000000, cohortSize: null, durationWeeks: null, isFeatured: true, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "balderton-capital", name: "Balderton Capital", websiteUrl: "https://balderton.com", applyUrl: null, description: "Balderton Capital is a leading London-based VC that partners with European-founded technology companies at Series A and beyond. They've backed Revolut, Depop, Kobalt Music, and hundreds more.", type: "VC", location: "London", isRemote: false, sectors: ["Fintech","SaaS / B2B Software","Marketplace","Consumer","AI & Machine Learning"], stages: ["SERIES_A","SERIES_B_PLUS"], seisEligible: false, eisEligible: true, equityTaken: null, investmentMin: 5000000, investmentMax: 50000000, cohortSize: null, durationWeeks: null, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "forward-partners", name: "Forward Partners", websiteUrl: "https://forwardpartners.com", applyUrl: null, description: "Forward Partners is a UK-based early stage VC and operational platform. They invest £100k–£1m in pre-seed and seed stage startups, particularly commerce, marketplace, and AI businesses, and provide hands-on support through their in-house team.", type: "VC", location: "London", isRemote: false, sectors: ["Marketplace","AI & Machine Learning","Consumer","SaaS / B2B Software"], stages: ["PRE_SEED","SEED"], seisEligible: true, eisEligible: true, equityTaken: null, investmentMin: 100000, investmentMax: 1000000, cohortSize: null, durationWeeks: null, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "techstars-london", name: "Techstars London", websiteUrl: "https://techstars.com/accelerators/london", applyUrl: "https://techstars.com/accelerators/london", description: "Techstars London is part of the global Techstars network, one of the most prestigious accelerator programmes in the world. Three months of intensive mentorship, networking, and fundraising support, culminating in a Demo Day.", type: "ACCELERATOR", location: "London", isRemote: false, sectors: ["SaaS / B2B Software","AI & Machine Learning","Fintech","Healthtech","Consumer"], stages: ["SEED"], seisEligible: true, eisEligible: true, equityTaken: 6, investmentMin: 120000, investmentMax: 120000, cohortSize: 12, durationWeeks: 13, isFeatured: true, isSponsored: false, applicationDeadline: "2025-10-01", nextCohortDate: "2026-01-01" },
    { slug: "future-planet-capital", name: "Future Planet Capital", websiteUrl: "https://futureplanetcapital.com", applyUrl: null, description: "Future Planet Capital invests in science and deep tech spinouts from top universities globally, with a strong UK focus. They back founders tackling climate, health, and sustainability challenges with breakthrough science.", type: "VC", location: "London", isRemote: false, sectors: ["Cleantech","Deep Tech","Healthtech","Agritech"], stages: ["SEED","SERIES_A"], seisEligible: false, eisEligible: true, equityTaken: null, investmentMin: 500000, investmentMax: 5000000, cohortSize: null, durationWeeks: null, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
    { slug: "springboard-fintech", name: "Springboard Fintech", websiteUrl: "https://springboard.com/fintech", applyUrl: null, description: "Springboard's Fintech & Insurtech accelerator is backed by Mastercard, Barclays, and other financial institutions. They support fintech and insurtech startups with regulatory guidance, enterprise partnerships and pilot opportunities.", type: "ACCELERATOR", location: "London", isRemote: true, sectors: ["Fintech","Legaltech"], stages: ["SEED","SERIES_A"], seisEligible: false, eisEligible: true, equityTaken: 0, investmentMin: null, investmentMax: null, cohortSize: 15, durationWeeks: 12, isFeatured: false, isSponsored: false, applicationDeadline: "2025-08-30", nextCohortDate: null },
    { slug: "deepmind-google-startups", name: "Google for Startups Accelerator UK", websiteUrl: "https://startup.google.com/accelerator", applyUrl: null, description: "Google for Startups Accelerator UK is a 3-month equity-free programme for seed to Series A stage tech startups. Get access to Google engineers, product experts, and a global network. Focused on AI and ML startups.", type: "ACCELERATOR", location: "London", isRemote: true, sectors: ["AI & Machine Learning","Deep Tech","SaaS / B2B Software","Cleantech"], stages: ["SEED","SERIES_A"], seisEligible: false, eisEligible: false, equityTaken: 0, investmentMin: null, investmentMax: null, cohortSize: 12, durationWeeks: 12, isFeatured: false, isSponsored: false, applicationDeadline: "2025-06-30", nextCohortDate: null },
    { slug: "notion-capital", name: "Notion Capital", websiteUrl: "https://notion.vc", applyUrl: null, description: "Notion Capital is a leading European B2B SaaS and cloud investor. They invest in Series A and beyond, backing companies that are building the next generation of enterprise software and cloud infrastructure.", type: "VC", location: "London", isRemote: false, sectors: ["SaaS / B2B Software","AI & Machine Learning","Cybersecurity","Future of Work"], stages: ["SERIES_A","SERIES_B_PLUS"], seisEligible: false, eisEligible: true, equityTaken: null, investmentMin: 2000000, investmentMax: 15000000, cohortSize: null, durationWeeks: null, isFeatured: false, isSponsored: false, applicationDeadline: null, nextCohortDate: null },
  ];

  let seeded = 0;
  for (const p of programmes) {
    const id = `prog_${p.slug.replace(/-/g, "_")}`;
    await sql`
      INSERT INTO "Programme" (
        id, slug, name, "websiteUrl", "applyUrl", description, type, location,
        "isRemote", sectors, stages, "seisEligible", "eisEligible",
        "equityTaken", "investmentMin", "investmentMax", "cohortSize", "durationWeeks",
        "applicationDeadline", "nextCohortDate", "isFeatured", "isSponsored", "isActive"
      ) VALUES (
        ${id}, ${p.slug}, ${p.name}, ${p.websiteUrl}, ${p.applyUrl ?? null},
        ${p.description}, ${p.type}, ${p.location}, ${p.isRemote},
        ${p.sectors as string[]}, ${p.stages as string[]},
        ${p.seisEligible}, ${p.eisEligible},
        ${p.equityTaken ?? null}, ${p.investmentMin ?? null}, ${p.investmentMax ?? null},
        ${p.cohortSize ?? null}, ${p.durationWeeks ?? null},
        ${p.applicationDeadline ? new Date(p.applicationDeadline) : null},
        ${p.nextCohortDate ? new Date(p.nextCohortDate) : null},
        ${p.isFeatured}, ${p.isSponsored}, true
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        "isFeatured" = EXCLUDED."isFeatured",
        "updatedAt" = now()
    `;
    console.log(`  ✓ ${p.name}`);
    seeded++;
  }

  console.log(`\nSeeded ${seeded} programmes successfully.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
