import fs from "fs";
import path from "path";
import process from "process";

const ZODIAC_CHANNEL_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const ASSET_TYPES = [
  { id: 'avatar', folder: 'avatars', exts: ['png', 'jpg'] },
  { id: 'cover', folder: 'covers', exts: ['jpg', 'png'] },
  { id: 'daily', folder: 'daily', exts: ['jpg', 'png'] },
  { id: 'weekly', folder: 'weekly', exts: ['jpg', 'png'] }
];

export function getZodiacVisualAsset(sign, assetType) {
  if (!ZODIAC_CHANNEL_IDS.includes(sign)) {
    return { ok: false, error: `Unknown sign: ${sign}` };
  }

  const typeConfig = ASSET_TYPES.find(t => t.id === assetType);
  if (!typeConfig) {
    return { ok: false, error: `Unknown assetType: ${assetType}` };
  }

  const baseDir = path.join(process.cwd(), "public", "assets", "zodiac", typeConfig.folder);
  
  for (const ext of typeConfig.exts) {
    const fileName = `${typeConfig.id}-${sign}.${ext}`;
    const filePath = path.join(baseDir, fileName);
    if (fs.existsSync(filePath)) {
      return { ok: true, path: filePath, relative: `/assets/zodiac/${typeConfig.folder}/${fileName}` };
    }
  }

  return { ok: false, error: `Missing zodiac visual asset: sign=${sign} assetType=${assetType} expectedPath=${path.join(baseDir, typeConfig.id + "-" + sign + ".*")}` };
}

export function validateZodiacVisualAssetSet(sign) {
  const result = {
    sign,
    ok: true,
    assets: {},
    missing: []
  };

  for (const type of ASSET_TYPES) {
    const asset = getZodiacVisualAsset(sign, type.id);
    if (asset.ok) {
      result.assets[type.id] = asset.path;
    } else {
      result.ok = false;
      result.missing.push(asset.error);
    }
  }

  return result;
}
