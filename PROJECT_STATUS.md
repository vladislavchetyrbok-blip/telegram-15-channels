# Project Status

Updated: 2026-06-01

## Current Status

- Daily autopublish preparation is complete and remains safe.
- Telegram was not called for publishing during this stage.
- Autopublish was not enabled.
- Quick publish and today's plan were not run.
- Telegram targets/chat_id were not changed.
- Existing published/message_id markers were not changed.
- Images were not regenerated.

## Ready

- Weekly plan: 105 posts total.
- Published posts: 1 preserved.
- Ready to publish: 104.
- Blocked: 0.
- Telegram bot access: 15/15 OK.
- Telegram token/getMe: OK.
- Premium visuals: `premium_v2` 105/105.
- Image dimensions: 1080x1350.
- Telegram image OK: 105/105.
- Image quality strong: 105.
- Weak images: 0.
- Caption OK: 105.
- Content mojibake: 0.
- Forbidden currency hits: 0.
- Old `IMAGE_PROCESS_FAILED` / wrong chat_id entries are historical only, not active blockers.

## Visual Engine

- Current provider: `local_template`.
- `IMAGE_PROVIDER`: `local_template`.
- `IMAGE_HARDWARE_PROFILE`: `low`.
- `IMAGE_AI_ENABLED`: `false`.
- `IMAGE_GENERATION_MODE`: `template_first`.
- Fallback provider: `local_template`.
- ComfyUI status: `COMFYUI_NOT_AVAILABLE`.
- ComfyUI fallback: OK, `local_template` is active.
- Heavy AI generation is disabled by default.
- Mass image regeneration remains blocked unless explicitly requested.

## UI And Diagnostics

- `/publishing-center` includes the final Launch Checklist block.
- `/publishing-center` includes the safe `Prepare autopublish launch` readiness button.
- The button only calls `GET /api/autopublish/launch-readiness`.
- It does not enable autopublish and does not send posts.
- Worker/autopublish explanation is shown as: `Worker работает, но публикации заблокированы, потому что autopublish выключен.`
- Visible UI/source/debug mojibake in `app` and `components` was removed.
- Visual metadata remains visible in the UI: provider, source/style data, image quality, dimensions/version/fallback fields where available.

## Autopublish Safety

- `config.enabled = false`.
- Worker status: running.
- Scheduler status: `stopped_by_disabled`.
- This is expected while autopublish is disabled and is not an error.
- Queue health: OK.
- Telegram connection: OK.
- Content quality: OK.
- New readiness endpoint: `GET /api/autopublish/launch-readiness`.
- Readiness result: `ready: true`, `blockers: []`, `canEnableAutopublish: true`, `safeToRunNextPost: true`.

## Checks Passed

- `npm run lint`: OK.
- `npx tsc --noEmit`: OK.
- `npm run audit:content`: OK.
- `GET /api/visuals/engine`: OK.
- `GET /api/autopublish/health`: OK.
- `GET /api/autopublish/launch-readiness`: OK.
- UI/source mojibake scan for `app` and `components`: OK.

## Changed Files

- `PROJECT_STATUS.md`
- `app/api/autopublish/launch-readiness/route.ts`
- `app/publishing-center/page.tsx`
- `components/AutopublishPanel.tsx`
- `components/LaunchReadinessChecklist.tsx`
- `components/WeeklyContentPlanPanel.tsx`
- `lib/autopublish.ts`
- `lib/weekly-content-plan.ts`

## Remaining Before Enabling Autopublish

- Review `/publishing-center` visually.
- Confirm `GET /api/autopublish/launch-readiness` still returns `ready: true` and `blockers: []`.
- Confirm Telegram targets are still correct.
- Decide explicitly to enable autopublish in a separate command/session.

## Safe Launch Order

1. Run `npm run lint`.
2. Run `npx tsc --noEmit`.
3. Run `npm run audit:content`.
4. Open `/publishing-center`.
5. Click `Prepare autopublish launch`.
6. Confirm Launch Checklist has no blockers.
7. Confirm worker running + autopublish disabled is shown as expected.
8. Only after explicit human confirmation, enable autopublish as a separate action.
9. After enabling, monitor `/api/autopublish/health`.
10. Do not use quick publish unless separately requested.
