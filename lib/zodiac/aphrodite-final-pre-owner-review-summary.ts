import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_FINAL_PRE_OWNER_REVIEW_SUMMARY_TITLE =
  "Final Pre-Owner-Review Summary";

export const APHRODITE_FINAL_PRE_OWNER_REVIEW_SUMMARY_ROUTE =
  "/dashboard/networks/zodiac/final-pre-owner-review-summary" as const;

export function getAphroditeFinalPreOwnerReviewSummary(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 266,
    title: APHRODITE_FINAL_PRE_OWNER_REVIEW_SUMMARY_TITLE,
    route: APHRODITE_FINAL_PRE_OWNER_REVIEW_SUMMARY_ROUTE,
    currentStatus: "READY FOR OWNER REVIEW",
    canProceedToOwnerReview: true,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "OWNER REVIEW REQUIRED",
    requiredMarkers: [
      "Final Pre-Owner-Review Summary",
      "READY FOR OWNER REVIEW",
      "Can proceed to owner manual review: Yes",
      "Can execute soft launch now: No",
      "owner approval still required",
      "Package 267 - Owner Real-World Checklist Execution / or STOP for owner manual actions",
    ],
    sections: [
      {
        title: "final pre-owner-review summary",
        items: [
          {
            area: "Final Candidate Status",
            status: "OWNER REVIEW REQUIRED",
            detail: "READY FOR OWNER REVIEW: the readiness packet can be reviewed manually by the owner, but launch is not approved.",
            ownerAction: "Can proceed to owner manual review: Yes.",
          },
          {
            area: "Soft launch execution",
            status: "BLOCKED",
            detail: "Can execute soft launch now: No. Manual blockers and owner approval still required.",
            ownerAction: "Do not start Package 267 automatically and do not launch.",
          },
          {
            area: "Owner decision boundary",
            status: "OWNER REVIEW REQUIRED",
            detail: "owner approval still required; publicLaunchApproved=false and ownerManualReviewRequired=true.",
            ownerAction: "Owner must complete real-world actions and explicitly approve later.",
          },
        ],
      },
      {
        title: "remaining manual blockers",
        items: blockerItems(),
      },
      {
        title: "ready areas for owner review",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_FINAL_PRE_OWNER_REVIEW_SUMMARY_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 267 - Owner Real-World Checklist Execution / or STOP for owner manual actions",
  };
}
