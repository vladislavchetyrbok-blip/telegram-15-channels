import type { AstroEngineStatus, BirthInput, ExactChartResult } from "../zodiac-astro-engine";

const providerRequirements = [
  "ephemeris provider",
  "timezone strategy",
  "geocoding / coordinates",
  "house system",
  "known fixture set",
  "server-side runtime validation",
];

export function getExactProviderStatus(input: BirthInput = {}): AstroEngineStatus {
  return {
    mode: "exact_unavailable",
    provider: "future_exact_provider",
    exactPlanetsAvailable: false,
    exactHousesAvailable: false,
    exactAscendantAvailable: false,
    exactCalculationsAvailable: false,
    label: "Точный режим будет позже",
    note: "Точный астрологический движок ещё не подключён. Сейчас используется символическая карта без точных домов, асцендента и градусов планет.",
    reason: exactUnavailableReason(input),
    warnings: exactUnavailableWarnings(input),
  };
}

export function calculateExactChartPlaceholder(input: BirthInput = {}): ExactChartResult {
  return {
    status: getExactProviderStatus(input),
    planets: undefined,
    ascendant: undefined,
    houses: undefined,
    warnings: exactUnavailableWarnings(input),
  };
}

function exactUnavailableReason(input: BirthInput) {
  const missingInput = missingInputRequirements(input);
  const missing = missingInput.length ? ` Missing input readiness: ${missingInput.join(", ")}.` : "";
  return `No exact ephemeris/provider engine is connected yet. Required future capabilities: ${providerRequirements.join(", ")}.${missing}`;
}

function exactUnavailableWarnings(input: BirthInput) {
  return [
    "Exact planet degrees are unavailable until an ephemeris provider is connected.",
    "Exact houses and ascendant are unavailable until timezone, coordinates, and house system are validated.",
    "The current Mini App must keep showing the symbolic chart and must not fabricate exact astronomical values.",
    ...missingInputRequirements(input).map((item) => `Future exact mode also needs ${item}.`),
  ];
}

function missingInputRequirements(input: BirthInput) {
  const missing: string[] = [];
  if (!input.birthDate) missing.push("birth date");
  if (!input.birthTime) missing.push("birth time");
  if (!input.birthCity && (!isFiniteNumber(input.latitude) || !isFiniteNumber(input.longitude))) missing.push("birth city or coordinates");
  if (!input.timezone) missing.push("timezone");
  return missing;
}

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}
