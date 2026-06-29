#!/usr/bin/env node

const requiredRoutes = [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/miniapp?startapp=mystic",
  "/miniapp?startapp=compatibility",
  "/miniapp?startapp=birth_matrix",
  "/miniapp?startapp=vip",
];

const publicAppUrl = process.env.PUBLIC_APP_URL ?? "";
const trimmedUrl = publicAppUrl.trim();
const hasPublicAppUrl = trimmedUrl.length > 0;
const startsWithHttps = trimmedUrl.startsWith("https://");

console.log(`PUBLIC_APP_URL: ${hasPublicAppUrl ? "present" : "missing"}`);
console.log(`HTTPS requirement: ${hasPublicAppUrl && startsWithHttps ? "pass" : "manual setup required"}`);
console.log(`requiredPublicRoutes: ${requiredRoutes.length}`);
console.log("publicUrlApproved: false");
console.log("botFatherSetupDone: false");

if (!hasPublicAppUrl) {
  console.log("manual setup required");
}
