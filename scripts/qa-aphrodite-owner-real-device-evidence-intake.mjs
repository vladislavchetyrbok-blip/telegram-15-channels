#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 293,
  title: "Owner Real Device Evidence Intake",
  slug: "aphrodite-owner-real-device-evidence-intake",
  routeSlug: "owner-real-device-evidence-intake",
  route: "/dashboard/networks/zodiac/owner-real-device-evidence-intake",
  routeKey: "ownerRealDeviceEvidenceIntake",
  getterName: "getAphroditeOwnerRealDeviceEvidenceIntake",
  statuses: {
    ownerRealDeviceEvidenceStatus: "PENDING_OWNER_SCREENSHOTS",
    ownerRealDeviceApproval: false,
  },
  requiredPhrases: [
    "/miniapp",
    "/compatibility",
    "/birth-matrix",
    "/vip-preview",
    "/vip-compatibility-report",
    "/miniapp?startapp=mystic",
    "bottom nav",
    "date input 01012000 -> 01.01.2000",
    "time input",
    "city input Днепр / Дніпро",
  ],
});
