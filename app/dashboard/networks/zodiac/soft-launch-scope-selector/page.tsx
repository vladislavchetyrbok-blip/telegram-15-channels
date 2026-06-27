import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE,
  getAphroditeSoftLaunchScopeSelector,
} from "@/lib/zodiac/aphrodite-soft-launch-scope-selector";

const model = getAphroditeSoftLaunchScopeSelector();

export const metadata = {
  title: model.title,
};

export default function AphroditeSoftLaunchScopeSelectorPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE}
      badge="Aphrodite / Soft launch scope"
      description="Owner-facing selector for the smallest safe future soft-launch scope. This is not a launch, does not approve launch, and keeps publicLaunchApproved=false until explicit owner approval."
      metrics={[
        { label: "currentOwnerDecisionState", value: model.currentOwnerDecisionState, tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "recommended first scope", value: "Internal owner review only", tone: "cyan" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "current launch status",
          rows: [
            {
              area: "APPROVAL NOT GRANTED",
              status: "APPROVAL NOT GRANTED",
              detail: "Current state remains approval not granted; soft launch and public launch are not approved.",
              action: "Do not start launch until a future owner go decision.",
            },
            {
              area: "publicLaunchApproved=false",
              status: "NOT APPROVED",
              detail: "Public launch approval remains false.",
              action: "Keep this flag false until explicit future approval.",
            },
            {
              area: "ownerManualReviewRequired=true",
              status: "OWNER REVIEW REQUIRED",
              detail: "Owner manual review remains required.",
              action: "Complete manual prerequisites and approval outside this package.",
            },
          ],
        },
        {
          title: "recommended smallest soft launch scope",
          rows: model.recommendedScope.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "excluded scope",
          rows: model.excludedScope.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "candidate channels",
          rows: model.candidateChannels.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "candidate Mini App flows",
          rows: model.candidateMiniAppFlows.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "manual prerequisites",
          rows: model.manualPrerequisites.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "launch modes",
          rows: model.launchModes.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "stop conditions",
          rows: model.stopConditions.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "rollback conditions",
          rows: model.rollbackConditions.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "monitoring checklist",
          rows: model.monitoringChecklist.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "owner decision states",
          rows: model.ownerDecisionStates.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "safety boundaries",
          rows: model.safetyBoundaries.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Soft Launch Owner Go/No-Go", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
        { label: "Launch Simulation Status", href: "/dashboard/networks/zodiac/launch-simulation-status-report" },
        { label: "Content CTA Owner Review", href: "/dashboard/networks/zodiac/content-cta-owner-review-gate" },
        { label: "Real Device QA Execution", href: "/dashboard/networks/zodiac/real-device-qa-execution-pack" },
      ]}
    />
  );
}
