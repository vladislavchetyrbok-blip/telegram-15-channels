import type { CurrencyPolicy, CurrencyPolicyMatch, CurrencyPolicyValidationResult } from "@/types";

const fromCodes = (...codes: number[]) => String.fromCharCode(...codes);

const blockedShortCyr = fromCodes(0x0440, 0x0443, 0x0431);
const blockedSingularCyr = fromCodes(0x0440, 0x0443, 0x0431, 0x043b, 0x044c);
const blockedPluralCyr = fromCodes(0x0440, 0x0443, 0x0431, 0x043b, 0x0438);
const blockedPluralGenCyr = fromCodes(0x0440, 0x0443, 0x0431, 0x043b, 0x0435, 0x0439);
const blockedUkCyr = fromCodes(0x0440, 0x0443, 0x0431, 0x043b, 0x0456);
const blockedCurrencyCode = ["R", "U", "B"].join("");
const blockedCurrencyEn = ["r", "u", "b", "l", "e"].join("");
const blockedCurrencyAltEn = ["r", "o", "u", "b", "l", "e"].join("");
const blockedCurrencyWithCountryEn = ["Russian", " ", blockedCurrencyEn].join("");
const blockedCountryRu = fromCodes(0x0440, 0x043e, 0x0441, 0x0441, 0x0438, 0x0439, 0x0441, 0x043a, 0x0438, 0x0439);
const blockedCountryUk = fromCodes(0x0440, 0x043e, 0x0441, 0x0456, 0x0439, 0x0441, 0x044c, 0x043a, 0x0438, 0x0439);
const blockedCurrencyWithCountryRu = [blockedCountryRu, " ", blockedSingularCyr].join("");
const blockedCurrencyWithCountryUk = [blockedCountryUk, " ", blockedSingularCyr].join("");

export const currencyPolicy: CurrencyPolicy = {
  defaultCountry: "Ukraine",
  primaryCurrency: "UAH",
  primaryCurrencySymbol: "\u20b4",
  allowedCurrencies: ["UAH", "USD", "EUR"],
  allowedSymbols: ["\u20b4", "$", "\u20ac"],
  forbiddenCurrencies: [blockedCurrencyCode],
  forbiddenSymbols: ["\u20bd"],
  forbiddenWords: [
    blockedShortCyr,
    blockedSingularCyr,
    blockedPluralCyr,
    blockedPluralGenCyr,
    blockedUkCyr,
    blockedCurrencyCode,
    blockedCurrencyEn,
    blockedCurrencyAltEn,
    blockedCurrencyWithCountryEn,
    blockedCurrencyWithCountryRu,
    blockedCurrencyWithCountryUk,
  ],
};

export function getCurrencyPolicy() {
  return {
    ...currencyPolicy,
    policyEnabled: true,
  };
}

export function getForbiddenCurrencyTerms() {
  return Array.from(
    new Set([
      ...currencyPolicy.forbiddenSymbols,
      ...currencyPolicy.forbiddenCurrencies,
      ...currencyPolicy.forbiddenWords,
    ]),
  );
}

export function getCurrencyPromptRule() {
  return [
    "Використовуй лише дозволені валюти для українського ринку.",
    "Не додавай заборонену валюту, її код або символ.",
    "Для України використовуй гривню: \u20b4, грн, UAH.",
    "Для міжнародних прикладів можна використовувати USD або EUR.",
  ].join(" ");
}

export function validateCurrencyPolicy(text: string): CurrencyPolicyValidationResult {
  const matches: CurrencyPolicyMatch[] = [];

  if (!text) {
    return {
      ok: true,
      forbiddenCurrencyFound: false,
      matches,
      sanitizedSuggestion: text,
    };
  }

  for (const term of getForbiddenCurrencyTerms()) {
    collectMatches(text, term, matches);
  }

  return {
    ok: matches.length === 0,
    forbiddenCurrencyFound: matches.length > 0,
    matches,
    sanitizedSuggestion: sanitizeCurrencyText(text),
  };
}

export function sanitizeCurrencyText(text: string) {
  let suggestion = text;

  const replacements: Array<[string, string]> = [
    ["\u20bd", "\u20b4"],
    [blockedCurrencyCode, "UAH"],
    [blockedShortCyr, "грн"],
    [blockedSingularCyr, "грн"],
    [blockedPluralCyr, "грн"],
    [blockedPluralGenCyr, "грн"],
    [blockedUkCyr, "грн"],
    [blockedCurrencyEn, "UAH"],
    [blockedCurrencyAltEn, "UAH"],
    [blockedCurrencyWithCountryEn, "UAH"],
    [blockedCurrencyWithCountryRu, "грн"],
    [blockedCurrencyWithCountryUk, "грн"],
  ];

  for (const [from, to] of replacements) {
    suggestion = suggestion.replace(new RegExp(escapeRegExp(from), "gi"), to);
  }

  return suggestion;
}

function collectMatches(text: string, term: string, matches: CurrencyPolicyMatch[]) {
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let index = lowerText.indexOf(lowerTerm);

  while (index >= 0) {
    const start = Math.max(0, index - 36);
    const end = Math.min(text.length, index + term.length + 36);
    matches.push({
      term,
      index,
      context: text.slice(start, end),
    });
    index = lowerText.indexOf(lowerTerm, index + Math.max(term.length, 1));
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
