# Package 296 - Restore Rehearsal Evidence Intake

## Status

`restoreRehearsalStatus = REQUIRED_NOT_COMPLETED`

`restoreEvidenceStatus = PENDING_MANUAL_REHEARSAL`

`publicLaunchApproved=false`, `ownerManualReviewRequired=true`, `softLaunchStatus=NO`, and blockers remain open.

## Evidence Required

- Restore rehearsal must be manual/safe.
- No production DB writes.
- No production DB mutation.
- Evidence required before launch.

## Manual Actions

Owner must run a safe restore rehearsal against a non-production target and record target, timestamps, aggregate checks, reviewer, and result.

## Safety

This package does not restore production, connect production DB, mutate production DB, write DB, or launch.

## Next

Package 297 - Public URL Evidence Intake
