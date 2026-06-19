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
- Storage adapter readiness: implemented, production adapters not wired
- Test-memory adapter: check-only
- Frontend sync client scaffold: implemented, disabled by default
- Frontend `ProfileSyncProvider`: not mounted
- Profile UI sync status: visible as disabled/no-network
- Pure merge logic: implemented, not wired to UI
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

Future storage env names:

```text
# Future Redis REST / Vercel KV
ZODIAC_PROFILE_SYNC_REDIS_URL
ZODIAC_PROFILE_SYNC_REDIS_TOKEN

# Future Supabase
ZODIAC_PROFILE_SYNC_SUPABASE_URL
ZODIAC_PROFILE_SYNC_SUPABASE_SERVICE_ROLE_KEY

# Internal check-only memory adapter guard
ZODIAC_PROFILE_SYNC_TEST_MEMORY_ENABLED=false
```

Supported future backend names:

```text
none
vercel_kv
redis_rest
supabase
test_memory
```

No Redis, Vercel KV, Supabase, or production writes are active.

Client-side public flags are only a UX/network guard. Server flags remain the
source of truth for auth, read, write, and backend behavior.

## Profile Sync Storage Status

- Current backend: `none`
- Production reads: OFF
- Production writes: OFF
- Test-memory adapter: check-only
- Remote sync for users: OFF
- Production Redis REST / Vercel KV adapter: not wired
- Production Supabase adapter: not wired

Package 41 adds storage readiness and env validation without enabling any
production adapter. Backend behavior:

- `none`: never writes.
- `redis_rest` / `vercel_kv`: require Redis URL and token env presence before
  future use.
- `supabase`: requires Supabase URL and service-role env presence before future
  use.
- `test_memory`: available only in the check script through an explicit
  check-only factory/allow flag.

Production reads require all of:

```text
ZODIAC_PROFILE_SYNC_ENABLED=true
ZODIAC_PROFILE_SYNC_READ_ENABLED=true
backend != none
required env present
```

Production writes require all of:

```text
ZODIAC_PROFILE_SYNC_ENABLED=true
ZODIAC_PROFILE_SYNC_WRITE_ENABLED=true
backend != none
required env present
```

Even when env presence validates, production storage remains fail-closed until a
future package wires and verifies the real backend adapter.

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
- phone or phone number
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

Package 43 strengthens disabled-route privacy checks:

- invalid auth is rejected before payload processing;
- disabled POST does not read or store the request body;
- unavailable backend paths do not read or echo submitted payloads;
- production runtime route cannot use the check-only `test_memory` adapter;
- responses never echo submitted birth date, birth time, city, name, phone,
  question, intention, feedback, result text, or raw `initData`.

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

## Profile Status UI

Package 42 adds an honest status block inside `Мой профиль`:

```text
Синхронизация между устройствами: выключена
История и избранное сейчас сохраняются только на этом устройстве.
```

This is display-only. It has no toggle, no `sync now` button, no mounted
`ProfileSyncProvider`, and no remote GET/POST/DELETE calls while sync flags are
OFF. `npm run zodiac:miniapp:smoke` now fails if `/api/zodiac/profile/sync` is
called during the disabled Profile flow.

## Read-Only Merge Logic

Package 40 adds pure, disabled-by-default merge helpers:

```text
lib/zodiac-profile-sync-merge.ts
lib/zodiac-profile-sync-retention-map.ts
```

The merge utility:

- sanitizes local and remote payloads before merging;
- preserves only safe history/favorites summary fields;
- merges history append-only;
- merges favorites as a deterministic set-like collection;
- dedupes by safe `id`, or by a generated safe key when an item has no safe id;
- keeps the newer timestamp when duplicates conflict;
- sorts newest first;
- clamps history/favorites to the configured max and the global sync max;
- never throws on malformed input;
- reports dropped/clamped/duplicate items and warnings;
- produces a valid `syncVersion: 1` payload with a fresh `updatedAt`.

This logic is not mounted, does not fetch remote data, does not POST/DELETE,
and does not write to remote storage. It exists only for future read-only
rollout tests.

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
- Profile shows disabled sync status without calling `/api/zodiac/profile/sync`;
- merge local-only, remote-only, and local+remote cases;
- duplicate `id` and duplicate safe-key conflict resolution;
- newest timestamp wins;
- max history/favorites clamp behavior;
- malformed merge input does not throw;
- retention-to-sync and sync-to-retention mapping keeps only safe summary
  fields;
- storage backend defaults to `none`;
- storage env validation reports presence only, never values;
- production backend without env fails closed and does not read POST payload;
- test-memory adapter can save/delete sanitized payloads in checks only;
- test-memory adapter strips sensitive fields before save;
- no production storage/network adapter is used during checks;
- raw birth date, birth time, city, name, phone, question, intention, feedback,
  result text, and raw initData are not preserved;
- malicious payload fragments are stripped from labels and safe summaries;
- invalid auth/disabled/backend-unavailable route paths do not read POST bodies
  and do not echo submitted data;
- disabled route does not store data;
- invalid Telegram auth is rejected;
- valid fake auth with disabled flags still returns disabled/no-write.

## Future Rollout Phases

1. Routes disabled: current state.
2. Pure merge utilities: current Package 40 state.
3. Storage readiness and check-only memory adapter: current Package 41 state.
4. Disabled status UI in Profile: current Package 42 state.
5. Privacy stress tests and route hardening: current Package 43 state.
6. Package 44: real astro engine provider fixture harness.
7. Package 45: full safety regression after sync/astro foundations.
8. Future package: read-only remote fetch in test mode for an internal test user.
9. Future package: controlled cohort write with explicit storage backend.
10. Future package: conflict UX/status around `ProfileSyncProvider` with localStorage
   fallback and no automatic overwrite.
11. Conflict/merge testing across two phones and Telegram desktop.

Preferred backend order:

1. Vercel KV / Redis-like REST storage for simple key-value profiles.
2. Supabase later if relational profile history, audit rows, or admin tooling are
   needed.

Do not enable profile sync until real phone Telegram WebView QA is clean and the
storage backend has a privacy review.
