# Zodiac Telegram Platform Dashboard Auth

Date: 2026-06-20
Package: 64
Route: `/dashboard/login`

This document describes the owner dashboard auth gate. It does not enable live
publish, weekly live, payments/Stars, profile sync, exact astrology claims,
server-side platform writes, or manual ledger edits.

## What Was Added

- Login route: `/dashboard/login`
- Login API: `POST /api/dashboard/auth/login`
- Logout API: `POST /api/dashboard/auth/logout`
- Read-only auth status API: `GET /api/dashboard/auth/status`
- Route-level guard for `/dashboard` and `/dashboard/networks/zodiac/*`
- httpOnly dashboard session cookie with a 12-hour expiry
- Security page auth status cards
- Conditional logout button when auth is enabled and the browser has a session

## Environment Contract

Set these variables in production. Do not commit values to the repository.

```text
ZODIAC_DASHBOARD_AUTH_ENABLED=true
ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256=<sha256 hash only>
ZODIAC_DASHBOARD_SESSION_SECRET=<random secret>
```

Local/dev can leave `ZODIAC_DASHBOARD_AUTH_ENABLED` unset or `false`. In that
mode the dashboard remains accessible and the Security page shows a warning.

If auth is enabled but the hash or secret is missing, protected dashboard routes
fail closed and redirect to `/dashboard/login?error=config`.

## Generate The SHA-256 Hash

PowerShell example:

```powershell
$pass = Read-Host -AsSecureString "Dashboard passcode"
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
try {
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $bytes = [Text.Encoding]::UTF8.GetBytes($plain)
  $hash = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
  -join ($hash | ForEach-Object { $_.ToString("x2") })
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}
```

Node example:

```bash
node -e "const crypto=require('crypto'); const p=process.argv[1]; console.log(crypto.createHash('sha256').update(p,'utf8').digest('hex'))" "your-passcode"
```

Use the output as `ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256`. Do not store the raw
passcode in `.env.local`, docs, scripts, or commits.

## Vercel Setup

1. Open the Vercel project settings.
2. Add the three `ZODIAC_DASHBOARD_*` variables for Production.
3. Use a long random `ZODIAC_DASHBOARD_SESSION_SECRET`.
4. Redeploy the project.
5. Open `/dashboard/networks/zodiac/security` and confirm:
   - `Dashboard auth: enabled`
   - `Auth configured: yes`
   - `Session cookie: local browser only`

Production recommendation: enable this auth gate before widening beyond trusted
local/internal access.

## Session Cookie Behavior

- Cookie name: `zodiac_dashboard_session`
- httpOnly: yes
- sameSite: lax
- secure: yes in production runtime
- max age: 12 hours
- payload: signed expiry metadata only

The cookie stores no Telegram `initData`, no raw birth data, no question,
intention, result text, phone, email, city, or user profile data.

## Limitations

- This is not full RBAC.
- Roles on the Security page are still planned/readiness-only.
- This is not a replacement for future authenticated admin backend, audit log,
  role checks, or approval workflow.
- It does not create a persistent server-side write API.
- It does not authorize live publish, weekly live, payments/Stars, profile sync,
  exact astro, or mass launch.

## Emergency Recovery

If the owner is locked out:

1. Set `ZODIAC_DASHBOARD_AUTH_ENABLED=false`.
2. Redeploy.
3. Open the dashboard and correct the hash/secret.
4. Rotate `ZODIAC_DASHBOARD_SESSION_SECRET`.
5. Re-enable auth and redeploy.

Rotating the session secret invalidates existing dashboard sessions.

## QA

Run:

```bash
npm run zodiac:dashboard:auth:check
npm run zodiac:dashboard:qa
```

The auth check uses a test-only passcode generated inside the script. It must not
print real env values or mutate env files.
