# Zodiac Profile Sync Readiness

Package 38 adds a disabled-by-default backend foundation for future Profile /
History / Favorites / Saved readings sync across devices.

This package does not enable remote sync for users.

## Current State

- API route exists: `GET|POST|DELETE /api/zodiac/profile/sync`
- Telegram auth required: `Authorization: tma <initData>`
- Server validation: `validateTelegramWebAppInitData`
- Profile sync enabled: NO
- Read sync enabled: NO
- Write sync enabled: NO
- Backend storage: `none`
- Frontend `ProfileSyncProvider`: not implemented
- Existing localStorage retention: unchanged

## Feature Flags

Default values:

```text
ZODIAC_PROFILE_SYNC_ENABLED=false
ZODIAC_PROFILE_SYNC_BACKEND=none
ZODIAC_PROFILE_SYNC_READ_ENABLED=false
ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
```

Supported future backend names:

```text
none
vercel_kv
supabase
```

No Redis, Vercel KV, or Supabase writes are active in Package 38.

## Safe Sync Schema

Only safe summary fields are allowed:

```ts
{
  syncVersion: 1,
  history: [
    {
      id: string,
      featureKey: string,
      section?: string,
      sign?: string,
      firstSign?: string,
      secondSign?: string,
      mode?: string,
      tier?: string,
      scoreTier?: string,
      label: string,
      timestamp: string
    }
  ],
  favorites: [],
  updatedAt: string
}
```

Arrays are clamped to `10` items. Unknown fields are stripped and reported by
the sanitizer.

## Blocked Fields

Never sync, store remotely, log, or send to analytics:

- raw `initData`
- `initDataUnsafe`
- names
- birth date
- birth time
- city, city id, or city query
- raw question
- raw intention
- raw feedback
- raw result text
- generated message text
- raw Telegram user JSON

## Disabled API Behavior

The route requires valid Telegram auth first. With valid auth and default flags:

```json
GET -> { "ok": false, "status": "disabled" }
POST -> { "ok": false, "status": "disabled", "stored": false }
DELETE -> { "ok": false, "status": "disabled", "deleted": false }
```

`POST` does not read or persist the request body while sync is disabled.

Invalid or missing auth returns a safe auth error and does not reveal user data,
raw `initData`, or bot token details.

## Check Command

```bash
npm run zodiac:profile-sync:check
```

The check uses fake deterministic Telegram auth data only. It verifies:

- default flags are disabled;
- sanitizer strips unknown fields;
- raw birth date, birth time, city, question, intention, feedback, result text,
  and raw initData are not preserved;
- disabled route does not store data;
- invalid Telegram auth is rejected;
- valid fake auth with disabled flags still returns disabled/no-write.

## Future Rollout Phases

1. Routes disabled: current state.
2. Read-only remote profile endpoint for an internal test user.
3. Write-enabled controlled cohort with explicit storage backend.
4. Frontend `ProfileSyncProvider` with localStorage fallback.
5. Conflict/merge testing across two phones and Telegram desktop.

Preferred backend order:

1. Vercel KV / Redis-like REST storage for simple key-value profiles.
2. Supabase later if relational profile history, audit rows, or admin tooling are
   needed.

Do not enable profile sync until real phone Telegram WebView QA is clean and the
storage backend has a privacy review.
