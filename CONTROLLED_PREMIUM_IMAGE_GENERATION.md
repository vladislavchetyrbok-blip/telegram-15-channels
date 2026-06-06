# Controlled Premium Image Generation v1

Controlled Premium Image Generation v1 creates one safe premium image candidate for one existing visual regeneration draft. It does not publish to Telegram, does not replace published post images, and does not apply the draft automatically.

## Scope

- Target channel: `ai-tech`.
- Selection size: exactly one active visual regeneration draft.
- Production store mode remains `json`.
- Source of truth remains `json`.
- Published posts are not rewritten.
- Existing post images are not deleted.
- Telegram send is not started.

## Commands

Dry-run:

```powershell
npm run visual:regen:image:dry
```

The dry-run selects one active `ai-tech` visual regeneration draft and prints:

- `draftId`
- `postId`
- `channelId`
- `oldImagePath`
- `oldPrompt`
- `newPremiumPrompt`
- `negativePrompt`
- planned `newImageCandidatePath`

It does not create files and does not change draft metadata.

Create:

```powershell
npm run visual:regen:image:create
```

The create command requires the internal confirmation flag already wired into the npm script. It creates one image candidate for one draft only.

If local generation succeeds, it writes a PNG candidate under:

```text
public/assets/visual-regeneration-candidates/<draftId>/<postId>.png
```

It also records metadata in:

```text
data/visual-regeneration-drafts/visual-regeneration-image-candidates.json
```

The metadata includes:

- `draftId`
- `postId`
- `channelId`
- `oldImagePath`
- `newImageCandidatePath`
- `newPremiumPrompt`
- `negativePrompt`
- `generationStatus`
- `generatorUsed`
- `createdAt`
- `visualQualityEstimate`
- `backupPath`

If generation is unavailable or fails, the status is `generationUnavailable` or `failed`; the command does not invent a success file.

Status:

```powershell
npm run visual:regen:image:status
```

The status command reports all image candidates, physical file existence, generation status, generator used, prompt package, quality estimate, and whether old/new preview is comparable.

## Generator

The first controlled generator is `local_draft_png`, implemented in `scripts/lib/visual-regeneration-images.mjs`. It writes a local PNG draft asset with a premium ai-tech workspace/device composition. It does not call Telegram, does not call GitHub Actions, and does not write to the production post image path.

The existing `scripts/generate-premium-visuals.ps1` can generate PNGs, but it updates runtime weekly plan items and normal post image paths. For this controlled draft test, it is intentionally not used.

## Old vs New Preview

Open the admin visual quality screen and use the `Old vs New Visual Candidate` block:

```text
/admin/visual-quality
```

The block shows:

- old image
- new image candidate, when the physical file exists
- prompt-only state, when no file exists
- old prompt
- new premium prompt
- negative prompt
- quality reasons
- draft status
- generation status

There are no publish or send buttons in this block.

The read-only API behind the preview is:

```text
GET /api/admin/visual-regeneration/images/status
```

## Safety Rules

If the source post is already published:

- do not replace the image in the published post
- do not change publication logs
- do not change Telegram messages
- only create a draft candidate

If the visual draft is not approved:

- apply remains blocked

If no image file is created:

- status must be `generationUnavailable` or `failed`
- status must not be `generated`

## Apply Flow

Image candidate creation is not draft application. The apply command remains separate:

```powershell
npm run visual:regen:apply:dry
```

Apply without an approved draft remains blocked.
