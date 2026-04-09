const XLSX = require("xlsx");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Get Excel file path, optional sheet name, and optional output directory from command line arguments
const scriptPath = process.argv[2];
const excelPath = process.argv[3];
const sheetName = process.argv[4]; // optional
const outputArg = process.argv[5]; // optional

if (!excelPath) {
  console.error("❌ Usage: node batch-from-excel.js <scriptPath> <excel-file-path> [sheet-name] [output-dir]");
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error(`❌ Excel file not found: ${excelPath}`);
  process.exit(1);
}

const outputDir = outputArg
  ? path.resolve(outputArg)
  : path.join(__dirname, "outputs");

function findUrlColumn(row) {
  const keys = Object.keys(row || {});
  const candidates = ["URL", "Url", "url", "Website URL", "Link", "link"];
  for (const candidate of candidates) {
    if (keys.includes(candidate)) return candidate;
  }

  const fuzzy = keys.find((k) => String(k).toLowerCase().includes("url"));
  return fuzzy || null;
}

function isValidHttpUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(String(value).trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function runIndexWithUrl(url) {
  return new Promise((resolve) => {
    console.log(`\n🚀 Running analysis for: ${url}`);
    console.log(`📂 Output directory: ${outputDir}\n`);

    const child = spawn("node", [scriptPath, url, outputDir], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ Finished: ${url}`);
      } else {
        console.error(`❌ Failed (${code}): ${url}`);
      }
      resolve({ url, code });
    });

    child.on("error", (err) => {
      console.error(`❌ Spawn error for ${url}:`, err.message);
      resolve({ url, code: 1 });
    });
  });
}

async function main() {
  const workbook = XLSX.readFile(excelPath);
  const targetSheetName = sheetName || workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(targetSheetName)) {
    console.error(`❌ Sheet not found: ${targetSheetName}`);
    console.error(`Available sheets: ${workbook.SheetNames.join(", ")}`);
    process.exit(1);
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (!rows.length) {
    console.error("❌ No rows found in the Excel sheet.");
    process.exit(1);
  }

  const urlColumn = findUrlColumn(rows[0]);
  if (!urlColumn) {
    console.error("❌ Could not find a URL column.");
    console.error('Expected something like: "URL", "Url", "url", or similar.');
    process.exit(1);
  }

  const urls = rows
    .map((row) => String(row[urlColumn]).trim())
    .filter(isValidHttpUrl);

  if (!urls.length) {
    console.error("❌ No valid HTTP/HTTPS URLs found in the Excel file.");
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`📄 Excel file: ${excelPath}`);
  console.log(`📑 Sheet: ${targetSheetName}`);
  console.log(`🔗 URL column: ${urlColumn}`);
  console.log(`📊 Total valid URLs: ${urls.length}`);
  console.log(`📂 Output directory: ${outputDir}`);

  const results = [];
  for (const url of urls) {
    const result = await runIndexWithUrl(url);
    results.push(result);
  }

  const successCount = results.filter((r) => r.code === 0).length;
  const failCount = results.length - successCount;

  console.log("\n==============================");
  console.log("Batch run finished");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log("==============================\n");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});