import {
  isAllowedZodiacAnalyticsEvent,
  sanitizeZodiacAnalyticsPayload,
  type ZodiacAnalyticsEventName,
  type ZodiacAnalyticsPayload,
} from "@/lib/zodiac-mini-app-analytics-shared";

let inMemorySessionId: string | null = null;

export function trackZodiacMiniAppEvent(event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  if (!isAllowedZodiacAnalyticsEvent(event)) return;

  const body = JSON.stringify({
    event,
    ...sanitizeZodiacAnalyticsPayload({
      ...payload,
      sessionId: payload.sessionId ?? getZodiacAnalyticsSessionId(),
    }),
  });

  window
    .fetch("/api/zodiac/analytics/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: body.length < 4096,
    })
    .catch(() => {
      // Analytics must never affect the Mini App experience.
    });
}

function getZodiacAnalyticsSessionId() {
  if (inMemorySessionId) return inMemorySessionId;

  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  inMemorySessionId = `zma-${random}`;
  return inMemorySessionId;
}
