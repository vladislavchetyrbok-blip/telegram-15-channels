import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const GRID_FILE = path.join(process.cwd(), 'grid-source.png');
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'zodiac');

// Block list matching the grid layout (2 columns, 7 rows)
// Left column: zodiac-general, taurus, cancer, virgo, scorpio, capricorn, pisces
// Right column: aries, gemini, leo, libra, sagittarius, aquarius, [Legend]
const blocks = [
  { row: 0, col: 0, sign: 'zodiac-general' },
  { row: 0, col: 1, sign: 'aries' },
  { row: 1, col: 0, sign: 'taurus' },
  { row: 1, col: 1, sign: 'gemini' },
  { row: 2, col: 0, sign: 'cancer' },
  { row: 2, col: 1, sign: 'leo' },
  { row: 3, col: 0, sign: 'virgo' },
  { row: 3, col: 1, sign: 'libra' },
  { row: 4, col: 0, sign: 'scorpio' },
  { row: 4, col: 1, sign: 'sagittarius' },
  { row: 5, col: 0, sign: 'capricorn' },
  { row: 5, col: 1, sign: 'aquarius' },
  { row: 6, col: 0, sign: 'pisces' }
  // row 6, col 1 is the legend
];

const BLOCK_WIDTH = 768;
const ROW_HEIGHT = 1024 / 7; // ~146.2857
const TEXT_HEADER_HEIGHT = 18;
const IMG_HEIGHT = 126; // leave a tiny margin to avoid borders

const ASSET_TYPES = [
  { id: 'avatar', folder: 'avatars', ext: 'png', width: 126, xOff: 1, targetW: 1024, targetH: 1024 },
  { id: 'cover', folder: 'covers', ext: 'jpg', width: 382, xOff: 129, targetW: 1600, targetH: 900 },
  { id: 'daily', folder: 'daily', ext: 'jpg', width: 126, xOff: 513, targetW: 1024, targetH: 1024 },
  { id: 'weekly', folder: 'weekly', ext: 'jpg', width: 126, xOff: 641, targetW: 1600, targetH: 900 }
];

async function main() {
  if (!fs.existsSync(GRID_FILE)) {
    console.error('[ERROR] grid-source.png not found at expected path:', GRID_FILE);
    process.exit(1);
  }

  // Create directories
  ['avatars', 'covers', 'daily', 'weekly'].forEach(folder => {
    const dir = path.join(OUT_DIR, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[INFO] Starting slicing of grid-source.png...');
  let count = 0;

  for (const block of blocks) {
    const baseX = block.col * BLOCK_WIDTH;
    const baseY = Math.round(block.row * ROW_HEIGHT) + TEXT_HEADER_HEIGHT;

    for (const type of ASSET_TYPES) {
      const left = baseX + type.xOff;
      const top = baseY + 1; // 1px margin
      const width = type.width;
      const height = IMG_HEIGHT;

      const fileName = `${type.id}-${block.sign}.${type.ext}`;
      const outPath = path.join(OUT_DIR, type.folder, fileName);

      try {
        await sharp(GRID_FILE)
          .extract({ left, top, width, height })
          .resize(type.targetW, type.targetH, { fit: 'fill' }) // Resize to expected dimensions
          .toFile(outPath);
        
        console.log(`[CREATED] ${outPath}`);
        count++;
      } catch (err) {
        console.error(`[ERROR] Failed to crop ${fileName}:`, err.message);
      }
    }
  }

  console.log(`\n[SUCCESS] Sliced ${count} assets from the master grid.`);
}

main().catch(console.error);
