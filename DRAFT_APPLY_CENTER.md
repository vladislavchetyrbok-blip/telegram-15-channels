# Manual Draft Apply Center

Manual Draft Apply Center безопасно применяет только approved regeneration drafts к локальному JSON source post.

## Safety rules

- Apply работает только для draft со статусом `approved`, `approved=true` и `applied=false`.
- Перед confirmed apply автоматически создается backup через существующий Backup Center.
- Apply меняет только один JSON source post в `data/runtime/weekly-content-plan.json` и соответствующий draft record в `data/regeneration-drafts/regeneration-drafts.json`.
- Apply не публикует Telegram-пост.
- Apply не запускает GitHub Actions.
- Apply не меняет Supabase напрямую.
- Apply не применяет `draft`, `rejected`, `needs_changes` или уже applied drafts.
- Published source posts не меняются.
- Production flow остается `GitHub Actions -> JSON store -> Telegram`.

## CLI

Проверить состояние apply center:

```bash
npm run content:regen:apply:status
```

Dry-run preview для конкретного draft:

```bash
node scripts/apply-regeneration-draft.mjs --dry-run --draft-id=draft_...
```

Confirmed apply для конкретного approved draft:

```bash
node scripts/apply-regeneration-draft.mjs --apply --confirm-draft-apply --draft-id=draft_...
```

NPM shortcut для confirmed apply:

```bash
npm run content:regen:apply -- --draft-id=draft_...
```

## Admin UI

Открыть:

```text
/admin/draft-apply
```

Страница показывает approved drafts, blocked drafts, applied drafts, latest backup, diff preview, affected fields и apply warnings.

Apply button требует явное подтверждение в UI. Кнопка не публикует пост, не запускает Actions и не пишет в Supabase.

## After Apply

Следующий этап после apply: Preview / Publish Safety. Этот центр не выполняет preview publishing и не запускает публикацию.
