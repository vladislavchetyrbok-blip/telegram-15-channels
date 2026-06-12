import fs from "fs";
import path from "path";
import process from "process";

const EXPECTED_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function run() {
  const args = process.argv.slice(2);
  const inputFile = args.find(a => !a.startsWith("--"));
  const apply = args.includes("--apply");
  const confirmApply = args.includes("--confirm-apply");

  if (!inputFile) {
    console.error("Usage: node scripts/prepare-zodiac-connections.mjs <input.json> [--apply --confirm-apply]");
    process.exit(1);
  }

  if (apply && !confirmApply) {
    console.error("Error: --apply requires --confirm-apply to proceed.");
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputFile}`);
    process.exit(1);
  }

  const isExample = inputFile.includes("example") || inputFile.includes("template");
  if (apply && isExample) {
    console.error("Error: Refusing to apply example or template file. Please use real data.");
    process.exit(1);
  }

  let inputData;
  try {
    inputData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  } catch (err) {
    console.error(`Invalid JSON in ${inputFile}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(inputData)) {
    console.error(`Input must be a JSON array`);
    process.exit(1);
  }

  const report = {
    blockingIssues: [],
    warnings: [],
    normalized: []
  };

  const fail = (msg) => report.blockingIssues.push(msg);
  const warn = (msg) => report.warnings.push(msg);

  // Validate exactly 13 entries
  if (inputData.length !== 13) {
    fail(`Expected exactly 13 entries, found ${inputData.length}`);
  }

  const seenIds = new Set();

  for (const entry of inputData) {
    if (!entry.id) {
      fail(`Missing id in entry: ${JSON.stringify(entry)}`);
      continue;
    }

    if (!EXPECTED_IDS.includes(entry.id)) {
      fail(`Unknown channel ID: ${entry.id}`);
    }

    if (seenIds.has(entry.id)) {
      fail(`Duplicate channel ID: ${entry.id}`);
    }
    seenIds.add(entry.id);

    if (apply) {
      if (!entry.actualUsername) fail(`actualUsername is empty for ${entry.id}`);
      if (!entry.publicLink) fail(`publicLink is empty for ${entry.id}`);
      if (entry.botAdminStatus !== "admin_added" && entry.botAdminStatus !== "needs_check") {
         fail(`Invalid botAdminStatus for ${entry.id}`);
      }
      if (entry.creationStatus !== "created" && entry.creationStatus !== "needs_review") {
         fail(`Invalid creationStatus for ${entry.id}`);
      }
    }

    // Validate username does not contain "ru"
    if (entry.actualUsername && typeof entry.actualUsername === "string") {
      if (entry.actualUsername.toLowerCase().includes("ru")) {
        fail(`Username "${entry.actualUsername}" for ${entry.id} contains prohibited "ru" suffix/pattern.`);
      }
    }

    // Validate publicLink starts with https://t.me/
    if (entry.publicLink && typeof entry.publicLink === "string") {
      if (!entry.publicLink.startsWith("https://t.me/")) {
        fail(`publicLink "${entry.publicLink}" for ${entry.id} must start with https://t.me/`);
      }
      if (apply && (entry.publicLink.includes("placeholder") || entry.publicLink.includes("example"))) {
        fail(`publicLink "${entry.publicLink}" contains placeholder/example text.`);
      }
    }

    let pStatus = entry.publishStatus || "not_ready";
    // Force not_ready if conditions not met
    if (!entry.telegramChannelId || entry.botAdminStatus !== "admin_added") {
      pStatus = "not_ready";
    }

    if (pStatus === "publish_ready") {
      fail(`"publish_ready" is not allowed in this phase. Wait for final approval.`);
    }

    report.normalized.push({
      id: entry.id,
      telegramChannelId: entry.telegramChannelId || null,
      actualUsername: entry.actualUsername || null,
      publicLink: entry.publicLink || null,
      botAdminStatus: entry.botAdminStatus || "not_added",
      creationStatus: entry.creationStatus || "pending",
      publishStatus: pStatus,
      notes: entry.notes || ""
    });
  }

  for (const expId of EXPECTED_IDS) {
    if (!seenIds.has(expId)) {
      fail(`Missing required channel ID: ${expId}`);
    }
  }

  const isOk = report.blockingIssues.length === 0;

  console.log(`\n=== Zodiac Connection Config Preview ===`);
  console.log(`Input: ${inputFile}`);
  console.log(`Apply Mode: ${apply ? "ON" : "OFF"}`);
  
  if (report.blockingIssues.length > 0) {
    console.log(`\nBLOCKING ISSUES:`);
    report.blockingIssues.forEach(i => console.log(`- ${i}`));
  }

  if (report.warnings.length > 0) {
    console.log(`\nWARNINGS:`);
    report.warnings.forEach(i => console.log(`- ${i}`));
  }

  const outDir = path.resolve(process.cwd(), "exports");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (!isOk) {
    console.error("\nValidation failed. Exiting.");
    process.exit(1);
  }

  if (apply && confirmApply) {
    // DO APPLY
    const configPath = path.resolve(process.cwd(), "data/zodiacChannelConnections.ts");
    const dStr = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(outDir, `zodiacChannelConnections.backup.${dStr}.ts`);
    
    // Read old config to backup and preserve structure/fields
    let oldConfigStr = fs.readFileSync(configPath, "utf-8");
    fs.writeFileSync(backupPath, oldConfigStr);
    console.log(`\nBackup created at: ${backupPath}`);

    // Very simple Regex replace since we don't want to parse TS AST right now, 
    // or better, we can replace the whole array if we export it cleanly, but keeping 
    // displayName / plannedUsername means we have to parse or match.
    // Instead of regex hacking, since it's just TS objects, let's regex match each block.
    
    // Easier approach: we parse the old data with a simple regex, or we just write a new TS file 
    // by matching the `ZODIAC_CHANNEL_CONNECTIONS = [...]` array.
    // Since we just need to update fields, let's reconstruct the file carefully.
    
    const lines = oldConfigStr.split('\n');
    let newLines = [];
    let currentId = null;
    let insideArray = false;
    
    // Map normalized for easy lookup
    const patchMap = {};
    report.normalized.forEach(n => patchMap[n.id] = n);

    let changedFieldsSummary = [];
    let appliedCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.includes("export const ZODIAC_CHANNEL_CONNECTIONS")) {
        insideArray = true;
      }
      
      if (insideArray) {
        const idMatch = line.match(/id:\s*"([^"]+)"/);
        if (idMatch) {
          currentId = idMatch[1];
          appliedCount++;
        }
        
        if (currentId && patchMap[currentId]) {
          const patch = patchMap[currentId];
          if (line.match(/telegramChannelId:/)) {
            line = `    telegramChannelId: ${patch.telegramChannelId ? patch.telegramChannelId : 'null'},`;
            changedFieldsSummary.push(`${currentId}: telegramChannelId`);
          } else if (line.match(/actualUsername:/)) {
            line = `    actualUsername: ${patch.actualUsername ? '"'+patch.actualUsername+'"' : 'null'},`;
          } else if (line.match(/publicLink:/)) {
            line = `    publicLink: ${patch.publicLink ? '"'+patch.publicLink+'"' : 'null'},`;
          } else if (line.match(/botAdminStatus:/)) {
            line = `    botAdminStatus: "${patch.botAdminStatus}",`;
          } else if (line.match(/creationStatus:/)) {
            line = `    creationStatus: "${patch.creationStatus}",`;
          } else if (line.match(/publishStatus:/)) {
            line = `    publishStatus: "${patch.publishStatus}",`;
          } else if (line.match(/notes:/)) {
            line = `    notes: "${patch.notes}"`;
          }
        }
      }
      
      newLines.push(line);
    }
    
    fs.writeFileSync(configPath, newLines.join('\n'));
    console.log(`Updated ${configPath}`);

    const reportPath = path.join(outDir, "zodiac-connections-apply-report.md");
    let md = `# Zodiac Connections Apply Report\n\n`;
    md += `- Input: ${inputFile}\n`;
    md += `- Applied Channels: ${appliedCount}\n`;
    md += `- Skipped: ${13 - appliedCount}\n\n`;
    md += `**Explicit Note: No Telegram publish was performed.**\n`;
    fs.writeFileSync(reportPath, md);

    console.log(`Apply report generated: ${reportPath}`);
    process.exit(0);

  } else {
    // PREVIEW MODE
    const jsonOut = path.join(outDir, "zodiac-channel-connections.normalized.json");
    const mdOut = path.join(outDir, "zodiac-connections-patch-preview.md");

    fs.writeFileSync(jsonOut, JSON.stringify(report.normalized, null, 2));

    let mdContent = `# Zodiac Connections Patch Preview\n\n`;
    mdContent += `> **WARNING: This file is a preview only. It does not update config and does not publish.**\n\n`;
    
    mdContent += `## Validation Summary\n`;
    mdContent += `- **Status**: ${isOk ? "✅ Passed" : "❌ Failed"}\n`;
    mdContent += `- **Total Channels**: ${report.normalized.length}\n`;
    mdContent += `- **Blocking Issues**: ${report.blockingIssues.length}\n`;
    mdContent += `- **Warnings**: ${report.warnings.length}\n\n`;

    mdContent += `## Normalized Connection Entries\n\n`;
    mdContent += "```json\n" + JSON.stringify(report.normalized, null, 2) + "\n```\n\n";

    mdContent += `## Instructions\n`;
    mdContent += `If validation passed, you may manually copy the JSON above into \`data/zodiacChannelConnections.ts\` or wait for the future \`--apply\` command implementation.\n`;

    fs.writeFileSync(mdOut, mdContent);

    console.log(`\nPreview generated!`);
    console.log(`JSON: ${jsonOut}`);
    console.log(`Report: ${mdOut}`);
    console.log(`\nNOTE: The real config was NOT modified. Real publish is disabled.`);
  }
}

run();
