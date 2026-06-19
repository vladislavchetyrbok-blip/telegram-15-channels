import type { ZodiacSign } from "@/components/zodiac-mini-app/types";
import { calculateExactChartPlaceholder, getExactProviderStatus } from "./zodiac-astro-providers/exact-provider-placeholder";
import { buildSymbolicChart, getSymbolicProviderStatus } from "./zodiac-astro-providers/symbolic-provider";

export type AstroEngineMode = "symbolic" | "exact_unavailable" | "exact_available";
export type AstroEngineProvider = "symbolic" | "none" | "future_exact_provider";

export type BirthInput = {
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  sign?: ZodiacSign;
};

export type AstroEngineStatus = {
  mode: AstroEngineMode;
  provider: AstroEngineProvider;
  exactPlanetsAvailable: boolean;
  exactHousesAvailable: boolean;
  exactAscendantAvailable: boolean;
  reason?: string;
  warnings?: string[];
  label: string;
  note: string;
  exactCalculationsAvailable: boolean;
};

export type ExactChartResult = {
  status: AstroEngineStatus;
  planets?: Array<{
    key: string;
    label: string;
    sign: ZodiacSign;
    degree: number;
    house?: number;
    retrograde?: boolean;
  }>;
  ascendant?: {
    sign: ZodiacSign;
    degree: number;
  };
  houses?: Array<{
    house: number;
    sign: ZodiacSign;
    degree: number;
  }>;
  warnings: string[];
};

export type SymbolicChartResult = {
  status: AstroEngineStatus;
  sign?: ZodiacSign;
  element?: ZodiacSign["element"];
  modality?: "cardinal" | "fixed" | "mutable";
  polarity?: "active" | "receptive";
  warnings: string[];
};

export type ZodiacAstroEngineMode = AstroEngineMode;
export type ZodiacAstroEngineStatus = AstroEngineStatus;

export interface ZodiacExactChartInput extends BirthInput {
  birthDate: string;
}

export interface ZodiacExactChart {
  engineMode: "exact_available";
  ascendantSign?: string;
  houses?: Array<{ house: number; sign: string; degree?: number }>;
  planets?: Array<{ planet: string; sign: string; degree?: number; house?: number }>;
  aspects?: Array<{ from: string; to: string; type: string; orb?: number }>;
}

export function getAstroEngineStatus(input: BirthInput = {}): AstroEngineStatus {
  return getExactProviderStatus(input);
}

export function getSymbolicAstroEngineStatus(input: BirthInput = {}): AstroEngineStatus {
  return getSymbolicProviderStatus(input);
}

export function getSymbolicNatalChart(input: BirthInput = {}): SymbolicChartResult {
  return buildSymbolicChart(input);
}

export function calculateExactNatalChart(input: BirthInput = {}): ExactChartResult {
  return calculateExactChartPlaceholder(input);
}

export function getExactChartReadiness(input: BirthInput = {}): ExactChartResult {
  return calculateExactNatalChart(input);
}

export function isExactAstroEngineAvailable(input: BirthInput = {}) {
  const status = getAstroEngineStatus(input);
  return status.mode === "exact_available" && status.exactCalculationsAvailable;
}

export function getExactNatalChart(_input: ZodiacExactChartInput): ZodiacExactChart | null {
  return null;
}
