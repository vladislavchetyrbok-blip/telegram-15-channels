import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "telegram_admin_session";

export interface AdminAccessResult {
  allowed: boolean;
  authEnabled: boolean;
  authenticated: boolean;
  reason: string;
}

export interface AdminAuthStatus {
  authEnabled: boolean;
  authenticated: boolean;
  adminPasswordConfigured: boolean;
  adminSessionSecretConfigured: boolean;
}

export interface AdminSessionCookie {
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

export function isAdminAuthEnabled() {
  return process.env.ADMIN_AUTH_ENABLED === "true";
}

export function verifyAdminPassword(password: string) {
  if (!isAdminAuthEnabled()) return true;

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || !password) return false;

  const expected = createHmac("sha256", "admin-password-check").update(configuredPassword).digest();
  const actual = createHmac("sha256", "admin-password-check").update(password).digest();
  return timingSafeEqual(expected, actual);
}

export function createAdminSessionCookie(): AdminSessionCookie {
  const maxAge = getSessionMaxAgeSeconds();
  const expiresAt = Date.now() + maxAge * 1000;
  const payload = encodeBase64Url(JSON.stringify({ exp: expiresAt }));
  const signature = sign(payload);

  return {
    name: cookieName,
    value: `${payload}.${signature}`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    },
  };
}

export function clearAdminSessionCookie(): AdminSessionCookie {
  return {
    name: cookieName,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    },
  };
}

export function requireAdminAccess(): AdminAccessResult {
  const authEnabled = isAdminAuthEnabled();
  if (!authEnabled) {
    return {
      allowed: true,
      authEnabled,
      authenticated: true,
      reason: "admin_auth_disabled_for_local_mode",
    };
  }

  const authenticated = hasValidAdminSession();
  return {
    allowed: authenticated,
    authEnabled,
    authenticated,
    reason: authenticated ? "authenticated" : "admin_login_required",
  };
}

export function requireAdminAccessPlaceholder(): AdminAccessResult {
  return requireAdminAccess();
}

export function getAdminAuthStatus(): AdminAuthStatus {
  return {
    authEnabled: isAdminAuthEnabled(),
    authenticated: requireAdminAccess().authenticated,
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
    adminSessionSecretConfigured: Boolean(process.env.ADMIN_SESSION_SECRET),
  };
}

export function canCreateAdminSession() {
  if (!isAdminAuthEnabled()) return true;
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

function hasValidAdminSession() {
  const value = cookies().get(cookieName)?.value;
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  if (sign(payload) !== signature) return false;

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function getSessionMaxAgeSeconds() {
  const days = Number(process.env.ADMIN_SESSION_MAX_AGE_DAYS ?? 14);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 14;
  return Math.round(safeDays * 24 * 60 * 60);
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
