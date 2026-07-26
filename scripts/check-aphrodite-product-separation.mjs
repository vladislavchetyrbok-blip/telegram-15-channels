#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let passed = 0;

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: file is missing`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function check(label, condition) {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(label);
}

const aphroditePage = read("app/aphrodite/page.tsx");
const legacyHub = read("app/miniapp/page.tsx");
const compatibilityPage = read("app/compatibility/page.tsx");
const publicHome = read("app/page.tsx");
const appShell = read("components/AppShell.tsx");
const miniApp = read("components/ZodiacCompatibilityMiniApp.tsx");
const miniAppHome = read("components/zodiac-mini-app/AphroditeHomeScreen.tsx");
const miniAppShell = read("components/zodiac-mini-app/AphroditeMiniAppShell.tsx");
const operatorOverview = read("app/dashboard/networks/aphrodite/page.tsx");
const operatorSidebar = read("components/Sidebar.tsx");
const middleware = read("middleware.ts");
const loginPage = read("app/login/page.tsx");

check("canonical /aphrodite route renders the existing Mini App", aphroditePage.includes("ZodiacCompatibilityMiniApp"));
check("canonical /aphrodite route uses public Telegram WebView mode", aphroditePage.includes('variant="public"'));
check("canonical /aphrodite route declares APHRODITE metadata", aphroditePage.includes('title: "APHRODITE - Telegram Mini App"'));
check("canonical /aphrodite metadata points to itself", aphroditePage.includes('canonical: "/aphrodite"'));
check("canonical /aphrodite route is excluded from public indexing", aphroditePage.includes("index: false") && aphroditePage.includes("follow: false"));
check("canonical /aphrodite route accepts Telegram start parameters", aphroditePage.includes("tgWebAppStartParam") && aphroditePage.includes("startapp"));
check("canonical /aphrodite route does not import the public website shell", !aphroditePage.includes("CosmicSiteShell"));
check("canonical /aphrodite route does not link to private UI", !/\/(?:admin|dashboard)(?:\/|["'])/.test(aphroditePage));

check("AppShell classifies /aphrodite as a public Mini App route", /PUBLIC_MINIAPP_ROUTE_PREFIXES[\s\S]*"\/aphrodite"/.test(appShell));
check("AppShell does not classify /aphrodite as a public website route", !/PUBLIC_WEBSITE_ROUTE_PREFIXES[\s\S]*"\/aphrodite"/.test(appShell));

check("Mini App root exposes a stable Aphrodite product marker", miniApp.includes('data-aphrodite-mini-app-root="true"'));
check("Mini App root identifies the Telegram Mini App product", miniApp.includes('data-aphrodite-product="telegram-mini-app"'));
check("Mini App header visibly uses APHRODITE", /<h1[\s\S]*?>\s*APHRODITE\s*<\/h1>/.test(miniApp));
check("Mini App header visibly uses Telegram Mini App as secondary label", miniApp.includes("Telegram Mini App"));
check("Mini App home badge uses APHRODITE", miniAppHome.includes('<AphroditeBadge tone="rose">APHRODITE</AphroditeBadge>'));
check("shared Aphrodite shell no longer defaults to Zodiac branding", miniAppShell.includes('eyebrow = "APHRODITE · Telegram Mini App"'));
check("technical Zodiac center branding is absent from the canonical Mini App", !miniApp.includes("Зодиакальный центр") && !miniApp.includes("Астрологический центр"));

check("legacy /miniapp metadata points to /aphrodite", legacyHub.includes('canonical: "/aphrodite"'));
check("legacy /miniapp intent redirects to /aphrodite", legacyHub.includes("redirect(buildAphroditeAliasUrl(searchParams))"));
check("legacy /miniapp preserves incoming query parameters", legacyHub.includes("Object.entries(searchParams)") && legacyHub.includes("params.append"));
check("legacy /miniapp visible brand is APHRODITE", legacyHub.includes('<AphroditeBadge tone="rose">APHRODITE</AphroditeBadge>'));
check("legacy /miniapp actions use the canonical route", !legacyHub.includes('href="/compatibility?startapp=') && legacyHub.includes('href="/aphrodite?startapp='));

check("legacy /compatibility Mini App alias remains supported", compatibilityPage.includes("shouldRenderMiniApp(searchParams)") && compatibilityPage.includes("ZodiacCompatibilityMiniApp"));
check("legacy /compatibility?miniapp=1 detection remains supported", compatibilityPage.includes("searchParams.miniapp"));
check(
  "production root redirects dynamically to the Aphrodite Operator Platform",
  publicHome.includes('"/dashboard/networks/aphrodite"') &&
    publicHome.includes('dynamic = "force-dynamic"') &&
    publicHome.includes("redirect(APHRODITE_OPERATOR_ROOT)"),
);
check("paused public Zodiac homepage no longer renders at root", !publicHome.includes("CosmicSiteShell") && !publicHome.includes("Zodiac Love Check"));
check("public root does not render the Mini App directly", !publicHome.includes("ZodiacCompatibilityMiniApp"));

check("Aphrodite Operator Platform canonical route exists", operatorOverview.includes("AphroditePlatformOverview"));
check("Aphrodite Operator Platform identifies itself as a management platform", operatorOverview.includes('badgeText="Платформа управления"'));
check("dashboard routes remain protected by Aphrodite session middleware", middleware.includes('pathname.startsWith("/dashboard")') && middleware.includes('"aphrodite_session"'));
check("dashboard auth redirect preserves a next path", middleware.includes('searchParams.set("next"') && middleware.includes("request.nextUrl.pathname"));
check("Aphrodite login has a stable branded marker", loginPage.includes('data-aphrodite-operator-login="true"'));
check("Aphrodite login visibly identifies the Operator Platform", loginPage.includes(">АФРОДИТА<") && loginPage.includes(">Operator Platform<"));
check("Aphrodite login honors a safe dashboard next path", loginPage.includes("getSafeDashboardNextPath") && loginPage.includes("router.replace"));
check("Aphrodite login rejects non-dashboard destinations", loginPage.includes('parsed.pathname === "/dashboard"') && loginPage.includes('parsed.pathname.startsWith("/dashboard/")'));
check("operator sidebar visibly identifies APHRODITE as the top level", operatorSidebar.includes(">АФРОДИТА<"));
check("operator sidebar visibly uses the Operator Platform label", operatorSidebar.includes(">Operator Platform<"));
check("operator sidebar exposes a stable platform navigation marker", operatorSidebar.includes("data-aphrodite-operator-nav"));
check(
  "operator sidebar contains all primary Aphrodite routes",
  [
    "/dashboard/networks/aphrodite",
    "/dashboard/networks/aphrodite/channels",
    "/dashboard/networks/aphrodite/calendar",
    "/dashboard/networks/aphrodite/data-sources",
    "/dashboard/networks/aphrodite/currency",
    "/dashboard/networks/aphrodite/crypto",
    "/dashboard/networks/aphrodite/metals",
    "/dashboard/networks/aphrodite/studio",
    "/dashboard/networks/aphrodite/legacy",
  ].every((route) => operatorSidebar.includes(`href: "${route}"`)),
);
check("operator sidebar presents Zodiac as an internal module", operatorSidebar.includes(">МОДУЛЬ ZODIAC<") && operatorSidebar.includes("data-zodiac-operator-module"));
check(
  "Zodiac operator module retains its primary management routes",
  [
    "/dashboard/networks/zodiac",
    "/dashboard/networks/zodiac/launch",
    "/dashboard/networks/zodiac/operations",
    "/dashboard/networks/zodiac/content",
    "/dashboard/networks/zodiac/publishing",
    "/dashboard/networks/zodiac/analytics",
    "/dashboard/networks/zodiac/settings",
  ].every((route) => operatorSidebar.includes(`href: "${route}"`)),
);
check("Telegram Mini App does not expose operator navigation", !aphroditePage.includes("data-aphrodite-operator-nav") && !miniApp.includes("Operator Platform"));

if (failures.length > 0) {
  console.error("Aphrodite Product Separation QA: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Aphrodite Product Separation QA: PASS");
console.log(`Checks passed          : ${passed}`);
console.log("Canonical Mini App     : /aphrodite");
console.log("Operator Platform      : /dashboard/networks/aphrodite");
console.log("Production root        : / -> Aphrodite Operator Platform");
console.log("Zodiac Operator Module : /dashboard/networks/zodiac");
console.log("Public Zodiac homepage : paused");
console.log("Legacy aliases         : /miniapp and /compatibility query mode");
console.log("Public website redesign: none");
