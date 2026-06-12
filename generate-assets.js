const fs = require('fs');
const path = require('path');

const channels = [
  'zodiac-general', 'aries', 'taurus', 'gemini', 'cancer', 'leo',
  'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const channelIdentities = {
  'zodiac-general': 'universal zodiac wheel / cosmic astrolabe',
  'aries': 'ram / fire / courage',
  'taurus': 'bull / earth / stability',
  'gemini': 'twins / air / communication',
  'cancer': 'crab / moon / water',
  'leo': 'lion / sun / confidence',
  'virgo': 'maiden / wheat / precision',
  'libra': 'scales / balance / elegance',
  'scorpio': 'scorpion / depth / mystery',
  'sagittarius': 'archer / movement / fire',
  'capricorn': 'goat / mountain / discipline',
  'aquarius': 'water bearer / ideas / air-water symbolism',
  'pisces': 'two fish / intuition / water'
};

const weekdays = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const weekdayMoods = {
  'monday': 'calm start, focus',
  'tuesday': 'action, momentum',
  'wednesday': 'communication, decisions',
  'thursday': 'growth, opportunity',
  'friday': 'relationships, beauty, closure',
  'saturday': 'rest, pleasure, personal energy',
  'sunday': 'reflection, reset, intuition'
};

const globalPrompt = 'premium luxury mystic astrology, high-quality Telegram visual, dark navy/black cosmic background, gold details, cinematic lighting, expensive editorial style, no text inside image, no watermark, no cheap cartoon style, no distorted symbols, no low-quality AI artifacts';
const negativePrompt = 'text, watermark, logo, cartoon, cheap, ugly, distorted, messy, low quality, artifacts, 3d render plastic';

const entries = [];
let promptsMd = '# Zodiac Weekly Image Prompts\n\nTotal: 91 prompts.\nGlobal requirements apply to all prompts.\n\n';

for (const channel of channels) {
  const dir = path.join('public', 'assets', 'zodiac-weekly', channel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.gitkeep'), '');
  
  promptsMd += `## ${channel.toUpperCase()}\n\n`;

  for (const day of weekdays) {
    const expectedPath = `public/assets/zodiac-weekly/${channel}/${day}.jpg`;
    const prompt = `${globalPrompt}. Sign identity: ${channelIdentities[channel]}. Weekday mood: ${weekdayMoods[day]}.`;
    
    entries.push({
      channel,
      weekday: day,
      expectedPath,
      prompt,
      negativePrompt,
      status: 'missing',
      notes: ''
    });

    promptsMd += `### ${day.toUpperCase()}\n\n**File:** \`${expectedPath}\`\n\n**Prompt:**\n\`\`\`\n${prompt}\n\`\`\`\n\n**Negative Prompt:**\n\`\`\`\n${negativePrompt}\n\`\`\`\n\n---\n\n`;
  }
}

fs.writeFileSync('data/zodiac-weekly-visual-assets.json', JSON.stringify(entries, null, 2));
fs.writeFileSync('docs/ZODIAC_WEEKLY_IMAGE_PROMPTS.md', promptsMd);
console.log('Created folders, .gitkeeps, JSON and prompts pack!');
