import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import {
  Activity,
  BarChart3,
  Bot,
  Brush,
  CalendarClock,
  ClipboardCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  Database,
  ListPlus,
  LockKeyhole,
  MessageSquareText,
  MousePointerClick,
  RadioTower,
  GitBranch,
  Rocket,
  Settings,
  ShieldCheck,
  Share2,
  Smartphone,
  Sparkles,
  ShoppingCart,
  Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { getUnifiedSystemStatus } from "@/lib/unified-system-status";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacPlatformSummary } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

const platformSections = [
  {
    title: "Launch Control — Запуск",
    href: "/dashboard/networks/zodiac/launch",
    icon: Rocket,
    caption: "Контроль готовности модуля Зодиак к первым пользователям, 20 пользователям и массовому запуску.",
    tone: "emerald",
  },
  {
    title: "Zodiac Network — Каналы",
    href: "/dashboard/networks/zodiac/channels",
    icon: RadioTower,
    caption: "13 каналов Zodiac, Telegram handles, startapp, статусы навигации.",
    tone: "violet",
  },
  {
    title: "Zodiac Studio — Контент",
    href: "/dashboard/networks/zodiac/content",
    icon: FileText,
    caption: "Шаблоны, рубрики, CTA/startapp preview и local-only Template Studio.",
    tone: "violet",
  },
  {
    title: "Zodiac Publisher — Публикации",
    href: "/dashboard/networks/zodiac/publishing",
    icon: Rocket,
    caption: "Ежедневный маршрут, dry-run и безопасная проверка расписания.",
    tone: "amber",
  },
  {
    title: "Zodiac Pulse — Аналитика",
    href: "/dashboard/networks/zodiac/analytics",
    icon: BarChart3,
    caption: "Privacy-safe counters, funnel первых пользователей и Redis.",
    tone: "cyan",
  },
  {
    title: "Zodiac Voice — Отзывы",
    href: "/dashboard/networks/zodiac/feedback",
    icon: MessageSquareText,
    caption: "Sanitized отзывы, P0/P1 triage и проверка на реальных устройствах.",
    tone: "emerald",
  },
  {
    title: "Zodiac Shield — Безопасность",
    href: "/dashboard/networks/zodiac/security",
    icon: LockKeyhole,
    caption: "Ledger protected, access control, auth gate settings.",
    tone: "emerald",
  },
  {
    title: "Zodiac Mini — Mini App",
    href: "/compatibility",
    icon: Smartphone,
    caption: "Тестирование Mini App UI, startapp parameters, visual QA.",
    tone: "cyan",
  },
  {
    title: "Mini App Audit",
    href: "/dashboard/networks/zodiac/miniapp-audit",
    icon: Smartphone,
    caption: "Package 101 - Audit of all Mini App routing and entry points.",
    tone: "cyan",
  },
  {
    title: "Mini App Hub",
    href: "/miniapp",
    icon: Smartphone,
    caption: "Package 106 - Safe static Mini App hub connecting mock modules.",
    tone: "violet",
  },
  {
    title: "Mini App Architecture",
    href: "/dashboard/networks/zodiac/miniapp-architecture",
    icon: ListPlus,
    caption: "Package 102 - Read-only architecture spec for upcoming Mini App modules.",
    tone: "cyan",
  },
  {
    title: "Mini App Route Safety",
    href: "/dashboard/networks/zodiac/miniapp-route-safety",
    icon: ShieldCheck,
    caption: "Package 108 - Route safety baseline and QA assertions for all Mini App mock routes.",
    tone: "emerald",
  },
  {
    title: "Mini App CTA Audit",
    href: "/dashboard/networks/zodiac/miniapp-cta-audit",
    icon: ShieldCheck,
    caption: "Package 111 - Audit of all Mini App CTAs.",
    tone: "emerald",
  },
  {
    title: "Mini App Readiness",
    href: "/dashboard/networks/zodiac/miniapp-readiness",
    icon: ShieldCheck,
    caption: "Package 112 - Read-only readiness summary for Zodiac Mini App.",
    tone: "cyan",
  },
  {
    title: "Mini App Link Smoke",
    href: "/dashboard/networks/zodiac/miniapp-link-smoke",
    icon: ShieldCheck,
    caption: "Package 113 - Internal link smoke matrix.",
    tone: "cyan",
  },
  {
    title: "Compatibility Flow Safety",
    href: "/dashboard/networks/zodiac/compatibility-flow-safety",
    icon: ShieldCheck,
    caption: "Package 114 - Audit of compatibility flow safety boundaries.",
    tone: "cyan",
  },
  {
    title: "Monetization Architecture",
    href: "/dashboard/networks/zodiac/miniapp-monetization-architecture",
    icon: ShieldCheck,
    caption: "Package 115 - Monetization architecture spec.",
    tone: "cyan",
  },
  {
    title: "Entitlement Data Model",
    href: "/dashboard/networks/zodiac/miniapp-entitlements",
    icon: ShieldCheck,
    caption: "Package 116 - Entitlement data model spec.",
    tone: "cyan",
  },
  {
    title: "Production Wiring Spec",
    href: "/dashboard/networks/zodiac/miniapp-production-wiring",
    icon: ShieldCheck,
    caption: "Package 117 - Telegram Mini App production wiring spec.",
    tone: "cyan",
  },
  {
    title: "Payment Provider Matrix",
    href: "/dashboard/networks/zodiac/miniapp-payment-matrix",
    icon: ShieldCheck,
    caption: "Package 118 - Payment provider decision matrix.",
    tone: "cyan",
  },
  {
    title: "Risk Register & Gates",
    href: "/dashboard/networks/zodiac/miniapp-risk-register",
    icon: ShieldCheck,
    caption: "Package 119 - Production risk register and rollout gates.",
    tone: "cyan",
  },
  {
    title: "Master Control Index",
    href: "/dashboard/networks/zodiac/miniapp-master-index",
    icon: ShieldCheck,
    caption: "Package 120 - Mini App master control index.",
    tone: "cyan",
  },
  {
    title: "Real Implementation Path",
    href: "/dashboard/networks/zodiac/real-implementation-path",
    icon: GitBranch,
    caption: "Package 122 - Next real implementation path.",
    tone: "cyan",
  },
  {
    title: "Aphrodite Product Remediation",
    href: "/dashboard/networks/zodiac/aphrodite-product-remediation",
    icon: GitBranch,
    caption: "Package 134 - Emotional product remediation plan.",
    tone: "cyan",
  },
  {
    title: "First Result Experience",
    href: "/dashboard/networks/zodiac/first-result-experience",
    icon: GitBranch,
    caption: "Package 135 - First result experience rewrite.",
    tone: "cyan",
  },
  {
    title: "AI Love Reading Foundation",
    href: "/dashboard/networks/zodiac/ai-love-reading-foundation",
    icon: GitBranch,
    caption: "Package 136 - Local AI Love Reading foundation.",
    tone: "cyan",
  },
  {
    title: "Soulmate Scanner Foundation",
    href: "/dashboard/networks/zodiac/soulmate-scanner-foundation",
    icon: GitBranch,
    caption: "Package 137 - Local Soulmate Scanner foundation.",
    tone: "cyan",
  },
  {
    title: "Red Flags Scanner Foundation",
    href: "/dashboard/networks/zodiac/red-flags-scanner-foundation",
    icon: GitBranch,
    caption: "Package 138 - Local Red Flags Scanner foundation.",
    tone: "cyan",
  },
  {
    title: "AI Future Timeline Foundation",
    href: "/dashboard/networks/zodiac/ai-future-timeline-foundation",
    icon: GitBranch,
    caption: "Package 139 - Local AI Future Timeline foundation.",
    tone: "cyan",
  },
  {
    title: "Social Traffic Layer",
    href: "/dashboard/networks/zodiac/social-traffic-layer",
    icon: GitBranch,
    caption: "Package 141 - Social traffic layer architecture.",
    tone: "cyan",
  },
  {
    title: "Social Content Template Engine",
    href: "/dashboard/networks/zodiac/social-content-template-engine",
    icon: GitBranch,
    caption: "Package 142 - Social content template engine.",
    tone: "cyan",
  },
  {
    title: "Social Draft Review Queue",
    href: "/dashboard/networks/zodiac/social-draft-review-queue",
    icon: GitBranch,
    caption: "Package 143 - Social draft review queue.",
    tone: "cyan",
  },
  {
    title: "Social Export Dashboard",
    href: "/dashboard/networks/zodiac/social-export-dashboard",
    icon: GitBranch,
    caption: "Package 144 - Social export dashboard.",
    tone: "cyan",
  },
  {
    title: "Social Content Calendar",
    href: "/dashboard/networks/zodiac/social-content-calendar",
    icon: GitBranch,
    caption: "Package 145 - Social content calendar.",
    tone: "cyan",
  },
  {
    title: "Public Bot Launch Packaging",
    href: "/dashboard/networks/zodiac/public-bot-profile-launch-packaging",
    icon: GitBranch,
    caption: "Package 146 - Public bot / Mini App launch packaging.",
    tone: "cyan",
  },
  {
    title: "Подготовка paywall",
    href: "/dashboard/networks/zodiac/paywall-readiness",
    icon: ShieldCheck,
    caption: "Package 154 - упаковка будущего Full Love Report и VIP-оффера без оплаты.",
    tone: "cyan",
  },
  {
    title: "Дизайн VIP-доступа",
    href: "/dashboard/networks/zodiac/entitlement-enforcement-design",
    icon: ShieldCheck,
    caption: "Package 155 - дизайн server-side entitlement для будущего VIP без реальной разблокировки.",
    tone: "cyan",
  },
  {
    title: "План VIP-границы",
    href: "/dashboard/networks/zodiac/vip-access-boundary-implementation-plan",
    icon: ShieldCheck,
    caption: "Package 157 - план внедрения server-side VIP boundary без оплаты и без unlock.",
    tone: "cyan",
  },
  {
    title: "Skeleton VIP-guard",
    href: "/dashboard/networks/zodiac/vip-access-guard-skeleton",
    icon: ShieldCheck,
    caption: "Package 158 - deny-by-default skeleton проверки VIP-доступа без production gating.",
    tone: "cyan",
  },
  {
    title: "Review VIP-guard",
    href: "/dashboard/networks/zodiac/vip-guard-integration-review",
    icon: ShieldCheck,
    caption: "Package 160 - review будущей интеграции VIP-guard без подключения к production.",
    tone: "cyan",
  },
  {
    title: "Карта fallback VIP",
    href: "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
    icon: ShieldCheck,
    caption: "Package 161 - карта free preview fallback для будущих VIP-разделов.",
    tone: "cyan",
  },
  {
    title: "Каталог продуктов",
    href: "/dashboard/networks/zodiac/product-catalog-finalization",
    icon: ShieldCheck,
    caption: "Package 162 - единый каталог продуктов Aphrodite без оплаты и без VIP-разблокировки.",
    tone: "cyan",
  },
  {
    title: "Дизайн payment ledger",
    href: "/dashboard/networks/zodiac/payment-ledger-design",
    icon: ShieldCheck,
    caption: "Package 163 - дизайн будущего ledger перед entitlement без оплаты, DB-записи и VIP-разблокировки.",
    tone: "cyan",
  },
  {
    title: "Дизайн хранения VIP-доступа",
    href: "/dashboard/networks/zodiac/entitlement-storage-design",
    icon: ShieldCheck,
    caption: "Package 164 - дизайн будущих entitlement records без создания доступа, оплаты и DB-записи.",
    tone: "cyan",
  },
  {
    title: "Skeleton схемы entitlement",
    href: "/dashboard/networks/zodiac/entitlement-schema-skeleton",
    icon: ShieldCheck,
    caption: "Package 165 - TypeScript-only validation skeleton, который не выдаёт доступ и не пишет в DB.",
    tone: "cyan",
  },
  {
    title: "Skeleton server-side entitlement",
    href: "/dashboard/networks/zodiac/server-entitlement-check-skeleton",
    icon: ShieldCheck,
    caption: "Package 166 - fail-closed server-side check skeleton с allowed=false и fallback preview.",
    tone: "cyan",
  },
  {
    title: "Security QA VIP-доступа",
    href: "/dashboard/networks/zodiac/vip-access-security-suite",
    icon: ShieldCheck,
    caption: "Package 167 - consolidated QA suite для VIP/payment/entitlement safety без открытия доступа.",
    tone: "cyan",
  },
  {
    title: "Owner Review Gate",
    href: "/dashboard/networks/zodiac/owner-review-gate",
    icon: ShieldCheck,
    caption: "Package 168 - ручной owner review gate для будущего VIP/payment launch без оплаты, entitlement creation и production-запуска.",
    tone: "cyan",
  },
  {
    title: "Review Telegram Stars",
    href: "/dashboard/networks/zodiac/telegram-stars-payment-architecture-review",
    icon: ShieldCheck,
    caption: "Package 169 - финальный architecture review будущей Telegram Stars оплаты без invoice, handler, ledger write и VIP unlock.",
    tone: "cyan",
  },
  {
    title: "Skeleton invoice builder",
    href: "/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton",
    icon: ShieldCheck,
    caption: "Package 170 - локальный invoice draft skeleton для Telegram Stars: ничего не отправляет и не вызывает Telegram API.",
    tone: "cyan",
  },
  {
    title: "Skeleton pre-checkout",
    href: "/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton",
    icon: ShieldCheck,
    caption: "Package 171 - локальная pre-checkout validation без Telegram handler, ответа и продолжения оплаты.",
    tone: "cyan",
  },
  {
    title: "Skeleton successful_payment",
    href: "/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton",
    icon: ShieldCheck,
    caption: "Package 172 - локальный successful_payment inspection без handler, ledger write и VIP-доступа.",
    tone: "cyan",
  },
  {
    title: "Mock payment ledger",
    href: "/dashboard/networks/zodiac/payment-ledger-mock-integration",
    icon: ShieldCheck,
    caption: "Package 173 - локальная mock-интеграция payment ledger без persistence, entitlement и VIP unlock.",
    tone: "cyan",
  },
  {
    title: "Mock entitlement creation",
    href: "/dashboard/networks/zodiac/entitlement-creation-mock",
    icon: ShieldCheck,
    caption: "Package 174 - local preview будущего entitlement grant без DB write, access grant и VIP unlock.",
    tone: "cyan",
  },
  {
    title: "Production Safety Gate",
    href: "/dashboard/networks/zodiac/production-payment-safety-gate",
    icon: ShieldCheck,
    caption: "Package 175 - fail-closed gate для будущей оплаты, Telegram Stars, ledger, entitlement и VIP unlock.",
    tone: "cyan",
  },
  {
    title: "Paid MVP Readiness",
    href: "/dashboard/networks/zodiac/first-paid-mvp-readiness-review",
    icon: ClipboardCheck,
    caption: "Package 178 - review готовности первого платного MVP без оплаты, VIP unlock, entitlement и production-запуска.",
    tone: "cyan",
  },
  {
    title: "Support & Refund",
    href: "/dashboard/networks/zodiac/support-refund-policy-readiness",
    icon: HeartHandshake,
    caption: "Package 179 - policy readiness для поддержки и возвратов без оплаты, автоматического refund и Telegram API.",
    tone: "cyan",
  },
  {
    title: "Analytics/Funnel",
    href: "/dashboard/networks/zodiac/analytics-funnel-readiness",
    icon: BarChart3,
    caption: "Package 180 - readiness таксономии событий, KPI, attribution и privacy boundaries без отправки аналитики.",
    tone: "cyan",
  },
  {
    title: "Noop Event Bus Mini App",
    href: "/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus",
    icon: Activity,
    caption: "Package 181 - безопасная noop-шина событий Mini App без отправки аналитики, DB write, Telegram API и payment tracking.",
    tone: "cyan",
  },
  {
    title: "Mock Dashboard воронки",
    href: "/dashboard/networks/zodiac/analytics-funnel-mock-dashboard",
    icon: BarChart3,
    caption: "Package 183 - статичный mock dashboard будущих KPI и funnel stages без реальных данных, DB read/write и внешней аналитики.",
    tone: "cyan",
  },
  {
    title: "Telegram CTA attribution",
    href: "/dashboard/networks/zodiac/telegram-cta-attribution-readiness",
    icon: MousePointerClick,
    caption: "Package 184 - readiness source keys, startapp param draft и attribution dimensions без изменения active CTA и tracking.",
    tone: "cyan",
  },
  {
    title: "Privacy Safety Suite",
    href: "/dashboard/networks/zodiac/analytics-privacy-safety-suite",
    icon: ShieldCheck,
    caption: "Package 185 - QA безопасности analytics payload, noop bus, mock dashboard и CTA attribution без tracking и DB write.",
    tone: "emerald",
  },
  {
    title: "Retention System Readiness",
    href: "/dashboard/networks/zodiac/retention-system-readiness",
    icon: Activity,
    caption: "Package 186 - карта будущего удержания, return habits, saved reports/streak/reminder future без уведомлений и tracking.",
    tone: "emerald",
  },
  {
    title: "Mock истории отчётов",
    href: "/dashboard/networks/zodiac/saved-reports-history-mock-readiness",
    icon: FileText,
    caption: "Package 187 - mock history будущих saved reports без DB persistence, production localStorage, оплаты и VIP unlock.",
    tone: "emerald",
  },
  {
    title: "Readiness возвратных CTA",
    href: "/dashboard/networks/zodiac/return-journey-cta-readiness",
    icon: MousePointerClick,
    caption: "Package 188 - карта future return paths без изменения active CTA, tracking, Telegram API и DB write.",
    tone: "emerald",
  },
  {
    title: "Noop skeleton streak/reminder",
    href: "/dashboard/networks/zodiac/streak-reminder-noop-skeleton",
    icon: CalendarClock,
    caption: "Package 189 - noop-функции будущих streak/reminder без schedule, Telegram API, DB read/write и уведомлений.",
    tone: "emerald",
  },
  {
    title: "Retention Mock Safety Suite",
    href: "/dashboard/networks/zodiac/retention-mock-dashboard-safety-suite",
    icon: ShieldCheck,
    caption: "Package 190 - consolidated mock dashboard и safety QA для retention без reminders, tracking, DB и Telegram API.",
    tone: "emerald",
  },
  {
    title: "Checklist публичного запуска",
    href: "/dashboard/networks/zodiac/public-launch-checklist-refresh",
    icon: ClipboardCheck,
    caption: "Package 191 - ручной checklist будущего публичного запуска без Telegram API, BotFather changes, оплаты и VIP unlock.",
    tone: "emerald",
  },
  {
    title: "Review упрощения Mini App UX",
    href: "/dashboard/networks/zodiac/miniapp-ux-simplification-review",
    icon: Smartphone,
    caption: "Package 192 - UX review будущего упрощения Mini App без изменения live flow, оплаты, VIP и Telegram API.",
    tone: "emerald",
  },
  {
    title: "План визуального улучшения",
    href: "/dashboard/networks/zodiac/visual-ui-polish-plan",
    icon: Brush,
    caption: "Package 193 - план будущей визуальной полировки Aphrodite без изменения live дизайна, оплаты, VIP и Telegram API.",
    tone: "emerald",
  },
  {
    title: "Review визуала VIP / Natal / Numerology",
    href: "/dashboard/networks/zodiac/vip-natal-numerology-visual-review",
    icon: Sparkles,
    caption: "Package 202 - review VIP/Natal/Numerology визуала без изменения live VIP, оплаты, Telegram API и БД.",
    tone: "emerald",
  },
  {
    title: "Визуальные карточки гороскопов",
    href: "/dashboard/networks/zodiac/horoscope-visual-cards",
    icon: CalendarClock,
    caption: "Package 203 - reusable daily/weekly/monthly UI cards без изменения публикаций, ledger, cron и Telegram API.",
    tone: "emerald",
  },
  {
    title: "Консолидация visual QA Mini App",
    href: "/dashboard/networks/zodiac/miniapp-visual-qa-consolidation",
    icon: ClipboardCheck,
    caption: "Package 206 - consolidated visual QA suite для Mini App без production-запуска, Telegram API, БД, оплаты и VIP unlock.",
    tone: "emerald",
  },
  {
    title: "Visual Launch Review",
    href: "/dashboard/networks/zodiac/public-launch-visual-readiness-review",
    icon: ClipboardCheck,
    caption: "Package 207 - visual readiness review публичного запуска Mini App без production-запуска, Telegram API, BotFather, active CTA, оплаты, VIP и БД.",
    tone: "emerald",
  },
  {
    title: "Real Device Visual QA",
    href: "/dashboard/networks/zodiac/real-device-visual-qa-checklist",
    icon: Smartphone,
    caption: "Package 208 - ручной checklist iPhone, Android, Telegram Desktop, browser fallback, safe area, keyboard и back behavior без Telegram API.",
    tone: "emerald",
  },
  {
    title: "StartApp Diagnostics",
    href: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics",
    icon: Smartphone,
    caption: "Package 209 - диагностика Telegram WebView, startapp routes, cache и wrong route symptoms без BotFather, Telegram API и active CTA changes.",
    tone: "emerald",
  },
  {
    title: "Live Version Cache Marker",
    href: "/dashboard/networks/zodiac/live-version-cache-marker-readiness",
    icon: GitBranch,
    caption: "Package 210 - readiness для source commit marker, live HTML marker, route-specific marker и cache diagnosis без deploy settings changes.",
    tone: "emerald",
  },
  {
    title: "Visual Issue Triage Board",
    href: "/dashboard/networks/zodiac/visual-issue-triage-board",
    icon: ClipboardCheck,
    caption: "Package 211 - ручная triage board для screenshots, live QA findings, route/startapp и cache/deploy issues без внешних интеграций.",
    tone: "emerald",
  },
  {
    title: "Public Launch Go/No-Go",
    href: "/dashboard/networks/zodiac/public-launch-go-no-go-review",
    icon: ShieldCheck,
    caption: "Package 212 - финальный Go/No-Go review с publicLaunchApproved=false и ownerManualReviewRequired=true до ручной проверки.",
    tone: "amber",
  },
  {
    title: "Финальная полировка текстов",
    href: "/dashboard/networks/zodiac/product-copy-final-polish",
    icon: FileText,
    caption: "Package 194 - copy standards для Aphrodite без изменения live Mini App текстов, оплаты, VIP и Telegram API.",
    tone: "emerald",
  },
  {
    title: "Manual Smoke Test Matrix",
    href: "/dashboard/networks/zodiac/manual-launch-smoke-test-matrix",
    icon: ClipboardCheck,
    caption: "Package 195 - manual QA matrix будущего запуска без Telegram API, отправки сообщений, оплаты, VIP и active CTA changes.",
    tone: "emerald",
  },
  {
    title: "План упрощённого Mini App UI",
    href: "/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan",
    icon: Smartphone,
    caption: "Package 196 - implementation plan упрощённого Mini App дизайна без live UI изменений, оплаты, VIP, Telegram API и DB write.",
    tone: "emerald",
  },
  {
    title: "Design Tokens & UI Shell",
    href: "/dashboard/networks/zodiac/design-tokens-ui-shell",
    icon: Brush,
    caption: "Package 197 - visual tokens и shell components для Mini App без отправки данных, оплаты, VIP, Telegram API и DB write.",
    tone: "emerald",
  },
  {
    title: "Telegram initData Validation",
    href: "/dashboard/networks/zodiac/telegram-initdata-validation",
    icon: ShieldCheck,
    caption: "Package 123 - initData validation foundation.",
    tone: "cyan",
  },
  {
    title: "User Profile Foundation",
    href: "/dashboard/networks/zodiac/user-profile-foundation",
    icon: Database,
    caption: "Package 124 - User profile database foundation.",
    tone: "cyan",
  },
  {
    title: "Product Catalog Foundation",
    href: "/dashboard/networks/zodiac/product-catalog-foundation",
    icon: ShoppingCart,
    caption: "Package 125 - Define purchasable items and metadata.",
    tone: "violet",
  },
  {
    title: "Entitlement Foundation",
    href: "/dashboard/networks/zodiac/entitlement-foundation",
    icon: ShieldCheck,
    caption: "Package 126 - Entitlement model foundation.",
    tone: "violet",
  },
  {
    title: "VIP Access Boundary",
    href: "/dashboard/networks/zodiac/vip-access-boundary",
    icon: ShieldCheck,
    caption: "Package 127 - Local access boundary.",
    tone: "violet",
  },
  {
    title: "VIP Compatibility Report",
    href: "/dashboard/networks/zodiac/vip-compatibility-report-foundation",
    icon: ShieldCheck,
    caption: "Package 128 - Content foundation.",
    tone: "violet",
  },
  {
    title: "VIP Report Preview",
    href: "/dashboard/networks/zodiac/vip-compatibility-report-preview",
    icon: ShieldCheck,
    caption: "Package 129 - UI Preview.",
    tone: "violet",
  },
  {
    title: "Public Launch Dry-Run Matrix",
    href: "/dashboard/networks/zodiac/public-launch-dry-run-matrix",
    icon: ClipboardCheck,
    caption: "Package 218 - safe public launch dry-run matrix: simulated launch steps, blockers, owner actions and safety notes without production side effects.",
    tone: "amber",
  },
  {
    title: "Final Content & CTA Inventory Audit",
    href: "/dashboard/networks/zodiac/final-content-cta-inventory-audit",
    icon: MousePointerClick,
    caption: "Package 219 - final content and CTA inventory audit with static labels, destinations, risk, status and owner manual review notes.",
    tone: "amber",
  },
  {
    title: "Backup & Restore Rehearsal Readiness",
    href: "/dashboard/networks/zodiac/backup-restore-rehearsal-readiness",
    icon: Database,
    caption: "Package 220 - backup freshness, restore rehearsal and rollback readiness checklist without production DB access or automatic restore.",
    tone: "amber",
  },
  {
    title: "Production Env Handoff Checklist",
    href: "/dashboard/networks/zodiac/production-env-handoff-checklist",
    icon: Settings,
    caption: "Package 221 - manual production env and secret hygiene checklist without storing secrets, reading env values, or calling production services.",
    tone: "amber",
  },
  {
    title: "Manual Launch Runbook & Rollback Pack",
    href: "/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack",
    icon: Rocket,
    caption: "Package 222 - final manual launch runbook and rollback pack with freeze status, blockers, monitoring and safety confirmation.",
    tone: "amber",
  },
  {
    title: "Real Device QA Execution Pack",
    href: "/dashboard/networks/zodiac/real-device-qa-execution-pack",
    icon: Smartphone,
    caption: "Package 223 - owner-run real-device QA execution pack with device checks, Mini App flow evidence, screenshots and launch gate.",
    tone: "amber",
  },
  {
    title: "Dashboard Auth System Decision",
    href: "/dashboard/networks/zodiac/dashboard-auth-system-decision",
    icon: LockKeyhole,
    caption: "Package 225 - canonical dashboard auth decision: aphrodite_session via middleware, legacy zodiac_dashboard_session disabled.",
    tone: "amber",
  },
  {
    title: "Public API Exposure Hardening",
    href: "/dashboard/networks/zodiac/public-api-exposure-hardening",
    icon: ShieldCheck,
    caption: "Package 226 - redacted unified status and no-trust analytics event hardening without DB writes or external analytics.",
    tone: "amber",
  },
  {
    title: "Env Example Expansion Readiness",
    href: "/dashboard/networks/zodiac/env-example-expansion-readiness",
    icon: Database,
    caption: "Package 227 - expanded .env.example placeholders for URLs, auth, Telegram, DB, publishing, analytics, backup and launch gates.",
    tone: "amber",
  },
  {
    title: "QA CRLF Cross-Platform Robustness",
    href: "/dashboard/networks/zodiac/qa-crlf-cross-platform-robustness",
    icon: GitBranch,
    caption: "Package 228 - shared QA git scope helper distinguishes real file changes from EOL-only CRLF/LF noise.",
    tone: "amber",
  },
  {
    title: "Production Env Setup Protocol",
    href: "/dashboard/networks/zodiac/production-env-setup-protocol",
    icon: Settings,
    caption: "Package 229 - manual owner protocol for DATABASE_URL, TELEGRAM_BOT_TOKEN, session secret, public URLs, backup, launch flags and secret hygiene.",
    tone: "amber",
  },
  {
    title: "Backup Freshness Verification Protocol",
    href: "/dashboard/networks/zodiac/backup-freshness-verification-protocol",
    icon: Database,
    caption: "Package 230 - manual backup freshness, restore rehearsal and rollback point protocol without DB access or automatic restore.",
    tone: "amber",
  },
  {
    title: "Manual Real-Device QA Evidence Capture",
    href: "/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture",
    icon: Smartphone,
    caption: "Package 231 - manual evidence fields for devices, screenshots, owner notes, Mini App flows and cache marker without automatic PASS.",
    tone: "amber",
  },
  {
    title: "Telegram WebView Startapp Manual QA Protocol",
    href: "/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol",
    icon: Smartphone,
    caption: "Package 232 - manual Telegram WebView, startapp, deep-link, browser fallback, BackButton, haptics and initData protocol.",
    tone: "amber",
  },
  {
    title: "Content CTA Owner Review Gate",
    href: "/dashboard/networks/zodiac/content-cta-owner-review-gate",
    icon: MousePointerClick,
    caption: "Package 233 - owner review gate for final content and CTA inventory before soft launch, with active CTA logic unchanged.",
    tone: "amber",
  },
  {
    title: "Launch Simulation Status Report",
    href: "/dashboard/networks/zodiac/launch-simulation-status-report",
    icon: ClipboardCheck,
    caption: "Package 234 - consolidated dry-run/readiness report for checks, API hardening, env, backup, real-device QA, WebView QA and owner approval.",
    tone: "amber",
  },
  {
    title: "Soft Launch Owner Go/No-Go Gate",
    href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate",
    icon: ShieldCheck,
    caption: "Package 235 - final owner go/no-go gate for future soft launch; publicLaunchApproved=false and owner review remains required.",
    tone: "amber",
  },
  {
    title: "Aphrodite Mini App Visual Design Audit",
    href: "/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit",
    icon: Brush,
    caption: "Package 236 - user-facing Mini App visual audit, design direction and Package 237-245 roadmap without redesigning screens.",
    tone: "violet",
  },
  {
    title: "Aphrodite Design System",
    href: "/dashboard/networks/zodiac/aphrodite-design-system",
    icon: Brush,
    caption: "Package 237 - Mini App design-system foundation, tokens and reusable preview primitives for Packages 238-245.",
    tone: "violet",
  },
  {
    title: "Mini App Home Screen Redesign",
    href: "/dashboard/networks/zodiac/miniapp-home-screen-redesign",
    icon: Smartphone,
    caption: "Package 238 - user-facing Mini App home and entry screen redesign using the Aphrodite design system without changing flows.",
    tone: "violet",
  },
  {
    title: "Compatibility Flow Redesign",
    href: "/dashboard/networks/zodiac/compatibility-flow-redesign",
    icon: HeartHandshake,
    caption: "Package 239 - user-facing compatibility flow redesign: two-person input, score/result cards, shareable feeling and preview-only VIP locked card.",
    tone: "violet",
  },
  {
    title: "Birth Matrix / Natal Flow Redesign",
    href: "/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign",
    icon: Sparkles,
    caption: "Package 240 - user-facing Birth Matrix / Natal flow redesign: birth-date input, personal report hierarchy, energy cards and preview-only Pro locked state.",
    tone: "violet",
  },
  {
    title: "Mystic Cards Redesign",
    href: "/dashboard/networks/zodiac/mystic-cards-redesign",
    icon: Sparkles,
    caption: "Package 241 - user-facing Mystic Cards flow redesign: closed-card selection, Tarot/Rune reveal hierarchy, card states and preview-only deeper reading.",
    tone: "violet",
  },
  {
    title: "VIP Locked Preview Redesign",
    href: "/dashboard/networks/zodiac/vip-locked-preview-redesign",
    icon: LockKeyhole,
    caption: "Package 242 - unified preview-only VIP locked layer across Mini App home, compatibility, Birth Matrix, Mystic Cards, Natal and safe VIP preview pages.",
    tone: "violet",
  },
  {
    title: "Result / Share Cards",
    href: "/dashboard/networks/zodiac/result-share-cards",
    icon: Share2,
    caption: "Package 243 - visual-only premium result/share cards across compatibility, Birth Matrix, Mystic Cards, Natal and preview-only VIP surfaces.",
    tone: "violet",
  },
  {
    title: "Telegram WebView Mobile Polish",
    href: "/dashboard/networks/zodiac/telegram-webview-mobile-polish",
    icon: Smartphone,
    caption: "Package 244 - Telegram WebView mobile polish for 360px, 390px, 430px, safe-area spacing, tap targets, text wrapping and no horizontal overflow.",
    tone: "violet",
  },
  {
    title: "Visual QA Screenshot Pack",
    href: "/dashboard/networks/zodiac/visual-qa-screenshot-pack",
    icon: Camera,
    caption: "Package 245 - visual QA screenshot pack, checklist, and issue triage protocol across required viewports (360px, 390px, 430px, desktop 1200px) and key user flows.",
    tone: "violet",
  },
  {
    title: "Visual Fixes After Screenshot Review",
    href: "/dashboard/networks/zodiac/visual-fixes-after-screenshot-review",
    icon: CheckCircle2,
    caption: "Package 246 - executes visual QA inspection and applies scoped CSS remediations across mobile viewports (360px, 390px, 430px) and live Mini App screens.",
    tone: "emerald",
  },
  {
    title: "Soft Launch Scope Selector",
    href: "/dashboard/networks/zodiac/soft-launch-scope-selector",
    icon: ClipboardCheck,
    caption: "Package 248 - conservative future soft-launch scope selector: internal owner review first, blockers, stop conditions and rollback boundaries without launch approval.",
    tone: "amber",
  },
  {
    title: "Soft Launch Preflight Checklist",
    href: "/dashboard/networks/zodiac/soft-launch-preflight-checklist",
    icon: ClipboardCheck,
    caption: "Package 249 - owner-facing preflight checklist for code checks, env, backup, real-device QA, Telegram WebView QA, CTA review, safety and stop conditions.",
    tone: "amber",
  },
  {
    title: "Owner Manual Review Pack",
    href: "/dashboard/networks/zodiac/owner-manual-review-pack",
    icon: ClipboardCheck,
    caption: "Package 250 - owner-facing final blocker and decision review pack; approval remains not granted and manual review remains required.",
    tone: "amber",
  },
  {
    title: "Real Device QA Execution Gate",
    href: "/dashboard/networks/zodiac/real-device-qa-execution-gate",
    icon: Smartphone,
    caption: "Package 251 - manual real-device QA gate for devices, viewports, flows and evidence fields; no checks are marked complete automatically.",
    tone: "amber",
  },
  {
    title: "Soft Launch Candidate Report",
    href: "/dashboard/networks/zodiac/soft-launch-candidate-report",
    icon: ClipboardCheck,
    caption: "Package 252 - final soft-launch candidate report; current status is NOT READY and approval remains not granted.",
    tone: "amber",
  },
  {
    title: "Owner Manual Real-Device Review Execution",
    href: "/dashboard/networks/zodiac/owner-manual-real-device-review-execution",
    icon: Smartphone,
    caption: "Package 253 - execution record for manual review across simulated and real mobile devices.",
    tone: "amber",
  },
  {
    title: "Telegram WebView Startapp Owner Review Execution",
    href: "/dashboard/networks/zodiac/telegram-webview-startapp-owner-review-execution",
    icon: Smartphone,
    caption: "Package 254 - execution record for Telegram WebView, startapp routing, deep-link handling, and browser fallback behavior.",
    tone: "amber",
  },
  {
    title: "Content CTA Owner Review Execution",
    href: "/dashboard/networks/zodiac/content-cta-owner-review-execution",
    icon: MousePointerClick,
    caption: "Package 255 - execution record for content and CTA owner review before soft launch; browser verified where safe, owner approval still required.",
    tone: "amber",
  },
  {
    title: "Production Env Manual Setup Execution Plan",
    href: "/dashboard/networks/zodiac/production-env-manual-setup-execution-plan",
    icon: Database,
    caption: "Package 256 - owner-facing manual production env setup plan; no real secrets added and launch remains blocked.",
    tone: "amber",
  },
  {
    title: "Backup Freshness Restore Rehearsal Execution Plan",
    href: "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-execution-plan",
    icon: GitBranch,
    caption: "Package 257 - owner-facing backup freshness, restore rehearsal, rollback, stop condition and incident response plan; no backup or restore executed.",
    tone: "amber",
  },
  {
    title: "Owner Approval Gate Final Manual Decision Plan",
    href: "/dashboard/networks/zodiac/owner-approval-gate-final-manual-decision-plan",
    icon: ClipboardCheck,
    caption: "Package 258 - final manual owner decision gate; approval remains not granted and soft launch cannot execute now.",
    tone: "amber",
  },
  {
    title: "Limited Soft Launch Dry Run Matrix",
    href: "/dashboard/networks/zodiac/limited-soft-launch-dry-run-matrix",
    icon: Rocket,
    caption: "Package 259 - dry-run only matrix for limited soft launch steps; no production launch was performed.",
    tone: "amber",
  },
  {
    title: "Final Soft Launch Go/No-Go Review",
    href: "/dashboard/networks/zodiac/final-soft-launch-go-no-go-review",
    icon: ClipboardCheck,
    caption: "Package 260 - final NO-GO review; approval is not granted and soft launch cannot execute now.",
    tone: "rose",
  },
  {
    title: "Soft Launch Monitoring Readiness Plan",
    href: "/dashboard/networks/zodiac/soft-launch-monitoring-readiness-plan",
    icon: Activity,
    caption: "Package 261 - manual monitoring readiness only; no external analytics or production monitoring activation.",
    tone: "amber",
  },
  {
    title: "Incident Rollback Response Drill",
    href: "/dashboard/networks/zodiac/incident-rollback-response-drill",
    icon: GitBranch,
    caption: "Package 262 - rollback drill only; no restore executed and owner stop decision remains manual.",
    tone: "amber",
  },
  {
    title: "Pre-Soft-Launch Owner Brief",
    href: "/dashboard/networks/zodiac/pre-soft-launch-owner-brief",
    icon: FileText,
    caption: "Package 263 - owner brief for not-ready launch status and future manual owner decision.",
    tone: "amber",
  },
  {
    title: "Manual Checklist One-Page Runbook",
    href: "/dashboard/networks/zodiac/manual-checklist-one-page-runbook",
    icon: ClipboardCheck,
    caption: "Package 264 - one-page manual checklist; stop if any blocker remains open.",
    tone: "amber",
  },
  {
    title: "Final Manual Blocker Board",
    href: "/dashboard/networks/zodiac/final-manual-blocker-board",
    icon: ListPlus,
    caption: "Package 265 - manual blocker board; candidate remains NOT READY until owner evidence closes blockers.",
    tone: "rose",
  },
  {
    title: "Final Pre-Owner-Review Summary",
    href: "/dashboard/networks/zodiac/final-pre-owner-review-summary",
    icon: ShieldCheck,
    caption: "Package 266 - packet is ready for owner manual review; soft launch remains blocked.",
    tone: "amber",
  },
  {
    title: "Critical Mobile Telegram WebView Visual Fixes",
    href: "/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes",
    icon: Smartphone,
    caption: "Package 267 - screenshot-driven Android Telegram WebView fixes for narrow mobile grids, broken English wrapping, VIP preview cards, Russian user-facing copy and safe bottom navigation.",
    tone: "emerald",
  },
  {
    title: "Owner Visual Recheck After Mobile Fixes",
    href: "/dashboard/networks/zodiac/owner-visual-recheck-after-mobile-fixes",
    icon: ClipboardCheck,
    caption: "Package 268 - owner visual recheck confirming Package 267 mobile fixes across 360/390/430px viewports without production launches or side effects.",
    tone: "violet",
  },
  {
    title: "Zodiac Brand Cleanup + Unified Inputs",
    href: "/dashboard/networks/zodiac/zodiac-brand-cleanup-unified-input-controls",
    icon: Brush,
    caption: "Package 270 - live Mini App brand cleanup, Прогноз bottom nav, compact catalogs, and unified date/time/city inputs without logic changes.",
    tone: "violet",
  },
  {
    title: "Настройки модуля Зодиак",
    href: "/dashboard/networks/zodiac/settings",
    icon: Settings,
    caption: "Read-only центр окружения, режимов, ссылок и ручных действий.",
    tone: "slate",
  },
] as const;

export default async function ZodiacNetworkWorkspacePage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac");
  const status = await getUnifiedSystemStatus();
  const attentionCount = status.autopublish.failedToday + status.autopublish.blockedToday + status.content.blocked + zodiacPlatformSummary.problems;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Запуск Зодиака"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Обзор модуля"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OperatorCard title="Zodiac Network" value={zodiacPlatformSummary.totalChannels} caption="активная сеть" details={["general + 12 знаков", "handles доступны", "startapp links готовы"]} icon={RadioTower} tone="violet" />
          <OperatorCard title="Публикации сегодня" value={`${status.autopublish.publishedToday}/13`} caption="операторский счётчик" details={["daily ON", "backup 09:30", "live из UI нет"]} icon={CalendarClock} tone="cyan" />
          <OperatorCard title="Требует внимания" value={attentionCount} caption={attentionCount > 0 ? "есть пункты для проверки" : "красных пунктов нет"} details={[`failed: ${status.autopublish.failedToday}`, `blocked: ${status.autopublish.blockedToday}`, `channel risks: ${zodiacPlatformSummary.problems}`]} icon={ShieldCheck} tone={attentionCount > 0 ? "amber" : "emerald"} />
          <OperatorCard title="Soft launch" value="GO" caption="первые 5 пользователей" details={["watch funnel", "collect feedback", "20 users позже"]} icon={HeartHandshake} tone="emerald" />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Разделы модуля Зодиак</h2>
              <p className="mt-1 text-sm text-slate-400">Единый доступ ко всем модулям платформы.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platformSections.map((section) => (
              <PlatformSectionCard key={section.title} {...section} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-5 text-emerald-400 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Zodiac Control автономен</h2>
                <p className="mt-2 text-sm leading-6">
                  Dashboard показывает состояние платформы. Live-публикация, weekly live и ledger writes не запускаются отсюда напрямую.
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 shrink-0" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-100">Что делать дальше</h2>
            <ol className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <li>1. Включить защиту dashboard в Vercel</li>
              <li>2. Пригласить первых 5 пользователей</li>
              <li>3. Смотреть аналитику</li>
              <li>4. Внести отзывы</li>
              <li>5. Исправить P0/P1</li>
              <li>6. Только потом идти к 20 пользователям</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlatformSectionCard({ title, href, icon: Icon, caption, tone }: { title: string; href: string; icon: LucideIcon; caption: string; tone: Tone }) {
  return (
    <Link href={href} prefetch={false} className="group flex min-h-40 items-start gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-slate-100 group-hover:text-violet-900">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-slate-400">{caption}</span>
      </span>
    </Link>
  );
}

function OperatorCard({
  title,
  value,
  caption,
  details,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  caption: string;
  details: string[];
  icon: LucideIcon;
  tone: Tone;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-400">{caption}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {details.map((detail) => (
          <span key={detail} className="rounded-full border border-slate-800 bg-slate-50 px-2.5 py-1 text-xs text-slate-400">
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      <span className="opacity-75">{label}:</span>
      <span>{value}</span>
    </span>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

type Tone = "violet" | "cyan" | "emerald" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-900/30 bg-emerald-900/10 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-900/30 bg-rose-900/10 text-rose-700",
  slate: "border-slate-800 bg-slate-50 text-slate-700",
};
