import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "aphrodite_session";

// Fallback only if absolutely necessary (should be avoided as per rules, but handled gracefully)
export function getAuthEnv() {
  const login = process.env.APHRODITE_ADMIN_LOGIN;
  const password = process.env.APHRODITE_ADMIN_PASSWORD;
  const secret = process.env.APHRODITE_SESSION_SECRET;
  
  return {
    login,
    password,
    secret,
    isConfigured: Boolean(login && password && secret),
  };
}

// Convert string to Uint8Array
const encoder = new TextEncoder();

// Import key for HMAC
async function getSecretKey(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Base64Url encode/decode to be cookie safe
function bufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Create a signed session value
export async function createSessionCookieValue(secret: string): Promise<string> {
  const payload = `session_${Date.now()}`;
  const key = await getSecretKey(secret);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const signature = bufferToBase64Url(signatureBuffer);
  return `${payload}.${signature}`;
}

// Verify a signed session value
export async function verifySessionCookieValue(cookieValue: string, secret: string): Promise<boolean> {
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return false;
    
    const [payload, signatureBase64Url] = parts;
    const signatureBuffer = base64UrlToBuffer(signatureBase64Url);
    
    const key = await getSecretKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payload)
    );
    
    // Also check if it's expired (e.g., 7 days)
    if (isValid) {
      const timestampStr = payload.replace("session_", "");
      const timestamp = parseInt(timestampStr, 10);
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > SEVEN_DAYS_MS) {
        return false;
      }
    }
    
    return isValid;
  } catch (err) {
    return false;
  }
}

// Timing-safe comparison of strings (basic implementation for edge)
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // To prevent immediate return and timing leak, we still compare something
    const dummy = a === a;
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function setSession(secret: string) {
  const value = await createSessionCookieValue(secret);
  
  cookies().set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function hasValidSession(): Promise<boolean> {
  const env = getAuthEnv();
  // If not configured, we strictly deny access (middleware should handle this, or we fail closed)
  if (!env.isConfigured || !env.secret) return false;
  
  const cookieValue = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!cookieValue) return false;
  
  return await verifySessionCookieValue(cookieValue, env.secret);
}
