import fs from 'fs';
import path from 'path';
import process from 'process';

const EXPECTED_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

// Fallback visual seeds if dynamic import is tricky
const fallbackVisualSeeds = {
  "zodiac-general": "A luxurious 3D metallic astrolabe and zodiac wheel glowing in deep space, midnight blue and black background, celestial gold and silver accents, sacred geometry.",
  "aries": "Aries premium zodiac visual, fire and gold, sharp energetic lines, deep red luxury backdrop.",
  "taurus": "Taurus premium zodiac visual, earth and stone textures, gold accents, calm power, luxury stillness, black-gold cinematic scene.",
  "gemini": "Gemini dark zodiac editorial image, mirror reflections, twin portrait, air movement, elegant duality, violet-blue shadows and gold lines.",
  "cancer": "Cancer premium mystic scene, moon over water, home symbolism, silver-blue cinematic light, dark zodiac mood, soft protective atmosphere.",
  "leo": "Leo luxury horoscope cover, sun and crown, theatrical stage light, royal gold, black zodiac backdrop, premium cinematic drama.",
  "virgo": "Virgo premium zodiac composition, marble, order, refined details, clean structure, black-gold editorial design, cinematic precision.",
  "libra": "Libra dark luxury zodiac visual, balance scales, symmetry, aesthetic composition, soft gold and violet light, premium magazine look.",
  "scorpio": "Scorpio luxury mystic portrait, shadow and dark red depth, magnetic mystery, black-gold zodiac atmosphere, cinematic low light.",
  "sagittarius": "Sagittarius cinematic zodiac scene, road and arrow toward horizon, movement and fire, dark blue sky, gold trail, premium mystic style.",
  "capricorn": "Capricorn black-gold zodiac architecture, mountain silhouette, discipline and status, premium cinematic lighting, luxury mystic editorial.",
  "aquarius": "Aquarius futuristic zodiac visual, electric blue neon ideas, dark cosmic background, gold accents, premium magazine futurism.",
  "pisces": "Pisces premium mystic water scene, dream fog, violet-blue intuition, dark zodiac shimmer, cinematic soft light and gold details."
};

function generateMarkdown() {
  const NEGATIVE_PROMPT = "cartoon, anime, text, typography, letters, watermark, signature, ugly, messy, flat, vector, illustration, cheap, low resolution, crowded, chaotic, neon bright colors";
  const GLOBAL_STYLE = "cinematic, ultra detailed, luxury mystic, high-end editorial photography, deep contrast, elegant composition, 8k resolution --v 6.0 --style raw";

  let md = `# Zodiac Image Prompts Export Pack\n\n`;
  md += `This file contains ready-to-use prompts for generating visual assets for the Zodiac Network.\n`;
  md += `\n## Global Guidelines\n`;
  md += `- **Style Append:** \`${GLOBAL_STYLE}\`\n`;
  md += `- **Negative Prompt:** \`${NEGATIVE_PROMPT}\`\n`;
  md += `- **No Text:** Images should never have text in them.\n`;
  md += `\n---\n\n`;

  md += `## 1. Avatars (1:1 Aspect Ratio)\n`;
  md += `For Telegram avatars, ensure the central icon is perfectly centered to fit inside a circular crop.\n\n`;

  EXPECTED_IDS.forEach(id => {
    const seed = fallbackVisualSeeds[id];
    md += `### ${id}\n`;
    md += `**Prompt:** \`Centered icon for Telegram circular crop. ${seed} ${GLOBAL_STYLE}\`\n`;
    md += `**Save to:** \`public/assets/zodiac/avatars/avatar-${id}.png\`\n\n`;
  });

  md += `---\n\n`;

  md += `## 2. Covers / Banners (16:9 Aspect Ratio)\n`;
  md += `For Telegram premium channel covers.\n\n`;

  EXPECTED_IDS.forEach(id => {
    const seed = fallbackVisualSeeds[id];
    md += `### ${id}\n`;
    md += `**Prompt:** \`Wide atmospheric banner. ${seed} ${GLOBAL_STYLE} --ar 16:9\`\n`;
    md += `**Save to:** \`public/assets/zodiac/covers/cover-${id}.jpg\`\n\n`;
  });

  md += `---\n\n`;

  md += `## 3. Placeholders / Daily Templates (4:5 Aspect Ratio)\n`;
  md += `Fallback images for daily posts.\n\n`;

  EXPECTED_IDS.forEach(id => {
    const seed = fallbackVisualSeeds[id];
    const filename = id === 'zodiac-general' ? 'placeholder-general.jpg' : `placeholder-${id}.jpg`;
    md += `### ${id}\n`;
    md += `**Prompt:** \`Vertical atmospheric background. ${seed} ${GLOBAL_STYLE} --ar 4:5\`\n`;
    md += `**Save to:** \`public/assets/zodiac/placeholders/${filename}\`\n\n`;
  });

  return md;
}

function run() {
  const exportsDir = path.resolve(process.cwd(), "exports");
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const outPath = path.join(exportsDir, "zodiac-image-prompts.md");
  const markdown = generateMarkdown();
  
  fs.writeFileSync(outPath, markdown, "utf-8");
  console.log(`Successfully generated prompt export pack!`);
  console.log(`Saved to: ${outPath}`);
  console.log(`Run 'npm run zodiac:validate-assets' after saving your generated images to verify readiness.`);
}

run();
