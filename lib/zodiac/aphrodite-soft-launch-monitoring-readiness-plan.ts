import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_SOFT_LAUNCH_MONITORING_READINESS_PLAN_TITLE =
  "Soft Launch Monitoring Readiness Plan";

export const APHRODITE_SOFT_LAUNCH_MONITORING_READINESS_PLAN_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-monitoring-readiness-plan" as const;

export function getAphroditeSoftLaunchMonitoringReadinessPlan(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 261,
    title: APHRODITE_SOFT_LAUNCH_MONITORING_READINESS_PLAN_TITLE,
    route: APHRODITE_SOFT_LAUNCH_MONITORING_READINESS_PLAN_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "OWNER REVIEW REQUIRED",
    requiredMarkers: [
      "monitoring plan",
      "manual monitoring only",
      "no external analytics",
      "no production monitoring activation",
      "owner review required",
      "Package 262 - Incident Rollback Response Drill",
    ],
    sections: [
      {
        title: "monitoring plan",
        items: [
          {
            area: "Manual observation scope",
            status: "DOCUMENTED",
            detail: "manual monitoring only for smoke, dashboard QA, Telegram WebView observation, CTA review, and owner notes.",
            ownerAction: "Owner records observations manually after real-device checks.",
          },
          {
            area: "Analytics boundary",
            status: "PASS",
            detail: "no external analytics added and no production monitoring activation was performed.",
            ownerAction: "Keep monitoring as a readiness plan until owner approval is granted later.",
          },
          {
            area: "Owner review",
            status: "OWNER REVIEW REQUIRED",
            detail: "owner review required before this monitoring plan can support any future limited soft launch.",
            ownerAction: "Do not treat manual observation planning as launch approval.",
          },
        ],
      },
      {
        title: "monitoring blockers",
        items: blockerItems(),
      },
      {
        title: "ready areas monitored later",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_SOFT_LAUNCH_MONITORING_READINESS_PLAN_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 262 - Incident Rollback Response Drill",
  };
}
