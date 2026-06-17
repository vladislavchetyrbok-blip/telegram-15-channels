import { NextResponse } from "next/server";
import { isAllowedZodiacAnalyticsEvent } from "@/lib/zodiac-mini-app-analytics-shared";
import { recordZodiacMiniAppAnalyticsEvent, sanitizeIncomingZodiacAnalyticsEvent } from "@/lib/zodiac-mini-app-analytics-store";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 4096) {
      return NextResponse.json({ ok: false, ignored: true, reason: "payload_too_large" }, { status: 413 });
    }

    const body = await request.json();
    const eventName = getEventName(body);

    if (!isAllowedZodiacAnalyticsEvent(eventName)) {
      return NextResponse.json({ ok: false, ignored: true, reason: "event_not_allowed" }, { status: 400 });
    }

    const payload = mergePayload(body);
    const event = sanitizeIncomingZodiacAnalyticsEvent(eventName, payload);
    const result = await recordZodiacMiniAppAnalyticsEvent(event);

    return NextResponse.json({
      ok: true,
      stored: result.stored,
      mode: result.mode,
    });
  } catch {
    return NextResponse.json({ ok: false, ignored: true, reason: "invalid_request" }, { status: 400 });
  }
}

function getEventName(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
  const record = body as Record<string, unknown>;
  return record.event ?? record.eventName;
}

function mergePayload(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const record = body as Record<string, unknown>;
  const payload = record.payload && typeof record.payload === "object" && !Array.isArray(record.payload) ? record.payload : {};
  return {
    ...record,
    ...(payload as Record<string, unknown>),
    event: undefined,
    eventName: undefined,
    payload: undefined,
  };
}
