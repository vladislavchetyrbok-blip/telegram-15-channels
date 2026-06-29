# Package 306 - Mobile Result Density Guardrails

## Summary

Create design and content guardrails to prevent future wall-of-text result screens on mobile Telegram WebView.

Status field: `mobileDensityGuardrailsStatus`  
Status value: `ACTIVE_DOCUMENTED`

## density rules

- no 30 huge cards in preview: ACTIVE_DOCUMENTED. Preview states should not render 30 full-height cards with repeated long copy. Owner action: Use compact rows or collapsed sections for long ranges.
- no repeated disclaimer on every card: ACTIVE_DOCUMENTED. Shared disclaimers belong near the result, not inside every day card. Owner action: Keep repeated disclaimers singular.
- day card max copy length: ACTIVE_DOCUMENTED. Expanded preview day cards should use day/date, mood, one short sentence, and one short action. Owner action: Review copy length before owner QA.
- first 3-5 days expanded max: ACTIVE_DOCUMENTED. Only the first 3-5 days may appear as expanded preview cards. Owner action: Use compact rows for the rest.
- rest compact/collapsed: ACTIVE_DOCUMENTED. Remaining long sequences should be compact rows or collapsed groups. Owner action: Keep scrolling light on 390px viewports.

## mobile layout rules

- save/share buttons remain visible: ACTIVE_DOCUMENTED. Primary save/share controls should stay reachable after result generation. Owner action: Check real device scroll paths.
- no horizontal overflow: ACTIVE_DOCUMENTED. Cards, buttons, and inputs must not create horizontal scrolling. Owner action: Recheck long labels in Telegram WebView.
- no letter-by-letter wrapping: ACTIVE_DOCUMENTED. Long labels must not wrap one letter per line. Owner action: Use compact text and responsive constraints.

## Required Safety State

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- readyForProductionLaunch=false
- softLaunchStatus=NO / NOT_APPROVED unless this package records a stricter NO-GO value
- all manual blockers remain open unless real evidence exists
- no fake screenshots
- no fake backup freshness
- no fake env closure
- no fake BotFather setup

## Open Blockers

- owner real-device screenshots and explicit approval are still required
- DATABASE_URL is missing
- TELEGRAM_BOT_TOKEN is missing
- backup freshness is older than 24h
- restore rehearsal evidence is still required
- PUBLIC_APP_URL evidence is still required
- BotFather Mini App URL setup remains manual and not done

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- .env.local committed: No

## Next Package

Package 307 - Public Mini App Route Visual Regression Checklist
