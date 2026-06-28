import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_LIMITED_SOFT_LAUNCH_DRY_RUN_MATRIX_TITLE =
  "Limited Soft Launch Dry Run Matrix";

export const APHRODITE_LIMITED_SOFT_LAUNCH_DRY_RUN_MATRIX_ROUTE =
  "/dashboard/networks/zodiac/limited-soft-launch-dry-run-matrix" as const;

export function getAphroditeLimitedSoftLaunchDryRunMatrix(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 259,
    title: APHRODITE_LIMITED_SOFT_LAUNCH_DRY_RUN_MATRIX_TITLE,
    route: APHRODITE_LIMITED_SOFT_LAUNCH_DRY_RUN_MATRIX_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "APPROVAL NOT GRANTED",
    requiredMarkers: [
      "dry-run only",
      "No production launch was performed",
      "limited soft launch dry run",
      "blocked steps",
      "owner approval required",
      "Package 260 - Final Soft Launch Go/No-Go Review",
    ],
    sections: [
      {
        title: "limited soft launch dry run matrix",
        items: [
          {
            area: "Dry-run only",
            status: "DOCUMENTED",
            detail: "dry-run only. No production launch was performed.",
            ownerAction: "Use as a simulation matrix, not as launch approval.",
          },
          {
            area: "Limited scope simulation",
            status: "MANUAL REQUIRED",
            detail: "limited soft launch dry run covers internal owner review, private link review, and smallest future scope only.",
            ownerAction: "owner approval required before any future limited soft launch scope can run.",
          },
          {
            area: "Blocked steps",
            status: "BLOCKED",
            detail: "blocked steps remain blocked until env, backup, restore, device QA, WebView QA, CTA review, and owner approval are complete.",
            ownerAction: "Do not run live publish or Telegram messaging.",
          },
        ],
      },
      {
        title: "why dry run cannot become launch",
        items: blockerItems(),
      },
      {
        title: "ready areas represented in dry run",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_LIMITED_SOFT_LAUNCH_DRY_RUN_MATRIX_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 260 - Final Soft Launch Go/No-Go Review",
  };
}
