import {
  blockerItems,
  createFinalReadinessNotChanged,
  createFinalReadinessSafetyFlags,
  createFinalReadinessSafetyNotes,
  readyAreaItems,
  type AphroditeFinalReadinessPackageModel,
} from "./aphrodite-final-readiness-common";

export const APHRODITE_PRE_SOFT_LAUNCH_OWNER_BRIEF_TITLE =
  "Pre-Soft-Launch Owner Brief";

export const APHRODITE_PRE_SOFT_LAUNCH_OWNER_BRIEF_ROUTE =
  "/dashboard/networks/zodiac/pre-soft-launch-owner-brief" as const;

export function getAphroditePreSoftLaunchOwnerBrief(): AphroditeFinalReadinessPackageModel {
  return {
    packageNumber: 263,
    title: APHRODITE_PRE_SOFT_LAUNCH_OWNER_BRIEF_TITLE,
    route: APHRODITE_PRE_SOFT_LAUNCH_OWNER_BRIEF_ROUTE,
    currentStatus: "NOT READY",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    ownerDecisionStatus: "OWNER REVIEW REQUIRED",
    requiredMarkers: [
      "owner brief",
      "pre-soft-launch brief",
      "not ready for launch",
      "manual owner decision",
      "Package 264 - Manual Checklist One-Page Runbook",
    ],
    sections: [
      {
        title: "pre-soft-launch brief",
        items: [
          {
            area: "Owner brief",
            status: "DOCUMENTED",
            detail: "owner brief: the candidate is not ready for launch because manual blockers remain open.",
            ownerAction: "Read this as a manual briefing, not as approval.",
          },
          {
            area: "Manual owner decision",
            status: "OWNER REVIEW REQUIRED",
            detail: "manual owner decision is still required after env, backup, restore, real-device, WebView, and CTA evidence are complete.",
            ownerAction: "Owner must decide later and record explicit approval outside this package.",
          },
          {
            area: "Launch boundary",
            status: "BLOCKED",
            detail: "publicLaunchApproved=false, ownerManualReviewRequired=true, and soft launch cannot execute now.",
            ownerAction: "Do not launch from this brief.",
          },
        ],
      },
      {
        title: "brief blockers",
        items: blockerItems(),
      },
      {
        title: "ready areas summarized",
        items: readyAreaItems(),
      },
    ],
    remainingBlockers: blockerItems().map((item) => item.area),
    safetyFlags: createFinalReadinessSafetyFlags(),
    safetyNotes: createFinalReadinessSafetyNotes(APHRODITE_PRE_SOFT_LAUNCH_OWNER_BRIEF_TITLE),
    whatWasNotChanged: createFinalReadinessNotChanged(),
    nextPackageRecommendation: "Package 264 - Manual Checklist One-Page Runbook",
  };
}
