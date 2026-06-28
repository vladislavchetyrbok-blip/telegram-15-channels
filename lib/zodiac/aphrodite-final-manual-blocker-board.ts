import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_FINAL_MANUAL_BLOCKER_BOARD_TITLE =
  "Final Manual Blocker Board";

export const APHRODITE_FINAL_MANUAL_BLOCKER_BOARD_ROUTE =
  "/dashboard/networks/zodiac/final-manual-blocker-board" as const;

export function getAphroditeFinalManualBlockerBoard(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 265,
    title: APHRODITE_FINAL_MANUAL_BLOCKER_BOARD_TITLE,
    route: APHRODITE_FINAL_MANUAL_BLOCKER_BOARD_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "APPROVAL NOT GRANTED",
    requiredMarkers: [
      "manual blocker board",
      "Final Candidate Status",
      "NOT READY",
      "blocker remains open",
      "owner approval missing",
      "Package 266 - Final Pre-Owner-Review Summary",
    ],
    sections: [
      {
        title: "manual blocker board",
        items: [
          {
            area: "Final Candidate Status",
            status: "BLOCKED",
            detail: "NOT READY: every blocker remains open until owner evidence is recorded manually.",
            ownerAction: "Use the board to track manual readiness only.",
          },
          {
            area: "Open blocker rule",
            status: "BLOCKED",
            detail: "blocker remains open for env, backup, restore, real-device QA, WebView QA, content/CTA review, and owner approval.",
            ownerAction: "Do not close blockers automatically.",
          },
          {
            area: "Owner approval",
            status: "NOT APPROVED",
            detail: "owner approval missing and publicLaunchApproved=false.",
            ownerAction: "Owner explicit approval is required later.",
          },
        ],
      },
      {
        title: "open manual blockers",
        items: blockerItems(),
      },
      {
        title: "ready areas waiting for manual review",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_FINAL_MANUAL_BLOCKER_BOARD_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 266 - Final Pre-Owner-Review Summary",
  };
}
