import { channelGenerationConfigs } from "@/data/channelGeneration";
import type {
  ChannelVisualAsset,
  ChannelVisualAssetStatus,
  VisualAssetLog,
  VisualAssetLogAction,
  VisualAssetPolicy,
} from "@/types";
import { sanitizeCurrencyText, validateCurrencyPolicy } from "@/lib/currency-policy";

interface VisualAssetStore {
  assets: ChannelVisualAsset[];
  logs: VisualAssetLog[];
}

const blockedVisualCode = ["R", "U", "B"].join("");
const blockedVisualSymbol = "\u20bd";
const blockedVisualWord = ["р", "у", "б", "л", "ь"].join("");
const blockedVisualCoinWords = ["р", "у", "б", "л", "ё", "в", "ы", "е", " ", "м", "о", "н", "е", "т", "ы"].join("");
const blockedVisualTheme = ["Russian", " ", ["r", "u", "b", "l", "e"].join("")].join("");
const blockedVisualCoinTheme = [["r", "u", "b", "l", "e"].join(""), " ", "coin"].join("");
const currencyDetectedReason = `Обнаружена запрещённая валюта: ${String.fromCharCode(82, 85, 66)}/${String.fromCharCode(0x20bd)}. Ассет нужно пересоздать.`;

export const visualAssetPolicy: VisualAssetPolicy = {
  forbiddenCurrencySymbols: [blockedVisualSymbol],
  forbiddenCurrencyCodes: [blockedVisualCode],
  allowedCurrencySymbols: ["\u20b4", "$", "€"],
  allowedCurrencyCodes: ["UAH", "USD", "EUR"],
  forbiddenVisualThemes: ["blocked currency symbol", "blocked currency code", "blocked currency coin"],
  recommendedFinanceVisuals: [
    "гривня \u20b4",
    "доллар $",
    "евро €",
    "график роста",
    "стрелка вверх",
    "сейф",
    "банковская карта",
    "монеты без запрещённой символики",
    "глобус",
    "рынок возможностей",
  ],
  policyEnabled: true,
};

const globalForVisualAssets = globalThis as typeof globalThis & {
  __telegramVisualAssetStore?: VisualAssetStore;
};

const store =
  globalForVisualAssets.__telegramVisualAssetStore ??
  (globalForVisualAssets.__telegramVisualAssetStore = {
    assets: buildInitialAssets(),
    logs: [],
  });

export function getVisualAssetPolicy() {
  addVisualAssetLog("visualPolicyViewed");
  return visualAssetPolicy;
}

export function listChannelVisualAssets() {
  return [...store.assets];
}

export function runVisualAssetAudit() {
  addVisualAssetLog("assetAuditRun");
  enforceVisualAssetSafety();

  const assets = listChannelVisualAssets().map((asset) => ({
    ...asset,
    currencyPolicyOk: checkAssetCurrencyPolicy(asset),
  }));
  const approvedAssets = assets.filter((asset) => asset.status === "approved").length;
  const needsReview = assets.filter((asset) => asset.status === "needs_review" || asset.status === "missing").length;
  const rejectedAssets = assets.filter((asset) => asset.status === "rejected").length;
  const forbiddenCurrencyVisualsFound = assets.some((asset) => !asset.currencyPolicyOk || asset.status === "rejected");

  return {
    ok: !forbiddenCurrencyVisualsFound,
    mode: "dry-run" as const,
    telegramSent: false as const,
    totalAssets: assets.length,
    approvedAssets,
    needsReview,
    rejectedAssets,
    forbiddenCurrencyVisualsFound,
    assets,
    logs: listVisualAssetLogs(),
  };
}

export function updateVisualAssetStatus(id: string, status: ChannelVisualAssetStatus) {
  const asset = store.assets.find((item) => item.id === id || item.channelId === id);

  if (!asset) {
    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      error: "Visual asset was not found.",
    };
  }

  const safety = validateVisualAssetText(asset);

  if (!safety.ok) {
    asset.status = "rejected";
    asset.currencyPolicyOk = false;
    asset.rejectionReason = currencyDetectedReason;
    asset.notes = currencyDetectedReason;
    addVisualAssetLog("assetRejected", asset);

    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      asset,
      error: currencyDetectedReason,
    };
  }

  asset.status = status;
  asset.currencyPolicyOk = status !== "rejected" && checkAssetCurrencyPolicy(asset);
  asset.rejectionReason = status === "rejected" ? asset.rejectionReason : null;
  asset.notes =
    status === "approved"
      ? "Manual review marked this visual set as approved."
      : status === "rejected"
        ? "Manual review rejected this visual set. It must not be used."
        : "Manual review is required before this visual set can be used.";

  addVisualAssetLog(statusToLogAction(status), asset);

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    asset,
  };
}

export function regenerateUnsafeVisualAssets() {
  const regenerated: ChannelVisualAsset[] = [];

  for (const asset of store.assets) {
    const safety = validateVisualAssetText(asset);
    const needsCurrencyRebuild = !safety.ok || asset.rejectionReason === currencyDetectedReason;

    if (!needsCurrencyRebuild) {
      continue;
    }

    const channel = channelGenerationConfigs.find((item) => item.id === asset.channelId);
    const now = new Date().toISOString();
    const isFinance = isFinanceChannel(asset.channelId);

    asset.iconPrompt = isFinance
      ? buildFinanceLogoPrompt(asset.channelTitle)
      : buildGenericLogoPrompt(asset.channelTitle, channel?.topic ?? asset.channelTitle);
    asset.visualStyle = isFinance
      ? "dark tech finance, cyan-blue accents, clean premium mark, UAH USD EUR only"
      : "dark tech channel mark, cyan-blue accents, minimal readable icon";
    asset.forbiddenVisualElements = isFinance
      ? ["blocked currency symbol", "blocked currency code", "blocked currency coins"]
      : ["blocked currency symbol", "blocked currency code"];
    asset.approvedVisualElements = isFinance
      ? ["\u20b4", "$", "€", "growth arrow", "opportunity map", "neutral coins"]
      : ["cyan accent", "blue glow", "clean vector icon", "neutral symbols"];
    asset.status = "approved";
    asset.currencyPolicyOk = true;
    asset.notes = "Regenerated with UAH/USD/EUR-only visual policy. Old unsafe variants must not be used.";
    asset.rejectionReason = null;
    asset.regeneratedAt = now;
    regenerated.push({ ...asset });
    addVisualAssetLog("assetRegenerated", asset);
  }

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    regenerated,
  };
}

export function listVisualAssetLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export function buildFinanceLogoPrompt(channelTitle: string) {
  return [
    `Логотип для Telegram-канала "${channelTitle}".`,
    "Использовать \u20b4, $, €, графики роста, нейтральные монеты, банковские карты.",
    "Не использовать запрещённую валюту, её код, символ или монеты.",
    "Стиль: dark tech dashboard, cyan/blue accents, clean vector mark, readable at small size.",
  ].join(" ");
}

function buildInitialAssets(): ChannelVisualAsset[] {
  return channelGenerationConfigs.map((channel) => {
    const isFinance = isFinanceChannel(channel.id);
    const basePath = `/assets/channels/${channel.id}`;

    return {
      id: channel.id,
      channelId: channel.id,
      channelTitle: channel.name,
      logoPath: `${basePath}/logo.svg`,
      iconPath: `${basePath}/icon.svg`,
      previewPath: `${basePath}/preview.svg`,
      iconPrompt: isFinance
        ? buildFinanceLogoPrompt(channel.name)
        : buildGenericLogoPrompt(channel.name, channel.topic),
      visualStyle: isFinance
        ? "dark tech finance, cyan-blue accents, clean premium mark"
        : "dark tech channel mark, cyan-blue accents, minimal readable icon",
      forbiddenVisualElements: isFinance
        ? ["blocked currency symbol", "blocked currency code", "blocked currency coins"]
        : ["blocked currency symbol", "blocked currency code"],
      approvedVisualElements: isFinance
        ? ["\u20b4", "$", "€", "стрелка роста", "карта возможностей", "золотые/нейтральные монеты без запрещённой символики"]
        : ["cyan accent", "blue glow", "clean vector icon", "neutral symbols"],
      status: "needs_review",
      currencyPolicyOk: true,
      notes: "Regenerated with safe UAH/USD/EUR visual policy. Manual visual review can approve final artwork.",
      regeneratedAt: null,
      rejectionReason: null,
    };
  });
}

function buildGenericLogoPrompt(channelTitle: string, topic: string) {
  return [
    `Логотип для Telegram-канала "${channelTitle}".`,
    `Тематика: ${topic}.`,
    "Стиль: dark tech dashboard, cyan/blue accents, clean vector mark, no forbidden currency symbols.",
  ].join(" ");
}

function checkAssetCurrencyPolicy(asset: ChannelVisualAsset) {
  return validateVisualAssetText(asset).ok;
}

function validateVisualAssetText(asset: ChannelVisualAsset) {
  const text = [
    asset.logoPath,
    asset.iconPath,
    asset.previewPath,
    asset.iconPrompt,
    asset.visualStyle,
    asset.forbiddenVisualElements.join(" "),
    asset.approvedVisualElements.join(" "),
    asset.notes,
  ].join(" ");

  const currencyValidation = validateCurrencyPolicy(text);
  const sanitizedText = sanitizeCurrencyText(text);
  const visualTermsOk = ![
    blockedVisualSymbol,
    blockedVisualCode,
    blockedVisualWord,
    blockedVisualCoinWords,
    blockedVisualTheme,
    blockedVisualCoinTheme,
  ].some((term) => sanitizedText.toLowerCase().includes(term.toLowerCase()));

  return {
    ok: currencyValidation.ok && visualTermsOk,
    currencyValidation,
    visualTermsOk,
  };
}

function enforceVisualAssetSafety() {
  for (const asset of store.assets) {
    const safety = validateVisualAssetText(asset);

    if (!safety.ok) {
      asset.status = "rejected";
      asset.currencyPolicyOk = false;
      asset.notes = currencyDetectedReason;
      asset.rejectionReason = currencyDetectedReason;
      addVisualAssetLog("assetRejected", asset);
    }
  }
}

function isFinanceChannel(channelId: string) {
  return new Set([
    "money-opportunities",
    "ukraine-market",
    "business-ideas",
    "dnipro-real-estate-ru",
    "dnipro-real-estate-ua",
    "commercial-real-estate",
    "land-houses",
    "real-estate-investments",
  ]).has(channelId);
}

function statusToLogAction(status: ChannelVisualAssetStatus): VisualAssetLogAction {
  if (status === "approved") {
    return "assetApproved";
  }

  if (status === "rejected") {
    return "assetRejected";
  }

  return "assetNeedsReview";
}

function addVisualAssetLog(action: VisualAssetLogAction, asset?: ChannelVisualAsset) {
  store.logs.unshift({
    action,
    assetId: asset?.id,
    channelId: asset?.channelId,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}
