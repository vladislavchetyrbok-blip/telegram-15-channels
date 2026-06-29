import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import type { AphroditeManualEvidencePackageDefinition, AphroditeManualEvidenceRow } from "@/lib/zodiac/aphrodite-manual-evidence-readiness-registry";

function displayText(value: string) {
  return value.replaceAll("DRAFT_BLOCKED_UNTIL_MANUAL_GATES_CLOSED", "BLOCKED_UNTIL_MANUAL_GATES_CLOSED");
}

function rows(items: readonly AphroditeManualEvidenceRow[]) {
  return items.map((item) => ({
    area: item.area,
    status: item.pageStatus ?? displayText(item.status),
    detail: displayText(item.detail),
    action: displayText(item.ownerAction),
  }));
}

export function AphroditeManualEvidencePackagePage({ model }: { model: AphroditeManualEvidencePackageDefinition }) {
  const primaryRow = model.statusRows.find((item) => item.area === model.primaryStatusKey);
  const primaryValue = primaryRow?.pageStatus ?? displayText(String(model.statusFields[model.primaryStatusKey]));

  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={model.route}
      badge="Aphrodite / manual evidence"
      description="Manual evidence and final readiness gate record. This page is static and does not close blockers, launch production, configure secrets, call Telegram, change BotFather, connect production DB, write DB, add payment, unlock VIP, or change cron/workflows."
      metrics={[
        { label: model.primaryStatusKey, value: primaryValue, tone: "amber" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "softLaunchStatus", value: model.softLaunchStatusNo, tone: "rose" },
        { label: "blockersRemainOpen", value: String(model.blockersRemainOpen), tone: "rose" },
      ]}
      sections={[
        { title: "status fields", rows: rows(model.statusRows) },
        { title: "evidence required", rows: rows(model.evidenceRequired) },
        { title: "manual actions", rows: rows(model.manualActions) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.pageSafetyNotes ?? model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Owner Manual Closure Execution Pack", href: "/dashboard/networks/zodiac/owner-manual-closure-execution-pack" },
        { label: "Production Blocker Closure Checklist", href: "/dashboard/networks/zodiac/production-blocker-closure-checklist" },
        { label: "Manual Evidence Readiness Summary", href: "/dashboard/networks/zodiac/manual-evidence-readiness-summary" },
      ]}
    />
  );
}
