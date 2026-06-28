import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_MANUAL_CHECKLIST_ONE_PAGE_RUNBOOK_TITLE =
  "Manual Checklist One-Page Runbook";

export const APHRODITE_MANUAL_CHECKLIST_ONE_PAGE_RUNBOOK_ROUTE =
  "/dashboard/networks/zodiac/manual-checklist-one-page-runbook" as const;

export function getAphroditeManualChecklistOnePageRunbook(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 264,
    title: APHRODITE_MANUAL_CHECKLIST_ONE_PAGE_RUNBOOK_TITLE,
    route: APHRODITE_MANUAL_CHECKLIST_ONE_PAGE_RUNBOOK_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "OWNER REVIEW REQUIRED",
    requiredMarkers: [
      "one-page runbook",
      "manual checklist",
      "stop if any blocker is open",
      "owner sign-off required",
      "Package 265 - Final Manual Blocker Board",
    ],
    sections: [
      {
        title: "one-page runbook",
        items: [
          {
            area: "Manual checklist",
            status: "DOCUMENTED",
            detail: "manual checklist for env, backup, restore, real-device, WebView, CTA review, rollback, and owner approval.",
            ownerAction: "Use the checklist manually; do not mark evidence complete automatically.",
          },
          {
            area: "Stop rule",
            status: "BLOCKED",
            detail: "stop if any blocker is open; soft launch cannot execute now.",
            ownerAction: "Owner sign-off required only after every blocker has evidence.",
          },
          {
            area: "Owner sign-off",
            status: "OWNER REVIEW REQUIRED",
            detail: "owner sign-off required and approval is not granted by this runbook.",
            ownerAction: "Record explicit approval manually later.",
          },
        ],
      },
      {
        title: "runbook blockers",
        items: blockerItems(),
      },
      {
        title: "ready areas to verify",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_MANUAL_CHECKLIST_ONE_PAGE_RUNBOOK_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 265 - Final Manual Blocker Board",
  };
}
