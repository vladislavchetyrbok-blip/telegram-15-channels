export type ZodiacTelegramUserIdentity = {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
};

export type ZodiacUserProfileDraft = {
  zodiacSign?: string;
  birthDate?: string;
  birthTime?: string;
  displayName?: string;
};

export type ZodiacUserProfileFoundationStatus =
  | "schema-prepared"
  | "typed-foundation-only"
  | "migration-blocked"
  | "future-only";

export type ZodiacUserProfileFoundationItem = {
  area: string;
  status: ZodiacUserProfileFoundationStatus;
  purpose: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high";
};

// Safe pure helpers
export function mapTelegramUserToIdentity(user: any): ZodiacTelegramUserIdentity {
  return {
    telegramUserId: String(user.id),
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    languageCode: user.language_code,
    isPremium: user.is_premium === true,
  };
}

export function createEmptyProfileDraft(): ZodiacUserProfileDraft {
  return {
    zodiacSign: undefined,
    birthDate: undefined,
    birthTime: undefined,
    displayName: undefined,
  };
}

export const USER_PROFILE_FOUNDATION_ITEMS: ZodiacUserProfileFoundationItem[] = [
  {
    area: "Telegram identity",
    status: "typed-foundation-only",
    purpose: "Map raw initData to safe local identity format.",
    allowedNow: ["mapping logic", "type definitions"],
    blockedUntil: ["live schema execution"],
    riskLevel: "low"
  },
  {
    area: "Local app user",
    status: "typed-foundation-only",
    purpose: "Represent the user inside the Aphrodite application layer.",
    allowedNow: ["type definitions", "mock references"],
    blockedUntil: ["Database URL configured", "Owner approval"],
    riskLevel: "low"
  },
  {
    area: "Profile draft",
    status: "typed-foundation-only",
    purpose: "Store user preferences without committing to permanent VIP features.",
    allowedNow: ["draft structure", "empty state generation"],
    blockedUntil: ["Database URL configured"],
    riskLevel: "low"
  },
  {
    area: "Privacy boundary",
    status: "typed-foundation-only",
    purpose: "Ensure Telegram details don't leak into public API requests.",
    allowedNow: ["type separation"],
    blockedUntil: ["Data protection review"],
    riskLevel: "medium"
  },
  {
    area: "Future entitlement link",
    status: "future-only",
    purpose: "Link user to purchased digital goods.",
    allowedNow: [],
    blockedUntil: ["Package 126"],
    riskLevel: "high"
  },
  {
    area: "Future payment link",
    status: "future-only",
    purpose: "Connect users to transaction histories.",
    allowedNow: [],
    blockedUntil: ["Package 128"],
    riskLevel: "high"
  },
  {
    area: "Future analytics link",
    status: "future-only",
    purpose: "Track user journey and retention.",
    allowedNow: [],
    blockedUntil: ["Analytics platform selected"],
    riskLevel: "medium"
  }
];
