import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_INCIDENT_ROLLBACK_RESPONSE_DRILL_TITLE =
  "Incident Rollback Response Drill";

export const APHRODITE_INCIDENT_ROLLBACK_RESPONSE_DRILL_ROUTE =
  "/dashboard/networks/zodiac/incident-rollback-response-drill" as const;

export function getAphroditeIncidentRollbackResponseDrill(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 262,
    title: APHRODITE_INCIDENT_ROLLBACK_RESPONSE_DRILL_TITLE,
    route: APHRODITE_INCIDENT_ROLLBACK_RESPONSE_DRILL_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "OWNER REVIEW REQUIRED",
    requiredMarkers: [
      "incident rollback response drill",
      "rollback drill only",
      "do not retry blindly",
      "no restore executed",
      "owner stop decision",
      "Package 263 - Pre-Soft-Launch Owner Brief",
    ],
    sections: [
      {
        title: "incident rollback response drill",
        items: [
          {
            area: "Rollback drill boundary",
            status: "DOCUMENTED",
            detail: "rollback drill only; no restore executed, no production DB connection, and no rollback command was run.",
            ownerAction: "Use the drill as a manual rehearsal checklist before any future launch.",
          },
          {
            area: "Incident response rule",
            status: "MANUAL REQUIRED",
            detail: "do not retry blindly after failed env, backup, WebView, CTA, or payment-adjacent checks.",
            ownerAction: "Owner makes an owner stop decision before any recovery or rollback step.",
          },
          {
            area: "Rollback readiness",
            status: "BLOCKED",
            detail: "Rollback remains blocked until backup freshness and restore rehearsal are manually verified.",
            ownerAction: "Record last verified commit and restore evidence manually.",
          },
        ],
      },
      {
        title: "rollback drill blockers",
        items: blockerItems(),
      },
      {
        title: "ready areas used by the drill",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_INCIDENT_ROLLBACK_RESPONSE_DRILL_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 263 - Pre-Soft-Launch Owner Brief",
  };
}
