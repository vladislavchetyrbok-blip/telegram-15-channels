import type { AstroEngineStatus, BirthInput, SymbolicChartResult } from "../zodiac-astro-engine";

const modalityBySlug: Record<string, "cardinal" | "fixed" | "mutable"> = {
  aries: "cardinal",
  taurus: "fixed",
  gemini: "mutable",
  cancer: "cardinal",
  leo: "fixed",
  virgo: "mutable",
  libra: "cardinal",
  scorpio: "fixed",
  sagittarius: "mutable",
  capricorn: "cardinal",
  aquarius: "fixed",
  pisces: "mutable",
};

const polarityByElement = {
  fire: "active",
  air: "active",
  earth: "receptive",
  water: "receptive",
} as const;

export function getSymbolicProviderStatus(_input: BirthInput = {}): AstroEngineStatus {
  return {
    mode: "symbolic",
    provider: "symbolic",
    exactPlanetsAvailable: false,
    exactHousesAvailable: false,
    exactAscendantAvailable: false,
    exactCalculationsAvailable: false,
    label: "Символическая натальная карта",
    note: "Текущий режим показывает честную символическую интерпретацию по знаку и введённым данным без точных домов, асцендента и градусов планет.",
    reason: "Symbolic provider is active; exact ephemeris provider is not connected.",
    warnings: ["Symbolic provider does not calculate planet degrees, houses, ascendant, aspects, or transits."],
  };
}

export function buildSymbolicChart(input: BirthInput = {}): SymbolicChartResult {
  const sign = input.sign;
  return {
    status: getSymbolicProviderStatus(input),
    sign,
    element: sign?.element,
    modality: sign ? modalityBySlug[sign.slug] ?? "mutable" : undefined,
    polarity: sign ? polarityByElement[sign.element] : undefined,
    warnings: ["This result is symbolic and must not be presented as exact astronomical calculation."],
  };
}
