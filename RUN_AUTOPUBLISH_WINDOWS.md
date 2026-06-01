# Запуск автопубликации на Windows

Автопубликация состоит из двух процессов:

- сайт Next.js с панелью управления;
- worker, который каждые 5 минут вызывает server-side scheduler.

## Команды

Запустить сайт:

```powershell
npm.cmd run dev
```

Запустить worker отдельно:

```powershell
npm.cmd run worker
```

Запустить сайт и worker вместе:

```powershell
npm.cmd run start:all
```

Проверить один scheduler tick без постоянного worker:

```powershell
npm.cmd run check:autopublish
```

Подготовить контент на завтра через API сайта:

```powershell
npm.cmd run prepare:tomorrow
```

Панель управления:

```text
http://localhost:3000/publishing-center
```

Логи:

```text
logs/
data/runtime/autopublish.json
data/runtime/weekly-content-plan.json
data/runtime/autopublish-worker-heartbeat.json
logs/web.log
logs/worker.log
logs/autopublish.log
```

## Безопасность

Worker ничего не отправляет, если `AUTOPUBLISH_ENABLED=false`, включён emergency stop, канал уже получил пост сегодня, пост уже опубликован, картинка не готова, текст слабый/битый, найдена запрещённая валюта или нет Telegram-ready PNG/JPG.

После перезагрузки ПК запустите `npm.cmd run start:all`. Журнал, недельный план, статусы и message_id сохраняются в `data/runtime/`.
