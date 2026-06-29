# Package 297 - Public URL Evidence Intake

## Status

`publicUrlEvidenceStatus = PENDING_PUBLIC_URL`

`publicUrlApproved = false`

`publicUrlStatus = MISSING_OR_NOT_VERIFIED`

`publicLaunchApproved=false`, `ownerManualReviewRequired=true`, `softLaunchStatus=NO`, and blockers remain open.

## Evidence Required

- PUBLIC_APP_URL required.
- HTTPS required.
- Public route checks required.
- No dashboard/admin shell on public routes.
- Do not approve without owner evidence.

## Manual Actions

Owner provides HTTPS public URL evidence and route checks for Mini App public entry points before any approval.

## Safety

This package does not configure PUBLIC_APP_URL, fetch production routes, approve launch, call Telegram, or change BotFather.

## Next

Package 298 - BotFather Manual Setup Evidence Intake
