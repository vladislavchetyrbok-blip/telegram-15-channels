# Controlled Visual Regeneration v1

Controlled Visual Regeneration нужен, чтобы безопасно подготовить улучшенные premium visual drafts для `ai-tech`, не публикуя их в Telegram и не заменяя картинки автоматически.

## Почему не менять опубликованные посты сразу

Опубликованный Telegram-пост уже имеет внешний результат: сообщение, картинку, историю отправки и проверку доставки. Поэтому v1 не меняет опубликованные ai-tech посты напрямую. Если опубликованный пост попадет в visual-кандидаты, draft помечается как `previewOnly`, а apply будет заблокирован.

## Как создаются drafts

Команда `visual:regen:drafts:create` читает `data/runtime/weekly-content-plan.json` и Premium Visual Quality v2 analysis. Выбор ограничен:

- только `channelId=ai-tech`;
- максимум 1-2 кандидата;
- сначала scheduled/ready/test-safe и unpublished посты;
- published candidates допускаются только как preview-only replacement candidates;
- production store остается `json`;
- source of truth остается `json`.

Draft сохраняет:

- `oldImage` и `oldPrompt`;
- `newPremiumPrompt`;
- `negativePrompt`;
- `regenerationReason`;
- scores before / expected after / expected improvement;
- `backupPath`;
- `placeholderPath`;
- status review layer.

Файлы лежат здесь:

- draft store: `data/visual-regeneration-drafts/visual-regeneration-drafts.json`;
- backups: `data/visual-regeneration-drafts/backups`;
- placeholder metadata: `data/visual-regeneration-drafts/previews`.

## Approval

Статусы visual draft:

- `draft`;
- `approved`;
- `rejected`;
- `needs_changes`;
- `applied`.

Review-команды меняют только draft store и не публикуют Telegram:

```bash
npm run visual:regen:review:approve -- --draft-id=<id>
npm run visual:regen:review:reject -- --draft-id=<id>
npm run visual:regen:review:needs-changes -- --draft-id=<id>
```

## Apply dry-run

Dry-run показывает, что может быть применено, и не меняет JSON:

```bash
npm run visual:regen:apply:dry
npm run visual:regen:apply:dry -- --draft-id=<id>
```

Apply разрешен только через CLI, только для approved draft и только с явными флагами:

```bash
npm run visual:regen:apply -- --draft-id=<id>
```

NPM script уже содержит `--apply --confirm-visual-draft-apply`, но draft id все равно обязателен. Если draft не `approved`, apply заблокирован. Если source post published или preview-only, apply заблокирован.

На v1 apply может применить prompt metadata. Картинка заменяется только если `newImagePath` указывает на реально существующий файл. Старые картинки не удаляются.

## Real Image Generation

На этом этапе real image generation не запускается. `scripts/generate-premium-visuals.ps1` умеет генерировать premium visuals, но его обычный режим переписывает план и картинки напрямую, поэтому v1 не использует его автоматически.

Controlled Visual Regeneration v1 создает draft prompt architecture, backup metadata и approval/apply guardrails. Реальная генерация файла должна быть следующим контролируемым этапом или отдельным approved draft flow.

## Commands

```bash
npm run visual:regen:drafts:dry
npm run visual:regen:drafts:create
npm run visual:regen:drafts:status
npm run visual:regen:apply:dry
npm run visual:regen:apply -- --draft-id=<id>
```

## Admin/API

Read-only status endpoint:

```text
GET /api/admin/visual-regeneration/status
```

Review-only endpoint:

```text
POST /api/admin/visual-regeneration/review
```

Body:

```json
{
  "draftId": "visual_draft_...",
  "action": "approve",
  "note": "manual review note"
}
```

Allowed actions: `approve`, `reject`, `needs_changes`.

`/admin/visual-quality` показывает блок Controlled Visual Regeneration с draft id, post id, prompts, scores, backup path and apply safety status. UI не содержит Apply, Publish, Send, Publish all или GitHub Actions controls.

## Safety

These commands do not run Telegram real send, do not trigger GitHub Actions, do not change `publish-scheduler.yml`, do not switch production to Supabase, and do not commit `.env.local` or secrets.
