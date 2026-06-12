import fs from "fs";
import path from "path";

function getLatestReport() {
  const runtimeDir = path.resolve(process.cwd(), "data", "runtime");
  if (!fs.existsSync(runtimeDir)) return null;
  const files = fs.readdirSync(runtimeDir)
    .filter(f => f.startsWith("report-") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) return null;
  return path.join(runtimeDir, files[files.length - 1]);
}

function run() {
  console.log("=== Zodiac Latest Runtime Report ===\n");
  const reportFile = getLatestReport();
  if (!reportFile) {
    console.log("No reports found in data/runtime/");
    process.exit(0);
  }

  console.log(`Reading report: ${path.basename(reportFile)}\n`);
  try {
    const reportData = JSON.parse(fs.readFileSync(reportFile, "utf8"));
    
    // Safety scrub: Ensure no tokens or secrets are ever printed here
    // Even if they somehow ended up in the report
    const safeOutput = JSON.stringify(reportData, (key, value) => {
      if (key.toLowerCase().includes("token") || key.toLowerCase().includes("secret")) {
        return "[REDACTED]";
      }
      return value;
    }, 2);
    
    console.log(safeOutput);
  } catch(e) {
    console.error(`Failed to read report: ${e.message}`);
    process.exit(1);
  }
}

run();
