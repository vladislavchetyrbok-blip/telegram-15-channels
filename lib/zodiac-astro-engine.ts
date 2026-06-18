export type ZodiacAstroEngineMode = "symbolic" | "exact_unavailable" | "exact_available";

export interface ZodiacExactChartInput {
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface ZodiacExactChart {
  engineMode: "exact_available";
  ascendantSign?: string;
  houses?: Array<{ house: number; sign: string; degree?: number }>;
  planets?: Array<{ planet: string; sign: string; degree?: number; house?: number }>;
  aspects?: Array<{ from: string; to: string; type: string; orb?: number }>;
}

export interface ZodiacAstroEngineStatus {
  mode: ZodiacAstroEngineMode;
  exactCalculationsAvailable: boolean;
  label: string;
  note: string;
}

export function getAstroEngineStatus(): ZodiacAstroEngineStatus {
  return {
    mode: "symbolic",
    exactCalculationsAvailable: false,
    label: "Символическая натальная карта",
    note: "Точные дома, асцендент, градусы планет и аспекты требуют отдельного астрологического движка.",
  };
}

export function getExactNatalChart(_input: ZodiacExactChartInput): ZodiacExactChart | null {
  return null;
}
