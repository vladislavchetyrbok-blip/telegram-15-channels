import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_OWNER_APPROVAL_GATE_FINAL_MANUAL_DECISION_PLAN_TITLE =
  "Owner Approval Gate Final Manual Decision Plan";

export const APHRODITE_OWNER_APPROVAL_GATE_FINAL_MANUAL_DECISION_PLAN_ROUTE =
  "/dashboard/networks/zodiac/owner-approval-gate-final-manual-decision-plan" as const;

export function getAphroditeOwnerApprovalGateFinalManualDecisionPlan(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 258,
    title: APHRODITE_OWNER_APPROVAL_GATE_FINAL_MANUAL_DECISION_PLAN_TITLE,
    route: APHRODITE_OWNER_APPROVAL_GATE_FINAL_MANUAL_DECISION_PLAN_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "APPROVAL NOT GRANTED",
    requiredMarkers: [
      "owner approval missing",
      "manual decision only",
      "approval not granted",
      "soft launch cannot execute now",
      "publicLaunchApproved=false",
      "ownerManualReviewRequired=true",
      "Package 259 - Limited Soft Launch Dry Run Matrix",
    ],
    sections: [
      {
        title: "owner approval decision gate",
        items: [
          {
            area: "Owner explicit approval",
            status: "OWNER REVIEW REQUIRED",
            detail: "owner approval missing and approval not granted.",
            ownerAction: "Owner must make an explicit manual go/no-go decision later.",
          },
          {
            area: "Manual decision only",
            status: "NOT APPROVED",
            detail: "manual decision only; this package does not approve or launch anything.",
            ownerAction: "Do not set publicLaunchApproved=true in this package.",
          },
          {
            area: "Soft launch execution",
            status: "BLOCKED",
            detail: "soft launch cannot execute now.",
            ownerAction: "Clear all blockers before any future execution package.",
          },
        ],
      },
      {
        title: "why not launch now",
        items: blockerItems(),
      },
      {
        title: "ready areas for future owner review",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_OWNER_APPROVAL_GATE_FINAL_MANUAL_DECISION_PLAN_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 259 - Limited Soft Launch Dry Run Matrix",
  };
}
