import { getTelegramWebApp, type TelegramWebApp } from "@/lib/use-telegram-webapp";

export type ZodiacMiniAppShareMethod = "telegram" | "native" | "clipboard" | "manual";

export interface ZodiacMiniAppShareResult {
  method: ZodiacMiniAppShareMethod;
  label: string;
  fallbackText?: string;
}

export interface ZodiacMiniAppShareInput {
  text: string;
  url?: string;
  telegramWebApp?: TelegramWebApp | null;
}

const defaultUrl = "https://t.me/zodiac_love_check_bot?startapp=compat";

export async function shareZodiacMiniAppContent({ text, url = defaultUrl, telegramWebApp }: ZodiacMiniAppShareInput): Promise<ZodiacMiniAppShareResult> {
  const safeText = sanitizeShareText(text);
  const safeUrl = sanitizeShareUrl(url);
  const shareTextWithUrl = buildShareTextWithUrl(safeText, safeUrl);
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(safeUrl)}&text=${encodeURIComponent(safeText)}`;
  const webApp = telegramWebApp ?? getTelegramWebApp();
  exposeLastShareTextForSmoke(shareTextWithUrl);

  try {
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(telegramShareUrl);
      return { method: "telegram", label: "Откройте Telegram для отправки" };
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      await withTimeout(navigator.share({ text: safeText, url: safeUrl }), 1200);
      return { method: "native", label: "Ссылка готова" };
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareTextWithUrl);
      return { method: "clipboard", label: "Скопировано" };
    }
  } catch {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareTextWithUrl);
        return { method: "clipboard", label: "Не удалось открыть отправку. Текст скопирован." };
      } catch {
        // Visible manual fallback below.
      }
    }
  }

  return { method: "manual", label: "Ссылка готова", fallbackText: shareTextWithUrl };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("share_timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function sanitizeShareText(value: string) {
  return String(value || "")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "")
    .replace(/\b\d{2}\.\d{2}\.\d{4}\b/g, "")
    .replace(/\b\d{1,2}:\d{2}\b/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 900);
}

function buildShareTextWithUrl(text: string, url: string) {
  return text.includes(url) ? text : `${text}\n${url}`.trim();
}

function exposeLastShareTextForSmoke(value: string) {
  if (typeof window === "undefined") return;
  (window as typeof window & { __zodiacLastShareText?: string }).__zodiacLastShareText = value;
}

function sanitizeShareUrl(value: string) {
  const raw = String(value || defaultUrl).trim();
  return raw.startsWith("https://t.me/zodiac_love_check_bot?startapp=") ? raw : defaultUrl;
}
