import fs from 'fs';
import path from 'path';
import process from 'process';

const EXPECTED_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function run() {
  const assetsDir = path.resolve(process.cwd(), "public/assets/zodiac");
  
  if (!fs.existsSync(assetsDir)) {
    console.error(`Error: Base assets directory not found at ${assetsDir}`);
    process.exit(1);
  }

  const dirs = ["avatars", "covers", "daily", "placeholders"];
  dirs.forEach(d => {
    if (!fs.existsSync(path.join(assetsDir, d))) {
      console.error(`Error: Subdirectory missing: ${d}`);
      process.exit(1);
    }
  });

  const report = {
    warnings: [],
    blocking: []
  };

  const warn = msg => report.warnings.push(msg);
  const fail = msg => report.blocking.push(msg);

  const trackerPath = path.resolve(process.cwd(), "templates/zodiac-visual-assets-tracker.example.json");
  let tracker = null;
  if (fs.existsSync(trackerPath)) {
    try {
      tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf-8'));
    } catch (e) {
      fail(`Failed to parse tracker JSON: ${e.message}`);
    }
  }

  // Validate avatars
  const avatarsDir = path.join(assetsDir, "avatars");
  const existingAvatars = fs.readdirSync(avatarsDir);

  EXPECTED_IDS.forEach(id => {
    const expectedAvatar = `avatar-${id}.png`;
    if (!existingAvatars.includes(expectedAvatar)) {
      warn(`Missing avatar file: ${expectedAvatar}`);
    }
  });

  existingAvatars.forEach(file => {
    if (file === ".gitkeep") return;
    if (file.toLowerCase() !== file) {
      warn(`Avatar filename is not entirely lowercase: ${file}`);
    }
    if (file.includes(" ") || file.includes("_")) {
      warn(`Avatar filename contains invalid characters (spaces or underscores): ${file}`);
    }
  });

  // Validate placeholders
  const placeholdersDir = path.join(assetsDir, "placeholders");
  const existingPlaceholders = fs.readdirSync(placeholdersDir);

  EXPECTED_IDS.forEach(id => {
    const expectedPlaceholder = id === 'zodiac-general' ? `placeholder-general.jpg` : `placeholder-${id}.jpg`;
    if (!existingPlaceholders.includes(expectedPlaceholder)) {
      warn(`Missing placeholder file: ${expectedPlaceholder}`);
    }
  });

  existingPlaceholders.forEach(file => {
    if (file === ".gitkeep") return;
    if (file.toLowerCase() !== file) {
      warn(`Placeholder filename is not entirely lowercase: ${file}`);
    }
    if (file.includes(" ") || file.includes("_")) {
      warn(`Placeholder filename contains invalid characters (spaces or underscores): ${file}`);
    }
  });

  console.log(`=== Zodiac Visual Assets Validation ===\n`);
  
  if (tracker) {
    console.log(`Tracker channels found: ${tracker.assets?.length || 0}`);
  }

  if (report.blocking.length > 0) {
    console.log(`BLOCKING ISSUES:`);
    report.blocking.forEach(i => console.log(`- ${i}`));
    process.exit(1);
  }

  if (report.warnings.length > 0) {
    console.log(`WARNINGS (Missing/Invalid Files):`);
    report.warnings.forEach(i => console.log(`- ${i}`));
    console.log(`\nNote: Warnings will not prevent dry-runs, but missing avatars mean channels cannot be fully set up.`);
  } else {
    console.log(`All expected visual assets are present and correctly named!`);
  }

  console.log(`\nValidation complete.`);
  process.exit(0);
}

run();
