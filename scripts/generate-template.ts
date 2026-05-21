import ExcelJS from "exceljs";
import * as path from "path";

const INDIGO = "FF4F46E2";
const INDIGO_LIGHT = "FFE0E7FF";
const ZINC_900 = "FF18181B";
const WHITE = "FFFFFFFF";
const AMBER = "FFFEF3C7";
const GREEN_LIGHT = "FFD1FAE5";
const ZINC_100 = "FFF4F4F5";
const ZINC_200 = "FFE4E4E7";

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Accelerate.fyi";
  wb.created = new Date();

  // ─── TAB 1: Instructions ─────────────────────────────────────────────────
  const instructions = wb.addWorksheet("📋 Instructions", {
    properties: { tabColor: { argb: INDIGO } },
  });

  instructions.getColumn("A").width = 28;
  instructions.getColumn("B").width = 70;

  const addInstructionHeader = (row: number, text: string) => {
    const r = instructions.getRow(row);
    r.height = 28;
    const cell = instructions.getCell(`A${row}`);
    cell.value = text;
    cell.font = { bold: true, size: 13, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INDIGO } };
    cell.alignment = { vertical: "middle" };
    instructions.mergeCells(`A${row}:B${row}`);
  };

  const addInstructionRow = (row: number, field: string, desc: string, bg?: string) => {
    const r = instructions.getRow(row);
    r.height = 20;
    const a = instructions.getCell(`A${row}`);
    const b = instructions.getCell(`B${row}`);
    a.value = field;
    a.font = { bold: true, size: 10 };
    a.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg ?? ZINC_100 } };
    a.alignment = { vertical: "middle", wrapText: true };
    b.value = desc;
    b.font = { size: 10 };
    b.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg ?? WHITE } };
    b.alignment = { vertical: "middle", wrapText: true };
    r.border = {
      bottom: { style: "thin", color: { argb: ZINC_200 } },
    };
  };

  addInstructionHeader(1, "Accelerate.fyi — Programme Submission Template");

  instructions.getRow(2).height = 10;

  addInstructionHeader(3, "How to use this file");
  addInstructionRow(4, "Step 1", "Go to the '➕ Add Programmes' tab");
  addInstructionRow(5, "Step 2", "Fill in one programme per row. Required fields are highlighted in yellow.");
  addInstructionRow(6, "Step 3", "Use the '📖 Reference' tab to look up valid options for Type, Stage, Sector and Country.");
  addInstructionRow(7, "Step 4", "Send the completed file back — it will be imported automatically.");
  addInstructionRow(8, "Step 5", "Leave the Slug column blank — it will be generated from the Name.");

  instructions.getRow(9).height = 10;

  addInstructionHeader(10, "Field Guide");
  addInstructionRow(11, "Name", "Full name of the programme exactly as it should appear on the site.", AMBER);
  addInstructionRow(12, "Type", "One of: Accelerator, Venture Studio, Incubator, Grant, Angel Network", AMBER);
  addInstructionRow(13, "Country", "Country where the programme is based. See Reference tab for full list.", AMBER);
  addInstructionRow(14, "City", "City or region. E.g. London, Berlin, Paris, UK-wide", AMBER);
  addInstructionRow(15, "Description", "1–2 sentences. What the programme does, who it's for, what it offers.", AMBER);
  addInstructionRow(16, "Website URL", "Full URL including https://", AMBER);
  addInstructionRow(17, "Apply URL", "Direct link to the application form. Leave blank if same as website.");
  addInstructionRow(18, "Sectors", "Separate multiple sectors with a pipe | e.g.  Fintech|Healthtech|AI & Machine Learning");
  addInstructionRow(19, "Stages", "Separate multiple stages with a pipe | e.g.  Pre-seed|Seed");
  addInstructionRow(20, "Investment Min/Max", "Numbers only — no £ or k. E.g. for £50k enter  50000");
  addInstructionRow(21, "Currency", "GBP for UK programmes, EUR for European. Defaults to GBP if blank.");
  addInstructionRow(22, "Equity %", "Number only. E.g. for 6% enter  6   — enter 0 for equity-free.");
  addInstructionRow(23, "SEIS / EIS Eligible", "Yes or No. SEIS/EIS only applies to UK programmes.");
  addInstructionRow(24, "Remote / Hybrid", "Yes if the programme can be done remotely or has a hybrid option.");
  addInstructionRow(25, "Cohort Size", "Approximate number of startups per cohort. Leave blank if unknown.");
  addInstructionRow(26, "Duration (weeks)", "How many weeks the programme runs. Leave blank if ongoing/rolling.");
  addInstructionRow(27, "Application Deadline", "Format: DD/MM/YYYY — e.g. 31/08/2025. Leave blank if rolling.");
  addInstructionRow(28, "Next Cohort Date", "Format: DD/MM/YYYY — e.g. 01/10/2025. Leave blank if unknown.");
  addInstructionRow(29, "Featured", "Yes to highlight this programme on the homepage. Use sparingly.");

  // ─── TAB 2: Data Entry ───────────────────────────────────────────────────
  const sheet = wb.addWorksheet("➕ Add Programmes", {
    properties: { tabColor: { argb: "FF22C55E" } },
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const columns = [
    { header: "Name", key: "name", width: 28, required: true },
    { header: "Type", key: "type", width: 18, required: true },
    { header: "Country", key: "country", width: 16, required: true },
    { header: "City", key: "city", width: 16, required: true },
    { header: "Description", key: "description", width: 55, required: true },
    { header: "Website URL", key: "websiteUrl", width: 32, required: true },
    { header: "Apply URL", key: "applyUrl", width: 32 },
    { header: "Sectors", key: "sectors", width: 38 },
    { header: "Stages", key: "stages", width: 30 },
    { header: "Investment Min", key: "investmentMin", width: 16 },
    { header: "Investment Max", key: "investmentMax", width: 16 },
    { header: "Currency", key: "currency", width: 12 },
    { header: "Equity %", key: "equity", width: 12 },
    { header: "SEIS Eligible", key: "seis", width: 14 },
    { header: "EIS Eligible", key: "eis", width: 14 },
    { header: "Remote / Hybrid", key: "remote", width: 16 },
    { header: "Cohort Size", key: "cohortSize", width: 14 },
    { header: "Duration (weeks)", key: "duration", width: 18 },
    { header: "Application Deadline\n(DD/MM/YYYY)", key: "deadline", width: 22 },
    { header: "Next Cohort Date\n(DD/MM/YYYY)", key: "cohortDate", width: 22 },
    { header: "Featured", key: "featured", width: 12 },
  ];

  // Row 1: Section labels spanning groups
  const groupRow = sheet.getRow(1);
  groupRow.height = 20;

  const groups = [
    { label: "REQUIRED", start: 1, end: 6, color: INDIGO },
    { label: "OPTIONAL", start: 7, end: 9, color: "FF6366F1" },
    { label: "INVESTMENT", start: 10, end: 13, color: "FF7C3AED" },
    { label: "ELIGIBILITY", start: 14, end: 16, color: "FF0EA5E9" },
    { label: "PROGRAMME DETAILS", start: 17, end: 20, color: "FF059669" },
    { label: "DISPLAY", start: 21, end: 21, color: "FFD97706" },
  ];

  for (const g of groups) {
    const startCol = g.start;
    const endCol = g.end;
    const startLetter = sheet.getColumn(startCol).letter;
    const endLetter = sheet.getColumn(endCol).letter;

    if (startCol !== endCol) {
      sheet.mergeCells(`${startLetter}1:${endLetter}1`);
    }

    const cell = sheet.getCell(`${startLetter}1`);
    cell.value = g.label;
    cell.font = { bold: true, size: 9, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: g.color } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  }

  // Row 2: Column headers
  const headerRow = sheet.getRow(2);
  headerRow.height = 36;

  columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width;
    const cell = sheet.getCell(2, i + 1);
    cell.value = col.header;
    cell.font = { bold: true, size: 10, color: { argb: col.required ? INDIGO : "FF52525B" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: col.required ? INDIGO_LIGHT : ZINC_100 } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      bottom: { style: "medium", color: { argb: INDIGO } },
      right: { style: "thin", color: { argb: ZINC_200 } },
    };
  });

  // Example row (row 3)
  const exampleData = [
    "Entrepreneur First",
    "Accelerator",
    "UK",
    "London",
    "EF is the world's leading talent investor — investing in exceptional individuals before they have a co-founder or idea, helping them build deep tech and AI companies.",
    "https://joinef.com",
    "https://joinef.com/apply",
    "AI & Machine Learning|Deep Tech|SaaS / B2B Software",
    "Pre-idea",
    "80000",
    "80000",
    "GBP",
    "10",
    "No",
    "No",
    "No",
    "80",
    "12",
    "",
    "",
    "Yes",
  ];

  const exRow = sheet.getRow(3);
  exRow.height = 40;
  exampleData.forEach((val, i) => {
    const cell = sheet.getCell(3, i + 1);
    cell.value = val;
    cell.font = { italic: true, size: 9, color: { argb: "FF71717A" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: ZINC_200 } } };
  });

  // Label the example row
  sheet.getCell("A3").note = "EXAMPLE ROW — delete or overwrite this";

  // Data rows 4–103 (100 empty rows)
  for (let r = 4; r <= 103; r++) {
    const row = sheet.getRow(r);
    row.height = 38;
    columns.forEach((col, i) => {
      const cell = sheet.getCell(r, i + 1);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: col.required ? "FFFFF7ED" : WHITE },
      };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.font = { size: 10 };
      cell.border = {
        bottom: { style: "thin", color: { argb: ZINC_200 } },
        right: { style: "thin", color: { argb: ZINC_200 } },
      };
    });
  }

  // ─── TAB 3: Reference ────────────────────────────────────────────────────
  const ref = wb.addWorksheet("📖 Reference", {
    properties: { tabColor: { argb: "FFD97706" } },
  });

  ref.getColumn("A").width = 22;
  ref.getColumn("B").width = 22;
  ref.getColumn("C").width = 22;
  ref.getColumn("D").width = 30;
  ref.getColumn("E").width = 26;

  const addRefHeader = (col: string, row: number, text: string) => {
    const cell = ref.getCell(`${col}${row}`);
    cell.value = text;
    cell.font = { bold: true, size: 11, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INDIGO } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    ref.getRow(row).height = 24;
  };

  const addRefItem = (col: string, row: number, text: string, note?: string) => {
    const cell = ref.getCell(`${col}${row}`);
    cell.value = text;
    cell.font = { size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: row % 2 === 0 ? ZINC_100 : WHITE } };
    cell.alignment = { vertical: "middle" };
    ref.getRow(row).height = 18;
    if (note) {
      const noteCell = ref.getCell(`B${row}`);
      noteCell.value = note;
      noteCell.font = { size: 9, color: { argb: "FF71717A" }, italic: true };
      noteCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: row % 2 === 0 ? ZINC_100 : WHITE } };
    }
  };

  // Types
  addRefHeader("A", 1, "Programme Types");
  [
    ["Accelerator", "Cohort-based, equity investment"],
    ["Venture Studio", "Co-builds companies with founders"],
    ["Incubator", "Workspace + support, often equity-free"],
    ["Grant", "Non-dilutive funding or credits"],
    ["Angel Network", "Group of angel investors"],
  ].forEach(([val, note], i) => addRefItem("A", i + 2, val, note));

  // Stages
  addRefHeader("C", 1, "Stages");
  ["Pre-idea", "Pre-seed", "Seed", "Series A"].forEach((val, i) =>
    addRefItem("C", i + 2, val)
  );

  // Sectors
  ref.getRow(8).height = 10;
  addRefHeader("A", 9, "Sectors (copy exactly)");
  [
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
  ].forEach((val, i) => addRefItem("A", i + 10, val));

  // Countries
  addRefHeader("C", 9, "Countries (copy exactly)");
  [
    "UK",
    "Germany",
    "France",
    "Netherlands",
    "Sweden",
    "Spain",
    "Ireland",
    "Estonia",
    "Denmark",
    "Finland",
    "Norway",
    "Switzerland",
    "Belgium",
    "Portugal",
    "Italy",
    "Austria",
    "Poland",
    "Czech Republic",
    "Pan-European",
  ].forEach((val, i) => addRefItem("C", i + 10, val));

  // Yes/No fields
  addRefHeader("E", 1, "Yes / No fields");
  addRefItem("E", 2, "SEIS Eligible");
  addRefItem("E", 3, "EIS Eligible");
  addRefItem("E", 4, "Remote / Hybrid");
  addRefItem("E", 5, "Featured");
  ref.getRow(6).height = 10;
  addRefHeader("E", 7, "Currency");
  addRefItem("E", 8, "GBP  →  UK programmes");
  addRefItem("E", 9, "EUR  →  European programmes");

  // Save
  const outPath = path.resolve("templates/programmes-template.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log(`✓ Saved to ${outPath}`);
}

generate().catch(console.error);
