# Premium Content Presentation Engine v1

Premium Content Presentation is a read-only preparation layer for Telegram posts. It does not publish, migrate, mirror, or rewrite the JSON store. Its job is to inspect scheduled content before publication and show how each post can be presented with better hierarchy, template variety, Telegram-safe typography, and richer visual intent.

## Why It Exists

The current generation pipeline can create technically valid posts, but valid posts can still look like a demo feed when the structure repeats too often. This layer checks for weak headlines, walls of text, dash bullets, missing hierarchy, generic visual metadata, repetitive templates, and similar recent structures.

It is different from normal text generation because it does not create a new source post and does not mutate the content plan. It selects presentation metadata and produces preview-only improvements so an operator can inspect the next editorial step safely.

## Length Buckets

- `short`: 50-120 words, short insight, thought, or news angle.
- `medium`: 120-300 words, useful Telegram post.
- `long`: 300-700 words, mini breakdown.
- `deep`: 700-1200 words, expert deep dive used rarely.

For every post the engine selects `lengthBucket`, `contentTemplate`, `visualMode`, `typographyMode`, `estimatedWordCount`, and a human-readable reason.

## Content Templates

The v1 template set is:

- `short_insight`
- `practical_checklist`
- `expert_breakdown`
- `quick_news_angle`
- `opinion_takeaway`
- `comparison`
- `mistakes_to_avoid`
- `trend_explainer`
- `mini_case`
- `tools_list`

Templates are selected deterministically from channel profile rules and post content, so repeated runs are stable while nearby posts still vary.

## Visual Modes

The v1 visual metadata modes are:

- `single_image`
- `double_image`
- `triple_image`
- `no_image_rare`
- `cover_card`
- `editorial_visual`
- `carousel_ready`

This version only prepares intent and preview metadata. It does not implement real Telegram albums or multi-image sending.

## Channel Profiles

Profiles are included for:

- `ai-tech`
- `money-opportunities`
- `dnipro-city`
- `auto-comfort`
- `fishing-rest`
- `mens-style`

Each profile defines preferred length mix, allowed templates, visual styles, image count distribution, tone, formatting density, and bad visual/editorial patterns to avoid.

## Telegram Typography

The typography layer creates Telegram-safe preview HTML:

- headline in `<b>...</b>`
- short paragraphs
- bullets with `•`, `◦`, `✓`, or `→`
- final bold accent such as `<b>Вывод:</b>`
- escaped `<`, `>`, and `&`

The layer avoids making the full text bold and keeps emoji out of the formatting pass. The preview also exposes plain formatted text for review.

## Real Send Safety

Real Telegram send behavior is not changed in v1. The engine reports:

- `ENABLE_TELEGRAM_RICH_TEXT=false` by default
- `previewOnly=true` unless the flag is explicitly set to `true`
- `realSendChanged=false` in sample metadata

The current implementation produces `formattedText` and `telegramHtml` for preview/check only. A separate controlled test is required before real send behavior should depend on this layer.

## Commands

Run the quality gate:

```bash
npm run content:presentation:check
```

Run the preview for 3-5 unpublished posts:

```bash
npm run content:presentation:preview
```

Open the read-only admin page:

```text
/admin/content-presentation
```

The API endpoint is:

```text
GET /api/admin/content-presentation/status
```

There is no POST endpoint and no publish button in the admin page.

## Next Step

Premium Visual Quality v2 should use this metadata to improve visual prompts, image count handling, cover card strategy, and album-ready previews before any real publishing changes.
