const fs = require('fs');
const path = require('path');

const channelsObj = JSON.parse(fs.readFileSync(path.join('data', 'config', 'zodiac-channel-links.json'), 'utf-8'));
const descriptions = JSON.parse(fs.readFileSync(path.join('data', 'config', 'zodiac-channel-descriptions.json'), 'utf-8'));

let errors = [];
let validCount = 0;

const channels = Object.keys(channelsObj);

for (const channelSlug of channels) {
  const descInfo = descriptions[channelSlug];
  if (!descInfo) {
    errors.push(`Missing description for ${channelSlug}`);
  } else if (!descInfo.description || descInfo.description.trim() === '') {
    errors.push(`Empty description for ${channelSlug}`);
  } else {
    validCount++;
    console.log(`[OK] ${channelSlug} -> ${descInfo.description.replace(/\n/g, ' ')}`);
  }
}

const descKeys = Object.keys(descriptions);
if (descKeys.length !== channels.length) {
   errors.push(`Count mismatch: ${descKeys.length} descriptions, ${channels.length} channels`);
}

if (errors.length > 0) {
  console.error('\nERRORS:');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log(`\nSUCCESS: ${validCount} descriptions validated successfully. 0 Telegram API calls made. 0 Ledger writes.`);
}
