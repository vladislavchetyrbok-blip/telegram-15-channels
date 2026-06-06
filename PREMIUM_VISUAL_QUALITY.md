# Premium Visual Quality v2

Premium Visual Quality v2 is a read-only preparation layer for improving Telegram post visuals before any real publishing flow uses them. It detects weak demo-looking images, builds channel-specific image prompts, and previews a visual regeneration queue while keeping production publishing unchanged.

## Why It Exists

The previous visual layer can produce technically present images, but many of them still read like auto-generated demo covers: abstract backgrounds, weak focal points, repeated template styling, and little channel identity. That makes channels feel less like media brands and more like a generated feed.

Premium Visual Quality v2 adds a stricter editorial gate:

- image and metadata scoring;
- channel-specific visual profiles;
- concrete prompt building;
- visual-mode and image-count preview;
- regeneration recommendations without deleting old visuals.

## Why Demo Visuals Are Weak

Demo visuals are usually weak because they rely on generic abstractions instead of real subjects. Examples include empty neural-network backgrounds, random neon lines, template labels, repeated local-template covers, unreadable text overlays, and backgrounds with no clear focal object.

For `ai-tech`, the weak direction is:

```text
AI technology abstract background, blue neural network, neon lines.
```

The preferred direction is:

```text
Premium editorial cover for a Telegram tech channel: realistic dark workspace with laptop showing a clean AI workflow dashboard, subtle glass UI panels, cinematic lighting, strong focal point, no text, no logos, no random neural network lines, high-end media style.
```

## Channel Visual Profiles

The v2 profiles define a visual identity for each channel. The minimum covered channels are:

- `ai-tech`
- `money-opportunities`
- `dnipro-city`
- `auto-comfort`
- `fishing-rest`
- `mens-style`

Each profile includes:

- visual identity;
- preferred composition;
- preferred subjects;
- preferred color mood;
- forbidden patterns;
- prompt keywords;
- negative prompt patterns;
- allowed visual modes;
- examples of good and bad direction.

The profile is used by the prompt builder and quality gate. It prevents generic visuals from passing just because an image file exists.

## Visual Quality Gate

The quality gate reads `data/runtime/weekly-content-plan.json` and existing presentation analysis. It does not send, publish, migrate, or rewrite posts.

Flags:

- `genericAbstractRisk`
- `emptyComposition`
- `weakFocalPoint`
- `cheapDemoLook`
- `tooMuchEmptySpace`
- `badTextOverlayRisk`
- `serviceLabelRisk`
- `channelMismatch`
- `repeatedVisualStyle`
- `missingSubject`
- `weakEditorialValue`
- `lowPremiumScore`

Scores:

- `visualQualityScore` starts from 100 and subtracts weighted penalties for visual problems.
- `premiumScore` rewards premium/editorial/realistic/focal signals and penalizes demo/template risk.
- `channelFitScore` rewards profile keywords and preferred subjects, then penalizes mismatch or missing subject risk.

The gate returns:

- `visualQualityScore` from 0 to 100;
- `premiumScore` from 0 to 100;
- `channelFitScore` from 0 to 100;
- `regenerationRecommended`;
- `blockPublication`.

## Visual Prompt Builder v2

The prompt builder uses:

- channel profile;
- topic and title;
- content template;
- visual mode;
- length bucket;
- target audience;
- recent visual history;
- freshness guidance;
- negative prompt patterns.

It avoids prompts like:

```text
AI technology abstract background
```

It produces prompts like:

```text
Premium editorial cover for a Telegram channel: premium clean tech editorial for a practical AI and software media channel. Topic: AI automation. Audience: builders, operators, founders, and power users who want useful AI workflows. Composition: dark realistic workspace or product scene, one strong focal device/interface, layered depth, cinematic but restrained light. Strong focal point, real-world object or scene, useful editorial value, no text, no logos, no watermark.
```

## Visual Modes

The quality report uses the presentation engine visual modes:

- `single_image`
- `double_image`
- `triple_image`
- `cover_card`
- `editorial_visual`
- `carousel_ready`

Preview output shows the selected `visualMode`, required image count, prompt for the visual, and why the mode was selected. This stage does not add Telegram album sending.

## Regeneration Queue

If a visual is weak, the report adds it to the regeneration preview when the post is not already published. The old visual is not deleted.

Each queue item includes:

- post id and channel id;
- old image or prompt;
- `recommendedPrompt`;
- `negativePrompt`;
- `regenerationReason`;
- quality flags;
- recommended action.

Published weak visuals are reported for visibility only. They are not rewritten by this v2 layer.

## Commands

Run:

```bash
npm run visual:quality:check
npm run visual:regeneration:preview
```

The commands are read-only. They do not call Telegram, GitHub Actions, Supabase migration apply, or bulk publishing.

## Admin Page

The read-only admin page is:

```text
/admin/visual-quality
```

The endpoint is:

```text
app/api/admin/visual-quality/status/route.ts
```

The endpoint supports GET only and returns:

- `status`
- `summary`
- `samples`
- `weakVisuals`
- `regenerationQueuePreview`
- `issues`
- `recommendations`
- `lastCheckedAt`

## Safety

This stage does not change real publication behavior.

- Telegram real send is not run.
- GitHub Actions are not run.
- `publish-scheduler.yml` is not changed.
- Production store remains JSON.
- Source of truth remains JSON.
- `.env.local` and secrets must not be committed.
