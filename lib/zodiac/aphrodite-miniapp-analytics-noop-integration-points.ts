/**
 * Package 182: Mini App Analytics Noop Integration Points.
 *
 * Integration points may call only the local noop event bus. They must not send
 * data externally, write database records, call Telegram API, or change
 * user-facing behavior.
 */

import {
  emitAphroditeMiniAppAnalyticsNoopEvent,
  type AphroditeMiniAppAnalyticsNoopEventId,
  type AphroditeMiniAppAnalyticsNoopEventResult,
  type AphroditeMiniAppAnalyticsSafePayload,
} from "./aphrodite-miniapp-analytics-noop-event-bus";

export type AphroditeMiniAppAnalyticsNoopIntegrationStatus = "integrated" | "pending";

export type AphroditeMiniAppAnalyticsNoopIntegrationPoint = {
  id: string;
  eventId: AphroditeMiniAppAnalyticsNoopEventId;
  route: string;
  file: string;
  surface: "mini-app" | "public-route" | "future-vip";
  status: AphroditeMiniAppAnalyticsNoopIntegrationStatus;
  payload: AphroditeMiniAppAnalyticsSafePayload;
  safeReason: string;
  pendingReason?: string;
};

export type AphroditeMiniAppAnalyticsNoopIntegrationResult = AphroditeMiniAppAnalyticsNoopIntegrationPoint & {
  result: AphroditeMiniAppAnalyticsNoopEventResult;
};

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_INTEGRATION_TITLE =
  "Noop integration points Mini App аналитики";

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_INTEGRATION_CLASSIFICATION =
  "Только noop-вызовы / Без внешней аналитики / Без изменения поведения пользователя";

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_INTEGRATION_RULE =
  "Integration points may call only the noop event bus. No external event sending, DB write, Telegram API, or production analytics.";

const integrationPoints: AphroditeMiniAppAnalyticsNoopIntegrationPoint[] = [
  {
    id: "route-miniapp-opened",
    eventId: "miniapp_opened",
    route: "/miniapp",
    file: "app/miniapp/page.tsx",
    surface: "mini-app",
    status: "integrated",
    payload: { route: "/miniapp", surface: "mini-app", source: "route-render", productCode: "miniapp-hub" },
    safeReason: "Route-level noop call contains only route/source/surface/productCode.",
  },
  {
    id: "route-love-reading-opened",
    eventId: "love_reading_opened",
    route: "/miniapp/love-reading-preview",
    file: "app/miniapp/love-reading-preview/page.tsx",
    surface: "mini-app",
    status: "integrated",
    payload: { route: "/miniapp/love-reading-preview", surface: "mini-app", source: "route-render", productCode: "ai-love-reading" },
    safeReason: "No names, birth dates, report text, Telegram payload, or payment data are passed.",
  },
  {
    id: "route-love-reading-preview-viewed",
    eventId: "love_reading_preview_viewed",
    route: "/miniapp/love-reading-preview",
    file: "app/miniapp/love-reading-preview/page.tsx",
    surface: "mini-app",
    status: "integrated",
    payload: { route: "/miniapp/love-reading-preview", surface: "mini-app", source: "route-render", productCode: "ai-love-reading", previewType: "free-preview" },
    safeReason: "Preview view is recorded only as noop metadata; preview text is not included.",
  },
  {
    id: "route-full-love-report-teaser-viewed",
    eventId: "full_love_report_teaser_viewed",
    route: "/miniapp/love-reading-preview",
    file: "app/miniapp/love-reading-preview/page.tsx",
    surface: "future-vip",
    status: "integrated",
    payload: { route: "/miniapp/love-reading-preview", surface: "future-vip", source: "route-render", productCode: "full-love-report", teaserBlock: "future-report-summary" },
    safeReason: "Teaser id only; full report text and payment payload are not included.",
  },
  {
    id: "route-free-preview-fallback-shown",
    eventId: "free_preview_fallback_shown",
    route: "/miniapp/love-reading-preview",
    file: "app/miniapp/love-reading-preview/page.tsx",
    surface: "mini-app",
    status: "integrated",
    payload: { route: "/miniapp/love-reading-preview", surface: "mini-app", source: "route-render", productCode: "ai-love-reading", fallbackRoute: "/miniapp/love-reading-preview" },
    safeReason: "Fallback route is static and does not unlock VIP.",
  },
  {
    id: "route-birth-matrix-opened",
    eventId: "birth_matrix_opened",
    route: "/birth-matrix",
    file: "app/birth-matrix/page.tsx",
    surface: "public-route",
    status: "integrated",
    payload: { route: "/birth-matrix", surface: "public-route", source: "route-render", productCode: "birth-matrix" },
    safeReason: "Birth date value is never passed; only route/product metadata is passed.",
  },
  {
    id: "route-compatibility-opened",
    eventId: "compatibility_opened",
    route: "/compatibility",
    file: "app/compatibility/page.tsx",
    surface: "public-route",
    status: "integrated",
    payload: { route: "/compatibility", surface: "public-route", source: "route-render", productCode: "compatibility" },
    safeReason: "Search params are not passed into analytics payload.",
  },
  {
    id: "pending-love-reading-form-started",
    eventId: "love_reading_form_started",
    route: "/miniapp/love-reading-preview",
    file: "app/miniapp/love-reading-preview/page.tsx",
    surface: "mini-app",
    status: "pending",
    payload: { route: "/miniapp/love-reading-preview", surface: "mini-app", source: "pending-no-active-form", productCode: "ai-love-reading" },
    safeReason: "Pending avoids adding a fake handler or changing the static preview UX.",
    pendingReason: "No active Love Reading form-start handler exists in this route without a broader UI refactor.",
  },
  {
    id: "pending-love-reading-form-submitted",
    eventId: "love_reading_form_submitted",
    route: "/miniapp/love-reading-preview",
    file: "app/miniapp/love-reading-preview/page.tsx",
    surface: "mini-app",
    status: "pending",
    payload: { route: "/miniapp/love-reading-preview", surface: "mini-app", source: "pending-no-active-form", productCode: "ai-love-reading" },
    safeReason: "Pending avoids adding synthetic form submission analytics.",
    pendingReason: "No active Love Reading submit handler exists; adding one would change product behavior.",
  },
  {
    id: "pending-couple-calendar-opened",
    eventId: "couple_calendar_opened",
    route: "/compatibility",
    file: "components/ZodiacCompatibilityMiniApp.tsx",
    surface: "future-vip",
    status: "pending",
    payload: { route: "/compatibility", surface: "future-vip", source: "pending-client-feature", productCode: "vip-couple-calendar" },
    safeReason: "Pending avoids touching the complex client feature routing and existing analytics client.",
    pendingReason: "Couple calendar opens inside an existing client feature flow; safe integration should be done with a focused client QA package.",
  },
];

export function getAphroditeMiniAppAnalyticsNoopIntegrationPoints(): AphroditeMiniAppAnalyticsNoopIntegrationPoint[] {
  return integrationPoints.map((point) => ({
    ...point,
    payload: { ...point.payload },
  }));
}

export function recordAphroditeMiniAppNoopIntegrationPoint(
  id: string,
): AphroditeMiniAppAnalyticsNoopIntegrationResult | null {
  const point = integrationPoints.find((item) => item.id === id);
  if (!point || point.status !== "integrated") return null;

  return {
    ...point,
    payload: { ...point.payload },
    result: emitAphroditeMiniAppAnalyticsNoopEvent({
      eventId: point.eventId,
      source: String(point.payload.source ?? "route-render"),
      surface: String(point.payload.surface ?? point.surface),
      payload: point.payload,
    }),
  };
}

export function getAphroditeMiniAppAnalyticsNoopIntegrationResults(): AphroditeMiniAppAnalyticsNoopIntegrationResult[] {
  return integrationPoints
    .filter((point) => point.status === "integrated")
    .map((point) => recordAphroditeMiniAppNoopIntegrationPoint(point.id))
    .filter((point): point is AphroditeMiniAppAnalyticsNoopIntegrationResult => Boolean(point));
}
