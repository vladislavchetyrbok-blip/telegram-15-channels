import { deflateSync } from "node:zlib";

const width = 1080;
const height = 1350;

type Rgb = [number, number, number];

interface VisualInput {
  channelId: string;
  postId: string;
  title?: string;
  topic?: string;
  visualMode?: "premium_card" | "realistic_cover";
}

const palettes: Record<string, { bg: Rgb[]; accent: Rgb; soft: Rgb; ink: Rgb }> = {
  "money-opportunities": { bg: [[6, 23, 37], [17, 70, 62], [10, 18, 32]], accent: [246, 196, 83], soft: [54, 211, 153], ink: [235, 246, 255] },
  "ai-tech": { bg: [[5, 16, 35], [15, 64, 96], [39, 28, 73]], accent: [96, 221, 255], soft: [167, 139, 250], ink: [230, 249, 255] },
  "ukraine-market": { bg: [[8, 42, 83], [20, 83, 45], [18, 25, 45]], accent: [251, 211, 77], soft: [96, 165, 250], ink: [241, 245, 249] },
  "mens-style": { bg: [[18, 24, 34], [55, 65, 81], [20, 30, 40]], accent: [212, 175, 55], soft: [148, 163, 184], ink: [245, 245, 244] },
  "home-tech": { bg: [[10, 31, 46], [19, 78, 74], [17, 24, 39]], accent: [125, 211, 252], soft: [226, 232, 240], ink: [241, 245, 249] },
  "fishing-rest": { bg: [[5, 32, 48], [16, 92, 84], [25, 56, 38]], accent: [103, 232, 249], soft: [134, 239, 172], ink: [240, 253, 250] },
  "dnipro-city": { bg: [[13, 27, 42], [30, 64, 105], [45, 55, 72]], accent: [56, 189, 248], soft: [250, 204, 21], ink: [241, 245, 249] },
  "auto-comfort": { bg: [[16, 24, 39], [71, 85, 105], [6, 35, 52]], accent: [248, 113, 113], soft: [203, 213, 225], ink: [248, 250, 252] },
  "business-ideas": { bg: [[6, 31, 46], [37, 99, 89], [17, 24, 39]], accent: [52, 211, 153], soft: [250, 204, 21], ink: [236, 253, 245] },
  "personal-progress": { bg: [[17, 24, 39], [46, 60, 87], [20, 83, 75]], accent: [129, 140, 248], soft: [45, 212, 191], ink: [241, 245, 249] },
  "dnipro-real-estate-ru": { bg: [[20, 28, 43], [87, 72, 53], [38, 53, 80]], accent: [251, 191, 36], soft: [148, 163, 184], ink: [248, 250, 252] },
  "dnipro-real-estate-ua": { bg: [[19, 45, 72], [87, 74, 37], [30, 64, 80]], accent: [250, 204, 21], soft: [125, 211, 252], ink: [248, 250, 252] },
  "commercial-real-estate": { bg: [[15, 23, 42], [51, 65, 85], [21, 94, 117]], accent: [34, 211, 238], soft: [203, 213, 225], ink: [248, 250, 252] },
  "land-houses": { bg: [[25, 54, 38], [92, 72, 46], [17, 32, 41]], accent: [132, 204, 22], soft: [250, 204, 21], ink: [247, 254, 231] },
  "real-estate-investments": { bg: [[16, 24, 39], [88, 61, 45], [11, 57, 84]], accent: [251, 191, 36], soft: [56, 189, 248], ink: [248, 250, 252] },
};

export function buildPostVisualPng(input: VisualInput) {
  const palette = palettes[input.channelId] ?? palettes["ai-tech"];
  const seed = hash(`${input.channelId}:${input.postId}:${input.title ?? ""}`);
  const raw = Buffer.alloc((width * 3 + 1) * height);

  paintBackground(raw, palette, seed);
  drawEditorialLight(raw, palette, seed);
  drawVignette(raw);
  drawMotif(raw, input.channelId, palette, seed);
  if (input.visualMode === "realistic_cover") drawRealisticCover(raw, input.channelId, input.topic ?? input.title ?? "", palette, seed);
  else drawPremiumDetails(raw, palette, seed);
  drawFrame(raw, palette);

  return encodePng(raw);
}

function paintBackground(raw: Buffer, palette: typeof palettes[string], seed: number) {
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;

    for (let x = 0; x < width; x += 1) {
      const i = row + 1 + x * 3;
      const t = x / width;
      const u = y / height;
      const wave = Math.sin((x + seed) * 0.011) * 8 + Math.cos((y - seed) * 0.013) * 8;
      raw[i] = clamp(mix(palette.bg[0][0], palette.bg[1][0], t) + wave);
      raw[i + 1] = clamp(mix(palette.bg[0][1], palette.bg[2][1], u) + wave / 2);
      raw[i + 2] = clamp(mix(palette.bg[1][2], palette.bg[2][2], t * 0.7 + u * 0.3) + wave);
    }
  }
}

function drawMotif(raw: Buffer, channelId: string, palette: typeof palettes[string], seed: number) {
  if (channelId.includes("real-estate") || channelId === "land-houses" || channelId === "commercial-real-estate") {
    drawBuildings(raw, palette, seed);
    return;
  }

  if (channelId === "ai-tech") {
    drawNetwork(raw, palette, seed);
    return;
  }

  if (channelId === "fishing-rest") {
    drawWater(raw, palette, seed);
    return;
  }

  if (channelId === "auto-comfort") {
    drawRoad(raw, palette);
    return;
  }

  if (channelId === "mens-style") {
    drawStyleObjects(raw, palette);
    return;
  }

  if (channelId === "home-tech") {
    drawInteriorTech(raw, palette);
    return;
  }

  if (channelId === "dnipro-city") {
    drawCityGrid(raw, palette, seed);
    return;
  }

  if (channelId === "personal-progress") {
    drawFocusDesk(raw, palette);
    return;
  }

  drawOpportunityBoard(raw, palette, seed);
}

function drawOpportunityBoard(raw: Buffer, palette: typeof palettes[string], seed: number) {
  drawRect(raw, 92, 84, 500, 450, [8, 18, 32], 0.88);
  for (let i = 0; i < 5; i += 1) {
    drawRect(raw, 130, 128 + i * 66, 360 + (i % 2) * 40, 24, i % 2 ? palette.soft : palette.ink, 0.9);
    drawCircle(raw, 108, 140 + i * 66, 14, palette.accent);
  }
  drawBars(raw, 735, 235, palette);
  drawCircle(raw, 945, 180, 82, palette.accent, 0.85);
  drawCircle(raw, 1025, 265, 42, palette.soft, 0.75);
  drawRect(raw, 785, 475, 275, 38, palette.ink, 0.22);
}

function drawNetwork(raw: Buffer, palette: typeof palettes[string], seed: number) {
  const nodes = Array.from({ length: 18 }, (_, i) => ({
    x: 170 + ((i * 137 + seed) % 850),
    y: 110 + ((i * 89 + seed) % 430),
  }));
  for (let i = 0; i < nodes.length - 1; i += 1) drawLine(raw, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, palette.soft);
  nodes.forEach((node, i) => drawCircle(raw, node.x, node.y, i % 3 === 0 ? 18 : 11, i % 2 ? palette.accent : palette.ink));
  drawRect(raw, 740, 360, 300, 118, [8, 18, 32], 0.86);
  drawRect(raw, 770, 390, 190, 16, palette.accent);
  drawRect(raw, 770, 424, 240, 12, palette.soft);
}

function drawWater(raw: Buffer, palette: typeof palettes[string], seed: number) {
  for (let y = 330; y < 570; y += 34) {
    for (let x = 70; x < 1130; x += 6) {
      const yy = y + Math.round(Math.sin((x + seed) * 0.025) * 13);
      drawRect(raw, x, yy, 4, 3, x % 3 ? palette.accent : palette.soft, 0.7);
    }
  }
  drawLine(raw, 220, 170, 870, 420, palette.ink);
  drawCircle(raw, 880, 423, 18, palette.accent);
  drawRect(raw, 150, 455, 270, 48, [7, 18, 28], 0.75);
}

function drawRoad(raw: Buffer, palette: typeof palettes[string]) {
  fillPoly(raw, [[520, 675], [680, 675], [760, 260], [440, 260]], [13, 18, 28]);
  drawLine(raw, 600, 675, 600, 290, palette.accent);
  drawRect(raw, 765, 330, 220, 95, [8, 18, 32], 0.85);
  drawCircle(raw, 820, 430, 34, palette.ink);
  drawCircle(raw, 940, 430, 34, palette.ink);
  drawRect(raw, 180, 150, 280, 170, palette.soft, 0.2);
}

function drawStyleObjects(raw: Buffer, palette: typeof palettes[string]) {
  drawManJacket(raw, palette, 340, 120, 1.05);
  drawRect(raw, 690, 170, 250, 250, [8, 18, 32], 0.64);
  drawCircle(raw, 815, 295, 76, palette.accent, 0.44);
  drawRect(raw, 680, 475, 300, 24, palette.ink, 0.42);
}

function drawRealisticCover(raw: Buffer, channelId: string, topic: string, palette: typeof palettes[string], seed: number) {
  drawRect(raw, 0, 650, width, 700, [0, 0, 0], 0.2);

  if (channelId === "mens-style") {
    drawManJacket(raw, palette, 490, 130, topic.toLowerCase().includes("пальто") ? 1.22 : 1);
    drawRect(raw, 120, 870, 840, 4, palette.accent, 0.35);
    return;
  }

  if (channelId === "auto-comfort") {
    drawCarSilhouette(raw, palette, 205, 540);
    return;
  }

  if (channelId === "fishing-rest") {
    drawFishingScene(raw, palette, seed);
    return;
  }

  if (channelId.includes("real-estate") || channelId === "commercial-real-estate" || channelId === "land-houses") {
    drawPropertyHero(raw, palette, channelId);
    return;
  }

  if (channelId === "home-tech") {
    drawHomeDevice(raw, palette);
    return;
  }

  if (channelId === "dnipro-city") {
    drawStreetScene(raw, palette, seed);
  }
}

function drawManJacket(raw: Buffer, palette: typeof palettes[string], x: number, y: number, scale: number) {
  const sx = (value: number) => Math.round(x + value * scale);
  const sy = (value: number) => Math.round(y + value * scale);
  drawCircle(raw, sx(120), sy(64), Math.round(46 * scale), [28, 24, 22], 0.95);
  fillPoly(raw, [[sx(42), sy(160)], [sx(198), sy(160)], [sx(260), sy(520)], [sx(-20), sy(520)]], [18, 24, 34]);
  fillPoly(raw, [[sx(72), sy(170)], [sx(118), sy(250)], [sx(96), sy(520)], [sx(12), sy(520)]], [44, 52, 64]);
  fillPoly(raw, [[sx(168), sy(170)], [sx(122), sy(250)], [sx(148), sy(520)], [sx(238), sy(520)]], [44, 52, 64]);
  fillPoly(raw, [[sx(102), sy(160)], [sx(138), sy(160)], [sx(122), sy(265)]], palette.accent);
  drawLine(raw, sx(120), sy(235), sx(120), sy(505), palette.soft);
  drawCircle(raw, sx(102), sy(320), Math.round(8 * scale), palette.accent, 0.8);
  drawCircle(raw, sx(102), sy(380), Math.round(8 * scale), palette.accent, 0.8);
}

function drawCarSilhouette(raw: Buffer, palette: typeof palettes[string], x: number, y: number) {
  fillPoly(raw, [[x + 80, y + 110], [x + 210, y + 20], [x + 520, y + 20], [x + 710, y + 110], [x + 760, y + 210], [x + 40, y + 210]], [14, 21, 32]);
  fillPoly(raw, [[x + 245, y + 45], [x + 360, y + 45], [x + 350, y + 112], [x + 190, y + 112]], palette.soft);
  fillPoly(raw, [[x + 385, y + 45], [x + 510, y + 45], [x + 640, y + 112], [x + 395, y + 112]], palette.soft);
  drawCircle(raw, x + 185, y + 220, 62, [6, 10, 16], 1);
  drawCircle(raw, x + 185, y + 220, 28, palette.accent, 0.75);
  drawCircle(raw, x + 620, y + 220, 62, [6, 10, 16], 1);
  drawCircle(raw, x + 620, y + 220, 28, palette.accent, 0.75);
}

function drawFishingScene(raw: Buffer, palette: typeof palettes[string], seed: number) {
  drawWater(raw, palette, seed);
  fillPoly(raw, [[210, 740], [520, 700], [720, 735], [570, 790], [255, 790]], [14, 22, 28]);
  drawLine(raw, 690, 665, 930, 390, palette.ink);
  drawCircle(raw, 935, 386, 12, palette.accent);
}

function drawPropertyHero(raw: Buffer, palette: typeof palettes[string], channelId: string) {
  if (channelId === "land-houses") {
    fillPoly(raw, [[170, 730], [420, 520], [670, 730]], [44, 52, 38]);
    drawRect(raw, 240, 730, 360, 210, [20, 28, 34], 0.95);
    drawRect(raw, 376, 805, 88, 135, palette.accent, 0.55);
    drawRect(raw, 100, 955, 900, 26, [65, 84, 52], 0.85);
    return;
  }

  drawBuildings(raw, palette, 11);
  drawRect(raw, 140, 725, 780, 56, [8, 18, 32], 0.72);
}

function drawHomeDevice(raw: Buffer, palette: typeof palettes[string]) {
  drawRect(raw, 280, 500, 520, 360, [235, 245, 255], 0.12);
  drawRect(raw, 350, 560, 380, 220, [8, 18, 32], 0.86);
  drawRect(raw, 390, 610, 270, 22, palette.accent, 0.85);
  drawRect(raw, 390, 665, 220, 18, palette.soft, 0.65);
  drawCircle(raw, 690, 720, 30, palette.accent, 0.75);
}

function drawStreetScene(raw: Buffer, palette: typeof palettes[string], seed: number) {
  drawCityGrid(raw, palette, seed);
  drawLine(raw, 180, 820, 900, 980, palette.soft);
  drawLine(raw, 260, 980, 980, 820, palette.accent);
}

function drawInteriorTech(raw: Buffer, palette: typeof palettes[string]) {
  drawRect(raw, 110, 140, 410, 270, [236, 245, 255], 0.14);
  drawRect(raw, 155, 190, 180, 150, palette.ink, 0.64);
  drawCircle(raw, 720, 270, 120, palette.accent, 0.24);
  drawRect(raw, 660, 220, 300, 160, [8, 18, 32], 0.86);
  drawRect(raw, 700, 260, 220, 18, palette.accent);
  drawRect(raw, 700, 300, 160, 12, palette.soft);
}

function drawCityGrid(raw: Buffer, palette: typeof palettes[string], seed: number) {
  for (let i = 0; i < 9; i += 1) {
    const x = 90 + i * 118;
    const h = 150 + ((seed + i * 47) % 210);
    drawRect(raw, x, 520 - h, 72, h, i % 2 ? [15, 23, 42] : [30, 41, 59], 0.86);
    drawRect(raw, x + 14, 540 - h, 12, 12, palette.accent);
    drawRect(raw, x + 42, 580 - h, 12, 12, palette.soft);
  }
  drawLine(raw, 90, 560, 1110, 560, palette.ink);
}

function drawFocusDesk(raw: Buffer, palette: typeof palettes[string]) {
  drawRect(raw, 190, 150, 820, 360, [8, 18, 32], 0.72);
  drawCircle(raw, 382, 310, 108, palette.accent, 0.44);
  drawRect(raw, 565, 220, 300, 36, palette.ink, 0.9);
  drawRect(raw, 565, 286, 230, 18, palette.soft, 0.86);
  drawRect(raw, 565, 334, 270, 18, palette.soft, 0.64);
}

function drawBuildings(raw: Buffer, palette: typeof palettes[string], seed: number) {
  drawRect(raw, 115, 120, 340, 380, [8, 18, 32], 0.86);
  drawRect(raw, 510, 185, 250, 315, [15, 23, 42], 0.9);
  drawRect(raw, 815, 95, 220, 405, [30, 41, 59], 0.86);
  for (let y = 160; y < 470; y += 52) {
    for (let x = 150; x < 1010; x += 82) {
      if ((x + y + seed) % 3 !== 0) drawRect(raw, x, y, 28, 22, palette.accent, 0.68);
    }
  }
  drawLine(raw, 90, 520, 1110, 520, palette.ink);
}

function drawBars(raw: Buffer, x: number, y: number, palette: typeof palettes[string]) {
  [150, 230, 110, 280, 190].forEach((h, i) => drawRect(raw, x + i * 62, y + 300 - h, 36, h, i % 2 ? palette.accent : palette.soft, 0.86));
}

function drawFrame(raw: Buffer, palette: typeof palettes[string]) {
  drawRect(raw, 58, 54, width - 116, 4, palette.accent, 0.8);
  drawRect(raw, 58, height - 58, width - 116, 4, palette.soft, 0.65);
  drawRect(raw, 58, 54, 4, height - 112, palette.accent, 0.55);
  drawRect(raw, width - 62, 54, 4, height - 112, palette.soft, 0.55);
}

function drawEditorialLight(raw: Buffer, palette: typeof palettes[string], seed: number) {
  drawCircle(raw, 220 + (seed % 120), 150, 180, palette.accent, 0.12);
  drawCircle(raw, 1050 - (seed % 90), 520, 240, palette.soft, 0.1);
  drawRect(raw, 0, 0, width, 88, [255, 255, 255], 0.025);
  drawRect(raw, 0, height - 130, width, 130, [0, 0, 0], 0.12);
}

function drawPremiumDetails(raw: Buffer, palette: typeof palettes[string], seed: number) {
  for (let i = 0; i < 42; i += 1) {
    const x = (seed + i * 97) % width;
    const y = (seed * 3 + i * 53) % height;
    const color = i % 3 === 0 ? palette.accent : i % 3 === 1 ? palette.soft : palette.ink;
    drawCircle(raw, x, y, i % 2 === 0 ? 2 : 3, color, 0.24);
  }

  for (let i = 0; i < 7; i += 1) {
    const x = 120 + i * 148;
    const y = 610 + Math.round(Math.sin((seed + i) * 0.7) * 16);
    drawLine(raw, x, y, x + 70, y - 28, i % 2 ? palette.soft : palette.accent);
  }
}

function drawVignette(raw: Buffer) {
  const cx = width / 2;
  const cy = height / 2;
  const max = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    for (let x = 0; x < width; x += 1) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / max;
      const factor = 1 - Math.max(0, d - 0.38) * 0.72;
      const i = row + 1 + x * 3;
      raw[i] = clamp(raw[i] * factor);
      raw[i + 1] = clamp(raw[i + 1] * factor);
      raw[i + 2] = clamp(raw[i + 2] * factor);
    }
  }
}

function drawRect(raw: Buffer, x: number, y: number, w: number, h: number, color: Rgb, opacity = 1) {
  for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy += 1) {
    const row = yy * (width * 3 + 1);
    for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx += 1) {
      blend(raw, row + 1 + xx * 3, color, opacity);
    }
  }
}

function drawCircle(raw: Buffer, cx: number, cy: number, r: number, color: Rgb, opacity = 1) {
  for (let y = Math.max(0, cy - r); y < Math.min(height, cy + r); y += 1) {
    const row = y * (width * 3 + 1);
    for (let x = Math.max(0, cx - r); x < Math.min(width, cx + r); x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) blend(raw, row + 1 + x * 3, color, opacity);
    }
  }
}

function drawLine(raw: Buffer, x1: number, y1: number, x2: number, y2: number, color: Rgb) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const x = Math.round(mix(x1, x2, i / steps));
    const y = Math.round(mix(y1, y2, i / steps));
    drawCircle(raw, x, y, 4, color, 0.78);
  }
}

function fillPoly(raw: Buffer, points: Array<[number, number]>, color: Rgb) {
  const minY = Math.max(0, Math.min(...points.map((p) => p[1])));
  const maxY = Math.min(height, Math.max(...points.map((p) => p[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const intersections: number[] = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) intersections.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) drawRect(raw, Math.round(intersections[i]), y, Math.round(intersections[i + 1] - intersections[i]), 1, color, 0.92);
  }
}

function blend(raw: Buffer, i: number, color: Rgb, opacity: number) {
  raw[i] = clamp(mix(raw[i], color[0], opacity));
  raw[i + 1] = clamp(mix(raw[i + 1], color[1], opacity));
  raw[i + 2] = clamp(mix(raw[i + 2], color[2], opacity));
}

function encodePng(raw: Buffer) {
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr()),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function ihdr() {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 2;
  return buffer;
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (let offset = 0; offset < buffer.length; offset += 1) {
    const byte = buffer[offset];
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function hash(value: string) {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) result = (result * 31 + value.charCodeAt(i)) >>> 0;
  return result;
}

function mix(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
