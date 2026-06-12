import fs from 'fs';
import path from 'path';

let API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) API_KEY = match[1].trim();
  } catch (e) {}
}

async function generateWithGemini(prompt, filepath) {
  if (!API_KEY) throw new Error('GEMINI_API_KEY is not set.');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [ { prompt } ],
      parameters: { sampleCount: 1, aspectRatio: "1:1", outputOptions: { mimeType: "image/jpeg" } }
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`API Error: ${data.error.message} (Code: ${data.error.code})\n[INFO] Imagen generation requires paid Google AI / Cloud access.`);
  }
  
  const base64 = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.bytes;
  if (!base64) throw new Error('No image bytes in response.');
  
  fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));
}

async function main() {
  console.log('=========================================');
  console.log(' Gemini Zodiac Visual Asset Generator');
  console.log('=========================================\n');

  if (!API_KEY) {
    console.error('[ERROR] GEMINI_API_KEY is missing from environment variables.');
    process.exit(1);
  }

  const queuePath = path.join(process.cwd(), 'docs', 'ZODIAC_FINAL_MISSING_VISUALS_QUEUE.md');
  if (!fs.existsSync(queuePath)) {
    console.error('[ERROR] Queue file not found:', queuePath);
    process.exit(1);
  }

  console.log('[INFO] Queue file found. Parsing missing assets...');
  
  try {
    console.log('[1/52] generating test image to verify API access...');
    await generateWithGemini("A test image of a star", "test.jpg");
    console.log('[SUCCESS] API is working. Continuing with batch...');
  } catch (err) {
    console.error('[BLOCKED] Script failed during generation:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
