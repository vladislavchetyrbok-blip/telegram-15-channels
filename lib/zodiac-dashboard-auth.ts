import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const zodiacDashboardSessionCookieName = "zodiac_dashboard_session";
export const zodiacDashboardSessionMaxAgeSeconds = 12 * 60 * 60;

export interface ZodiacDashboardAuthStatus {
  authEnabled: boolean;
  configured: boolean;
  authenticated: boolean;
  passwordHashConfigured: boolean;
  sessionSecretConfigured: boolean;
  sessionCookie: "local browser only";
}

export interface ZodiacDashboardSessionCookie {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
}

export function isDashboardAuthEnabled() {
  return process.env.ZODIAC_DASHBOARD_AUTH_ENABLED === "true";
}

export function isDashboardAuthConfigured() {
  return Boolean(getPasswordHash() && getSessionSecret());
}

export function hashDashboardPassword(input: string) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function verifyDashboardPassword(input: string) {
  if (!isDashboardAuthEnabled()) return true;
  const expectedHash = getPasswordHash();
  if (!expectedHash || !getSessionSecret() || !input) return false;
  return constantTimeHexEqual(expectedHash, hashDashboardPassword(input));
}

export function createDashboardSessionCookie(now = Date.now()): ZodiacDashboardSessionCookie {
  const expiresAt = now + zodiacDashboardSessionMaxAgeSeconds * 1000;
  const payload = encodeBase64Url(JSON.stringify({ v: 1, exp: expiresAt }));
  const signature = signDashboardSessionPayload(payload);

  return {
    name: zodiacDashboardSessionCookieName,
    value: `${payload}.${signature}`,
    options: cookieOptions(zodiacDashboardSessionMaxAgeSeconds),
  };
}

export function clearDashboardSessionCookie(): ZodiacDashboardSessionCookie {
  return {
    name: zodiacDashboardSessionCookieName,
    value: "",
    options: cookieOptions(0),
  };
}

export function hasValidDashboardSession(cookieValue?: string | null, now = Date.now()) {
  if (!isDashboardAuthEnabled()) return true;
  if (!isDashboardAuthConfigured()) return false;
  if (!cookieValue) return false;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return false;
  if (!constantTimeStringEqual(signDashboardSessionPayload(payload), signature)) return false;

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as { v?: number; exp?: number };
    return parsed.v === 1 && typeof parsed.exp === "number" && parsed.exp > now;
  } catch {
    return false;
  }
}

export function getDashboardAuthStatus(): ZodiacDashboardAuthStatus {
  const authEnabled = isDashboardAuthEnabled();
  const passwordHashConfigured = Boolean(getPasswordHash());
  const sessionSecretConfigured = Boolean(getSessionSecret());
  const configured = passwordHashConfigured && sessionSecretConfigured;
  const cookieValue = cookies().get(zodiacDashboardSessionCookieName)?.value;

  return {
    authEnabled,
    configured,
    authenticated: authEnabled ? configured && hasValidDashboardSession(cookieValue) : true,
    passwordHashConfigured,
    sessionSecretConfigured,
    sessionCookie: "local browser only",
  };
}

export function requireDashboardPageAccess(nextPath: string) {
  const status = getDashboardAuthStatus();
  if (!status.authEnabled) return status;
  if (!status.configured) redirect(`/dashboard/login?next=${encodeURIComponent(sanitizeDashboardNextPath(nextPath))}&error=config`);
  if (!status.authenticated) redirect(`/dashboard/login?next=${encodeURIComponent(sanitizeDashboardNextPath(nextPath))}`);
  return status;
}

export function sanitizeDashboardNextPath(value: unknown) {
  const nextPath = typeof value === "string" ? value.trim() : "";
  if (!nextPath.startsWith("/dashboard")) return "/dashboard";
  if (nextPath.startsWith("/dashboard/login")) return "/dashboard";
  if (/[\r\n]/.test(nextPath)) return "/dashboard";
  return nextPath.slice(0, 240);
}

function getPasswordHash() {
  const value = process.env.ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256;
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value.trim()) ? value.trim().toLowerCase() : "";
}

function getSessionSecret() {
  const value = process.env.ZODIAC_DASHBOARD_SESSION_SECRET;
  return typeof value === "string" && value.length >= 24 ? value : "";
}

function signDashboardSessionPayload(payload: string) {
  const secret = getSessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function cookieOptions(maxAge: number): ZodiacDashboardSessionCookie["options"] {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function constantTimeHexEqual(expectedHex: string, actualHex: string) {
  if (!/^[a-f0-9]{64}$/i.test(expectedHex) || !/^[a-f0-9]{64}$/i.test(actualHex)) return false;
  return timingSafeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(actualHex, "hex"));
}

function constantTimeStringEqual(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
