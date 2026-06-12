import fs from 'fs';
import path from 'path';
import process from 'process';

const EXPECTED_CHANNELS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const ASSET_TYPES = [
  { id: 'avatar', folder: 'avatars', extMatch: /^\.(png|jpg|jpeg|webp)$/i },
  { id: 'cover', folder: 'covers', extMatch: /^\.(png|jpg|jpeg|webp)$/i },
  { id: 'daily', folder: 'daily', extMatch: /^\.(png|jpg|jpeg|webp)$/i },
  { id: 'weekly', folder: 'weekly', extMatch: /^\.(png|jpg|jpeg|webp)$/i }
];

function runValidation() {
  console.log("=========================================");
  console.log(" Zodiac Real Assets Validator");
  console.log("=========================================\n");

  const assetsDir = path.resolve(process.cwd(), "public", "assets", "zodiac");
  let totalMissing = 0;
  let totalFound = 0;

  if (!fs.existsSync(assetsDir)) {
    console.error(`[ERROR] Missing base directory: ${assetsDir}`);
    process.exit(1);
  }

  // Ensure folders exist
  ASSET_TYPES.forEach(t => {
    const dir = path.join(assetsDir, t.folder);
    if (!fs.existsSync(dir)) {
      console.log(`[INIT] Creating missing directory: public/assets/zodiac/${t.folder}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const report = {};

  EXPECTED_CHANNELS.forEach(channel => {
    report[channel] = {
      found: 0,
      total: ASSET_TYPES.length,
      missingDetails: []
    };

    ASSET_TYPES.forEach(t => {
      const dir = path.join(assetsDir, t.folder);
      
      // Look for any file that starts with `type-channel.` (e.g. avatar-aries.png)
      let foundFile = false;
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const expectedPrefix = `${t.id}-${channel}.`;
          if (file.startsWith(expectedPrefix)) {
            const ext = path.extname(file);
            if (t.extMatch.test(ext)) {
              foundFile = true;
              break;
            } else {
              report[channel].missingDetails.push(`Invalid extension for ${t.id}: ${file}`);
            }
          }
        }
      }

      if (foundFile) {
        report[channel].found++;
        totalFound++;
      } else {
        report[channel].missingDetails.push(`Missing ${t.id} (${t.id}-${channel}.ext)`);
        totalMissing++;
      }
    });
  });

  console.log("--- PER-SIGN COMPLETENESS ---");
  for (const channel of EXPECTED_CHANNELS) {
    const data = report[channel];
    const status = data.found === data.total ? "COMPLETE" : "INCOMPLETE";
    console.log(`${channel.padEnd(16)} | ${data.found}/${data.total} | ${status}`);
    if (data.missingDetails.length > 0) {
      data.missingDetails.forEach(m => console.log(`  -> ${m}`));
    }
  }

  const totalExpected = EXPECTED_CHANNELS.length * ASSET_TYPES.length;
  console.log("\n--- SUMMARY ---");
  console.log(`Total Expected Assets : ${totalExpected}`);
  console.log(`Total Found Assets    : ${totalFound}`);
  console.log(`Total Missing Assets  : ${totalMissing}`);
  
  if (totalMissing === 0) {
    console.log("\n[SUCCESS] All expected visual assets are present and correctly named!");
  } else {
    console.log(`\n[INFO] Missing ${totalMissing} assets. This is normal if you haven't generated them yet.`);
    console.log(`       Follow the prompts in docs/ to generate and import them.`);
  }
}

runValidation();
