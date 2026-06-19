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
- Frontend sync client scaffold: implemented, disabled by default
- Frontend `ProfileSyncProvider`: not mounted
- Existing localStorage retention: unchanged

## Feature Flags

Default values:

```text
ZODIAC_PROFILE_SYNC_ENABLED=false
ZODIAC_PROFILE_SYNC_BACKEND=none
ZODIAC_PROFILE_SYNC_READ_ENABLED=false
ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_ENABLED=false
NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_READ_ENABLED=false
NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
```

Supported future backend names:

```text
none
vercel_kv
supabase
```

No Redis, Vercel KV, or Supabase writes are active in Package 38.

Client-side public flags are only a UX/network guard. Server flags remain the
source of truth for auth, read, write, and backend behavior.

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

## Frontend Scaffold

Package 39 adds disabled-by-default frontend helpers:

```text
components/zodiac-mini-app/profile-sync-client.ts
components/zodiac-mini-app/useProfileSync.ts
```

The client exposes:

```text
getProfileSyncClientStatus
fetchRemoteProfileIfEnabled
pushRemoteProfileIfEnabled
deleteRemoteProfileIfEnabled
```

Supported client statuses:

```text
disabled
outside_telegram
auth_missing
ready_readonly
ready_write
error
```

Current Package 39 behavior:

- Sync client defaults to `disabled`.
- The hook is available for a future provider, but is not mounted in the Mini
  App.
- No auto-sync loop exists.
- No GET/POST/DELETE is called while public flags are OFF.
- Outside Telegram or without `window.Telegram.WebApp.initData`, no network
  call is made.
- `initDataUnsafe` is not used.
- Raw `initData` is used only as an Authorization header when sync is explicitly
  enabled by future flags; it is not stored, logged, or sent to analytics.
- Push payloads are sanitized before any future network call.
- Clear local data remains local-only.

Remote merge is intentionally not implemented yet. A future package must add a
controlled read-only merge test before write sync can be considered.

## Check Command

```bash
npm run zodiac:profile-sync:check
```

The check uses fake deterministic Telegram auth data only. It verifies:

- default flags are disabled;
- sanitizer strips unknown fields;
- frontend client default status is disabled;
- frontend fetch/push/delete do not call the network while disabled;
- frontend client does not call the network outside Telegram or without
  `initData`;
- raw birth date, birth time, city, question, intention, feedback, result text,
  and raw initData are not preserved;
- disabled route does not store data;
- invalid Telegram auth is rejected;
- valid fake auth with disabled flags still returns disabled/no-write.

## Future Rollout Phases

1. Routes disabled: current state.
2. Read-only remote profile endpoint for an internal test user.
3. Frontend `ProfileSyncProvider` mounted in read-only mode with localStorage
   fallback and no automatic overwrite.
4. Conflict/merge testing across two phones and Telegram desktop.
5. Write-enabled controlled cohort with explicit storage backend.

Preferred backend order:

1. Vercel KV / Redis-like REST storage for simple key-value profiles.
2. Supabase later if relational profile history, audit rows, or admin tooling are
   needed.

Do not enable profile sync until real phone Telegram WebView QA is clean and the
storage backend has a privacy review.
