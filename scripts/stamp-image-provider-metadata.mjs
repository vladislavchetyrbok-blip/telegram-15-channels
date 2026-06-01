import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const planPath = path.join(root, "data", "runtime", "weekly-content-plan.json");

if (!fs.existsSync(planPath)) {
  console.log(JSON.stringify({ ok: false, error: "weekly-content-plan.json not found" }, null, 2));
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(planPath, "utf8"));
const items = Array.isArray(state.items) ? state.items : [];
let changed = 0;

for (const item of items) {
  const isPremiumV2 = item.visualVersion === "premium_v2" || item.premiumVersion === "premium_v2";
  if (!isPremiumV2) continue;

  const generatedAt = item.visualGeneratedAt || item.updatedAt || new Date().toISOString();
  const dimensions = item.imageDimensions || { width: 1080, height: 1350 };
  const visualPreset = item.visualPreset || "premium_business_editorial";

  const nextFields = {
    provider: "local_template",
    fallbackProvider: "local_template",
    fallbackUsed: false,
    premiumVersion: "premium_v2",
    source: "template",
  };

  for (const [key, value] of Object.entries(nextFields)) {
    if (item[key] !== value) {
      item[key] = value;
      changed += 1;
    }
  }

  const nextMetadata = {
    ...(item.visualMetadata || {}),
    width: dimensions.width,
    height: dimensions.height,
    format: "png",
    visualStyle: item.visualStyle || `${visualPreset}, premium editorial Telegram cover`,
    visualPreset,
    textStatus: "OK",
    qualityStatus: item.imageQuality || "strong",
    generatedAt,
    version: "premium_v2",
    provider: "local_template",
    fallbackProvider: "local_template",
    fallbackUsed: false,
    premiumVersion: "premium_v2",
    source: "template",
  };

  const before = JSON.stringify(item.visualMetadata || {});
  const after = JSON.stringify(nextMetadata);
  if (before !== after) {
    item.visualMetadata = nextMetadata;
    changed += 1;
  }
}

state.updatedAt = new Date().toISOString();
state.providerMetadataSummary = {
  provider: "local_template",
  fallbackProvider: "local_template",
  fallbackUsed: false,
  premiumVersion: "premium_v2",
  source: "template",
  stampedAt: state.updatedAt,
  stampedItems: items.filter((item) => item.provider === "local_template" && item.premiumVersion === "premium_v2").length,
};

fs.writeFileSync(planPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      total: items.length,
      stampedItems: state.providerMetadataSummary.stampedItems,
      changed,
      telegramSent: false,
      autopublishEnabledChanged: false,
      targetsChanged: false,
    },
    null,
    2,
  ),
);
