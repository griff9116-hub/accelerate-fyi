export const SECTORS = [
  "AI & Machine Learning",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Cleantech",
  "Deep Tech",
  "Consumer",
  "SaaS / B2B Software",
  "Marketplace",
  "Govtech",
  "Agritech",
  "Proptech",
  "Legaltech",
  "Media & Creative",
  "Social Impact",
  "Future of Work",
  "Cybersecurity",
  "Web3 & Crypto",
  "Hardware & IoT",
  "Space Tech",
] as const;

export const UK_LOCATIONS = [
  "London",
  "Manchester",
  "Bristol",
  "Birmingham",
  "Edinburgh",
  "Leeds",
  "Cambridge",
  "Oxford",
  "Liverpool",
  "Newcastle",
  "Sheffield",
  "Nottingham",
  "UK-wide",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  PRE_IDEA: "Pre-idea",
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B_PLUS: "Series B+",
  ANY: "Any stage",
};

export const TYPE_LABELS: Record<string, string> = {
  ACCELERATOR: "Accelerator",
  VENTURE_STUDIO: "Venture Studio",
  VC: "VC",
  ANGEL_NETWORK: "Angel Network",
  INCUBATOR: "Incubator",
  GRANT: "Grant",
};

export const TYPE_COLORS: Record<string, string> = {
  ACCELERATOR: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  VENTURE_STUDIO: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  VC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ANGEL_NETWORK: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  INCUBATOR: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  GRANT: "bg-green-500/10 text-green-400 border-green-500/20",
};
