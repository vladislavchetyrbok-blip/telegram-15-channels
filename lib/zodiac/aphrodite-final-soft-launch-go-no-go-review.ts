import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_FINAL_SOFT_LAUNCH_GO_NO_GO_REVIEW_TITLE =
  "Final Soft Launch Go/No-Go Review";

export const APHRODITE_FINAL_SOFT_LAUNCH_GO_NO_GO_REVIEW_ROUTE =
  "/dashboard/networks/zodiac/final-soft-launch-go-no-go-review" as const;

export function getAphroditeFinalSoftLaunchGoNoGoReview(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 260,
    title: APHRODITE_FINAL_SOFT_LAUNCH_GO_NO_GO_REVIEW_TITLE,
    route: APHRODITE_FINAL_SOFT_LAUNCH_GO_NO_GO_REVIEW_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "APPROVAL NOT GRANTED",
    requiredMarkers: [
      "go/no-go review",
      "NO-GO",
      "Final Candidate Status",
      "Can execute soft launch now: No",
      "approval not granted",
      "Package 261 - Soft Launch Monitoring Readiness Plan",
    ],
    sections: [
      {
        title: "go/no-go review",
        items: [
          {
            area: "Final Candidate Status",
            status: "BLOCKED",
            detail: "NO-GO: Final Candidate Status is NOT READY because manual production, backup, real-device, WebView, content/CTA, and owner approval blockers remain open.",
            ownerAction: "Do not launch. Keep owner approval as approval not granted.",
          },
          {
            area: "Soft launch execution",
            status: "BLOCKED",
            detail: "Can execute soft launch now: No.",
            ownerAction: "Complete every manual blocker before any future soft launch decision.",
          },
          {
            area: "Owner decision",
            status: "OWNER REVIEW REQUIRED",
            detail: "approval not granted; publicLaunchApproved=false and ownerManualReviewRequired=true.",
            ownerAction: "Owner must explicitly approve later after evidence is complete.",
          },
        ],
      },
      {
        title: "why launch remains no-go",
        items: blockerItems(),
      },
      {
        title: "ready areas in the review packet",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_FINAL_SOFT_LAUNCH_GO_NO_GO_REVIEW_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 261 - Soft Launch Monitoring Readiness Plan",
  };
}
