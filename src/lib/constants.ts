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
  "Marinetech",
] as const;

export const SECTOR_HIERARCHY: Record<string, string[]> = {
  "AI & Machine Learning": ["Generative AI", "Computer Vision", "NLP", "ML Infrastructure"],
  "Fintech": ["Payments", "Banking & Lending", "Insurtech", "RegTech", "Crypto & DeFi"],
  "Healthtech": ["Digital Health", "Medtech", "Mental Health", "Biotech", "Health Data"],
  "Cleantech": ["Climate Tech", "Energy Storage", "Carbon Markets", "Sustainable Agriculture", "Circular Economy"],
  "Deep Tech": ["Robotics", "Quantum Computing", "Semiconductors", "Photonics"],
  "SaaS / B2B Software": ["Developer Tools", "HR Tech", "Sales Tech", "Data & Analytics", "Security SaaS"],
};

export const ALL_SUBSECTORS: string[] = Object.values(SECTOR_HIERARCHY).flat();

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

export const EUROPEAN_COUNTRIES = [
  "UK",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Spain",
  "Ireland",
  "Denmark",
  "Finland",
  "Norway",
  "Switzerland",
  "Belgium",
  "Portugal",
  "Italy",
  "Estonia",
  "Poland",
  "Czech Republic",
  "Austria",
] as const;

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  UK: ["London", "Manchester", "Bristol", "Birmingham", "Edinburgh", "Leeds", "Cambridge", "Oxford", "Liverpool", "Newcastle", "Sheffield", "Nottingham"],
  Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"],
  France: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Eindhoven"],
  Sweden: ["Stockholm", "Gothenburg", "Malmö"],
  Spain: ["Madrid", "Barcelona", "Valencia", "Bilbao"],
  Ireland: ["Dublin", "Cork", "Galway"],
  Denmark: ["Copenhagen"],
  Finland: ["Helsinki", "Tampere", "Oulu"],
  Norway: ["Oslo", "Bergen"],
  Switzerland: ["Zurich", "Geneva", "Basel"],
  Belgium: ["Brussels", "Antwerp", "Ghent"],
  Portugal: ["Lisbon", "Porto"],
  Italy: ["Milan", "Rome", "Turin", "Florence"],
  Estonia: ["Tallinn", "Tartu"],
  Poland: ["Warsaw", "Kraków", "Wrocław", "Poznań"],
  "Czech Republic": ["Prague", "Brno"],
  Austria: ["Vienna", "Graz"],
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
  SEK: "SEK ",
  NOK: "NOK ",
  CHF: "CHF ",
  DKK: "DKK ",
  PLN: "PLN ",
};

export const COUNTRY_CURRENCY: Record<string, string> = {
  UK: "GBP",
  Germany: "EUR",
  France: "EUR",
  Netherlands: "EUR",
  Sweden: "SEK",
  Spain: "EUR",
  Ireland: "EUR",
  Denmark: "DKK",
  Finland: "EUR",
  Norway: "NOK",
  Switzerland: "CHF",
  Belgium: "EUR",
  Portugal: "EUR",
  Italy: "EUR",
  Estonia: "EUR",
  Poland: "PLN",
  "Czech Republic": "EUR",
  Austria: "EUR",
};

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
