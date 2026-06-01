import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md"]);
const ignoredDirs = new Set(["node_modules", ".next", ".git"]);

const specialCp1251 = new Map([
  [0x0402, 0x80], [0x0403, 0x81], [0x201a, 0x82], [0x0453, 0x83],
  [0x201e, 0x84], [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87],
  [0x20ac, 0x88], [0x2030, 0x89], [0x0409, 0x8a], [0x2039, 0x8b],
  [0x040a, 0x8c], [0x040c, 0x8d], [0x040b, 0x8e], [0x040f, 0x8f],
  [0x0452, 0x90], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x2122, 0x99], [0x0459, 0x9a], [0x203a, 0x9b], [0x045a, 0x9c],
  [0x045c, 0x9d], [0x045b, 0x9e], [0x045f, 0x9f], [0x00a0, 0xa0],
  [0x040e, 0xa1], [0x045e, 0xa2], [0x0408, 0xa3], [0x00a4, 0xa4],
  [0x0490, 0xa5], [0x00a6, 0xa6], [0x00a7, 0xa7], [0x0401, 0xa8],
  [0x00a9, 0xa9], [0x0404, 0xaa], [0x00ab, 0xab], [0x00ac, 0xac],
  [0x00ad, 0xad], [0x00ae, 0xae], [0x0407, 0xaf], [0x00b0, 0xb0],
  [0x00b1, 0xb1], [0x0406, 0xb2], [0x0456, 0xb3], [0x0491, 0xb4],
  [0x00b5, 0xb5], [0x00b6, 0xb6], [0x00b7, 0xb7], [0x0451, 0xb8],
  [0x2116, 0xb9], [0x0454, 0xba], [0x00bb, 0xbb], [0x0458, 0xbc],
  [0x0405, 0xbd], [0x0455, 0xbe], [0x0457, 0xbf],
]);

function toCp1251Byte(char) {
  const code = char.charCodeAt(0);
  if (code <= 0x7f) return code;
  if (code >= 0x0410 && code <= 0x044f) return code - 0x0410 + 0xc0;
  return specialCp1251.get(code);
}

const markerPairs = [
  [0x0420, 0x040f],
  [0x0420, 0x0405],
  [0x0420, 0x0456],
  [0x0420, 0x00b5],
  [0x0420, 0x00b0],
  [0x00d0],
  [0x00d1],
  [0xfffd],
].map((codes) => String.fromCharCode(...codes));

function hasMarker(value) {
  return markerPairs.some((marker) => value.includes(marker));
}

function markerCount(value) {
  return markerPairs.reduce((sum, marker) => sum + value.split(marker).length - 1, 0);
}

function cyrillicCount(value) {
  return [...value].filter((char) => {
    const code = char.charCodeAt(0);
    return (code >= 0x0400 && code <= 0x04ff) || code === 0x00b4;
  }).length;
}

function decodeSegment(value) {
  const bytes = [];

  for (const char of value) {
    const byte = toCp1251Byte(char);
    if (byte === undefined) return value;
    bytes.push(byte);
  }

  const decoded = Buffer.from(bytes).toString("utf8");
  if (decoded.includes(String.fromCharCode(0xfffd))) return value;
  if (markerCount(decoded) >= markerCount(value)) return value;
  if (cyrillicCount(decoded) < Math.max(1, cyrillicCount(value) / 4)) return value;
  return decoded;
}

function repairText(text) {
  const segmentPattern = /[^\x00-\x7fA-Za-z0-9{}<>=[\];]+(?:[A-Za-z0-9 .,!?:"'()/_+\-\n\r%#@*|&]+[^\x00-\x7fA-Za-z0-9{}<>=[\];]+)*/g;
  const stringPattern = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  const withStrings = text.replace(stringPattern, (full, quote, body) => {
    if (!hasMarker(body)) return full;
    return `${quote}${decodeSegment(body)}${quote}`;
  });

  return withStrings.replace(segmentPattern, (segment) => (hasMarker(segment) ? decodeSegment(segment) : segment));
}

function listFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      result.push(...listFiles(fullPath));
      continue;
    }
    if (allowedExtensions.has(path.extname(entry)) && entry !== "package-lock.json") {
      result.push(fullPath);
    }
  }
  return result;
}

let changed = 0;
for (const file of listFiles(root)) {
  const before = readFileSync(file, "utf8");
  const after = repairText(before);
  if (after !== before) {
    writeFileSync(file, after, "utf8");
    changed += 1;
    console.log(path.relative(root, file));
  }
}

console.log(JSON.stringify({ changed }));
