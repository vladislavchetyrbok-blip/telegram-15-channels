#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 297,
  title: "Public URL Evidence Intake",
  slug: "aphrodite-public-url-evidence-intake",
  routeSlug: "public-url-evidence-intake",
  route: "/dashboard/networks/zodiac/public-url-evidence-intake",
  routeKey: "publicUrlEvidenceIntake",
  getterName: "getAphroditePublicUrlEvidenceIntake",
  statuses: {
    publicUrlEvidenceStatus: "PENDING_PUBLIC_URL",
    publicUrlApproved: false,
    publicUrlStatus: "MISSING_OR_NOT_VERIFIED",
  },
  requiredPhrases: [
    "PUBLIC_APP_URL required",
    "HTTPS required",
    "Public route checks required",
    "No dashboard/admin shell on public routes",
    "Do not approve without owner evidence",
  ],
});
