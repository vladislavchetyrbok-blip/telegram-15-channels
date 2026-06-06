# Visual Provider System v1

Visual Provider System v1 separates demo image generation from premium visual candidates.

## Why Placeholder Is Not Premium

The current local PNG generator is useful for dev/test previews, but it produces demo/vector-style placeholder visuals. A better prompt does not make that generator a production-grade media provider.

By default:

- `VISUAL_PROVIDER=placeholder`
- `ALLOW_PLACEHOLDER_PREMIUM=false`
- `ENABLE_MANUAL_VISUAL_IMPORT=true`

When the placeholder provider is used, candidates are marked with:

- `provider=placeholder`
- `placeholderProviderUsed=true`
- `visualQualityStatus=notPremium`
- `premiumUsable=false`

Those candidates must not be applied for premium production use.

## Providers

- `placeholder`: current demo/vector generator. Dev/test only by default.
- `manual_upload`: imports a user-provided PNG/JPG/WebP from `data/manual-visual-imports/`.
- `external_ai`: interface stub for a future external AI provider. No API key is required by v1.
- `local_comfyui`: interface stub for a future local ComfyUI provider. v1 does not start ComfyUI.
- `premium_library`: selects prepared premium assets from `data/premium-visual-library/index.json`.

## Manual Upload

Place one `.png`, `.jpg`, `.jpeg`, or `.webp` file in:

```bash
data/manual-visual-imports/
```

Then run:

```bash
npm run visual:asset:import:dry
npm run visual:asset:import
npm run visual:asset:status
```

The import command copies one file into the visual candidate area and records metadata:

- `provider=manual_upload`
- `originalFileName`
- `candidatePath` / `newImageCandidatePath`
- `postId`
- `channelId`
- `draftId`
- `importedAt`
- `visualQualityStatus=pending_review`

It does not apply the draft and does not publish anything.

## Premium Library

Prepared premium images can be indexed in:

```bash
data/premium-visual-library/index.json
```

Each item uses:

- `id`
- `channelId`
- `tags`
- `style`
- `filePath`
- `sourceNote`
- `licenseNote`
- `createdAt`

Commands:

```bash
npm run visual:library:status
npm run visual:library:candidate:dry
npm run visual:library:candidate:create
```

v1 creates at most one candidate and never applies it automatically.

## External AI

`external_ai` is a provider interface stub. It reports `notConfigured` until a real provider and credentials are added. v1 does not require or print API keys.

## Local ComfyUI

`local_comfyui` is a provider interface stub. It reports `notConfigured` unless a local ComfyUI URL is configured. v1 does not start ComfyUI.

The current GTX 1650 4GB hardware profile should not be treated as the main premium local generation path. It can be useful for experiments, but premium media visuals should come from a stronger external provider, a curated library, or manual upload first.

## Status API

Read-only endpoint:

```bash
/api/admin/visual-providers/status
```

It returns the current provider, provider registry, manual import status, premium library status, candidates by provider, warnings, and recommendations.

## Apply Safety

Apply is blocked when:

- candidate provider is `placeholder`
- `placeholderProviderUsed=true`
- `visualQualityStatus` is not `approved`
- `premiumUsable=false`
- premium score is below threshold
- candidate file does not exist
- draft is not approved
- source post is already published
- explicit replacement approval is missing

Production source of truth remains JSON. Telegram real send is not part of this system.
