# Windows autostart for Telegram 15 channels

This project runs locally only while the PC is on and both processes are running:

- Next.js server: `npm run dev`
- Autopublish worker: `npm run autopublish:worker`

## Manual start

Open two PowerShell windows:

```powershell
cd G:\telegram-15-channels
npm run dev
```

```powershell
cd G:\telegram-15-channels
npm run autopublish:worker
```

Or run the helper scripts:

```powershell
powershell -ExecutionPolicy Bypass -File G:\telegram-15-channels\scripts\windows\start-dev-server.ps1
powershell -ExecutionPolicy Bypass -File G:\telegram-15-channels\scripts\windows\start-autopublish-worker.ps1
```

## Add to Windows Startup

1. Press `Win + R`.
2. Run `shell:startup`.
3. Create two shortcuts in the opened folder.
4. Shortcut 1 target:

```text
powershell.exe -ExecutionPolicy Bypass -File "G:\telegram-15-channels\scripts\windows\start-dev-server.ps1"
```

5. Shortcut 2 target:

```text
powershell.exe -ExecutionPolicy Bypass -File "G:\telegram-15-channels\scripts\windows\start-autopublish-worker.ps1"
```

## Check status

```powershell
cd G:\telegram-15-channels
npm run autopublish:status
```

You can also open:

```text
http://127.0.0.1:3000/dashboard
```

The dashboard should show that the server and worker are running.

## Stop

Close the two PowerShell windows, or press `Ctrl + C` in each window.

## After PC reboot

If shortcuts were added to Startup, Windows should start both processes after login. Wait 30-60 seconds, then check:

```powershell
cd G:\telegram-15-channels
npm run autopublish:status
```

If the status request fails, start `npm run dev` first, then `npm run autopublish:worker`.
