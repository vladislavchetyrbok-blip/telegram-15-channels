# SUPABASE / JSON RECONCILIATION AUDIT

## 1. Current Safety Status
- **Queue status:** Clean (`scheduledPostsCount: 0`, `readyPostsCount: 0`, `nextDuePost: null`).
- **Production Blocked:** Yes. `safeForScheduledPublishing=false` due to Store Compare mismatch.
- **Remaining Warnings:**
  - `JSON and Supabase IDs do not match.`
  - 6 warnings about orphaned publication logs referencing `weekly-2026-05-31-02-ai-technologies-02` (which is not present in local posts).
  - `Supabase mirror contains extra IDs. Insert-only sync will not delete them.`

## 2. Local JSON/Store Status
- **Location:** Local state is spread across `data/runtime/` (`weekly-content-plan.json` for posts, `publication_logs.json` for logs).
- **Post Counts:** Локально числится 121 пост.
- **Cancelled Posts:** 90 постов локально находятся в статусе `cancelled`.
- **Scheduled Posts:** 0 (все обезврежены).

## 3. Supabase / Export Status
- **Location:** Последний бекап Supabase лежит в `data/backups/latest-supabase-export/`.
- **Export Date:** Последнее обновление было `2026-06-04 21:15:43`.
- **Records in Export:** Из файла можно увидеть, что там примерно 121 пост, 10 логов публикаций и 1 запуск шедулера (по данным `db:store:compare`).

## 4. Missing in Supabase (8 записей)
На стороне Supabase **отсутствует 8 локальных записей**, которые появились с 4 июня:
- **7 записей в `publication_logs`**:
  - `02bb3c89-6d31-4c1c-b808-970c3c2386ed`
  - `086a20fd-5335-4f0d-80bd-490a86d93978`
  - `6b96d345-2b1d-49f9-8e6a-ccb776655c29`
  - `74d10fa0-3a87-4ec9-b91d-dc95c6678a48`
  - `a1dc9664-f7de-429c-93b0-91d7e8dfbe73`
  - `a6018a29-dc5b-4fb7-8ee7-f9092f3f5cb4`
  - `befc8e3d-11ce-45e4-8c7f-34543cd7be79`
- **1 запись в `scheduler_runs`**:
  - `cca3f826-292a-4d5b-8b82-1ed15ddd4b80`

Это логи о недавних запусках/тестах, которые еще не были синхронизированы в базу.

## 5. Extra in Supabase (1 запись)
На стороне Supabase есть **1 лишняя запись**, которой нет локально:
- **Таблица `scheduler_runs`:** ID `f4bebafb-418a-4669-905b-4f1657508ee3`.
- Данной записи нет в локальном `JSON`.
- **Рекомендация:** Так как синхронизация insert-only, этот лог не мешает данным. Но для идеальной консистентности (чтобы safety check проходил без предупреждений), его следует физически удалить из таблицы `scheduler_runs` в Supabase (потребует прямого SQL или API вызова), либо временно смириться с warning.

## 6. Publication Logs Mismatch
- **ID:** `weekly-2026-05-31-02-ai-technologies-02`
- **Где найден:** Упоминается 6 раз в `data/runtime/publication_logs.json` (и в `autopublish.json`).
- **Есть ли local post:** Нет, пост физически не существует.
- **Есть ли Supabase record:** Нет, в `latest-supabase-export` он также отсутствует.
- **Безопасная стратегия (Рекомендация):** Удалить эти 6 orphaned logs (записей-сирот) из локального `publication_logs.json`, так как они ссылаются на несуществующий тестовый или удаленный пост и засоряют safety check.

## 7. Recommended Reconciliation Plan
Предлагается следующий безопасный план действий:
- **Phase A:** Удалить 6 записей-сирот (orphaned logs), ссылающихся на `weekly-2026-05-31-02-ai-technologies-02`, из локального файла `data/runtime/publication_logs.json`.
- **Phase B:** Удалить 1 лишний `scheduler_run` (`f4bebafb...`) из Supabase (если доступен SQL-клиент или API), ИЛИ оставить его, но игнорировать этот warning в будущем.
- **Phase C:** Выполнить dry-run синхронизации (`npm run db:mirror:sync:dry`), чтобы убедиться, что 8 недостающих логов готовы к отправке.
- **Phase D:** Получить финальный аппрув на запись (Codex Audit).
- **Phase E:** Выполнить реальную синхронизацию (`npm run db:mirror:sync:apply`), чтобы выгрузить 8 логов в Supabase.
- **Phase F:** Выполнить повторный `npm run production:safety:check` — он должен вернуть 0 errors и 0 warnings. Сделать свежий экспорт базы (`npm run db:mirror:export`).

## 8. Explicit Confirmations
- Supabase writes **не выполнялись**.
- Live publish **не запускался**.
- Cron/scheduler **не включался**.
- Env-переменные / Secrets **не выводились**.
- Файлы `.env` и `.env.local` **не изменялись**.
- Leo prompt (`docs/IMAGE_BATCH_LEO_7_PROMPTS.md`) **остался нетронутым**.
