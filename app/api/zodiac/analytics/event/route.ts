import { NextResponse } from "next/server";
import { isAllowedZodiacAnalyticsEvent } from "@/lib/zodiac-mini-app-analytics-shared";
import { recordZodiacMiniAppAnalyticsEvent, sanitizeIncomingZodiacAnalyticsEvent } from "@/lib/zodiac-mini-app-analytics-store";

const analyticsRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const rateLimitWindowMs = 60_000;
const anonymousRateLimitMaxEventsPerWindow = 180;
const browserRateLimitMaxEventsPerWindow = 1_500;
const maxPayloadKeys = 32;
const blockedTextPattern = /\b(?:token|secret|password|authorization|initData|bot[_-]?token|DATABASE_URL|TELEGRAM_BOT_TOKEN)\b/i;

export async function POST(request: Request) {
  try {
    if (!isJsonRequest(request)) {
      return NextResponse.json({ ok: false, ignored: true, reason: "json_required" }, { status: 415 });
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 4096) {
      return NextResponse.json({ ok: false, ignored: true, reason: "payload_too_large" }, { status: 413 });
    }

    const originTrust = getOriginTrust(request);
    if (!originTrust.allowed) {
      return NextResponse.json({ ok: false, ignored: true, reason: "origin_not_allowed" }, { status: 403 });
    }

    const rateLimit = checkAnalyticsRateLimit(request, originTrust.browserSameOrigin ? browserRateLimitMaxEventsPerWindow : anonymousRateLimitMaxEventsPerWindow);
    if (!rateLimit.allowed) {
      return NextResponse.json({ ok: false, ignored: true, reason: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();
    if (!isSafeAnalyticsBody(body)) {
      return NextResponse.json({ ok: false, ignored: true, reason: "payload_not_trusted" }, { status: 400 });
    }

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
      trust: "preview_no_trust",
    });
  } catch {
    return NextResponse.json({ ok: false, ignored: true, reason: "invalid_request" }, { status: 400 });
  }
}

function isJsonRequest(request: Request) {
  return (request.headers.get("content-type") ?? "").toLowerCase().includes("application/json");
}

function getOriginTrust(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return { allowed: true, browserSameOrigin: false };

  try {
    const originUrl = new URL(origin);
    const allowed = getRequestOriginCandidates(request).some((candidate) => originsMatch(originUrl, candidate) || loopbackOriginsMatch(originUrl, candidate));
    return { allowed, browserSameOrigin: allowed };
  } catch {
    return { allowed: false, browserSameOrigin: false };
  }
}

function getRequestOriginCandidates(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || requestUrl.protocol.replace(":", "");
  const hosts = [requestUrl.host, request.headers.get("host"), request.headers.get("x-forwarded-host")]
    .flatMap((host) => (host ?? "").split(","))
    .map((host) => host.trim())
    .filter(Boolean);

  const candidates = new Map<string, URL>();
  candidates.set(requestUrl.origin, requestUrl);
  for (const host of hosts) {
    try {
      const candidate = new URL(`${forwardedProto}://${host}`);
      candidates.set(candidate.origin, candidate);
    } catch {
      // Ignore malformed proxy headers; invalid origins are denied by the caller.
    }
  }
  return Array.from(candidates.values());
}

function originsMatch(left: URL, right: URL) {
  return left.protocol === right.protocol && left.hostname === right.hostname && originPort(left) === originPort(right);
}

function loopbackOriginsMatch(left: URL, right: URL) {
  return left.protocol === right.protocol && isLoopbackHost(left.hostname) && isLoopbackHost(right.hostname) && originPort(left) === originPort(right);
}

function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function originPort(url: URL) {
  if (url.port) return url.port;
  return url.protocol === "https:" ? "443" : "80";
}

function checkAnalyticsRateLimit(request: Request, maxEventsPerWindow: number) {
  const now = Date.now();
  const key = analyticsRateLimitKey(request);
  const bucket = analyticsRateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    analyticsRateLimitBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    cleanupAnalyticsRateLimitBuckets(now);
    return { allowed: true };
  }

  if (bucket.count >= maxEventsPerWindow) {
    return { allowed: false };
  }

  bucket.count += 1;
  return { allowed: true };
}

function analyticsRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const sessionHint = request.headers.get("x-zodiac-analytics-session")?.trim();
  return [forwardedFor || realIp || "unknown", sessionHint || "no-session"].join(":").slice(0, 120);
}

function cleanupAnalyticsRateLimitBuckets(now: number) {
  if (analyticsRateLimitBuckets.size < 512) return;
  for (const [key, bucket] of Array.from(analyticsRateLimitBuckets.entries())) {
    if (bucket.resetAt <= now) analyticsRateLimitBuckets.delete(key);
  }
}

function isSafeAnalyticsBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if (hasTooManyKeys(body, maxPayloadKeys)) return false;
  if (containsBlockedText(body, 0)) return false;
  return true;
}

function hasTooManyKeys(value: unknown, maxKeys: number) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.keys(value).length > maxKeys;
}

function containsBlockedText(value: unknown, depth: number): boolean {
  if (depth > 2) return true;
  if (typeof value === "string") return value.length > 180 || blockedTextPattern.test(value);
  if (typeof value === "number") return !Number.isFinite(value);
  if (typeof value === "boolean" || value == null) return false;
  if (Array.isArray(value)) return true;
  if (typeof value !== "object") return true;

  const record = value as Record<string, unknown>;
  if (Object.keys(record).length > maxPayloadKeys) return true;
  return Object.entries(record).some(([key, item]) => blockedTextPattern.test(key) || containsBlockedText(item, depth + 1));
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
