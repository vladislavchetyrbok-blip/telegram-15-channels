# Zodiac Telegram WebApp initData Auth Foundation

Package 37 adds a server-side foundation for validating Telegram Mini App
`initData`. It is authentication readiness only. It does not enable profile
sync, remote profile storage, payments, Telegram Stars, or any live publishing.

## Current State

- Validation utility: `lib/zodiac-telegram-auth.ts`
- Safe route: `POST /api/zodiac/telegram-auth/check`
- Self-check command: `npm run zodiac:telegram-auth:check`
- Profile sync: OFF and not implemented
- Remote profile storage: not implemented
- Redis/Supabase/Vercel KV profile storage: not added

The Mini App must not trust `window.Telegram.WebApp.initDataUnsafe` as identity.
Client-provided Telegram user ids are informational until the server validates
`initData` with the bot token.

## Validation Rules

`validateTelegramWebAppInitData` validates:

- `initData` is present and parseable as a query string.
- `hash` exists and is a 64-character hex HMAC.
- `auth_date` exists and is a safe Unix timestamp.
- `auth_date` is not older than the configured maximum age.
- The data-check string is built from all fields except `hash`, sorted by key.
- The Telegram WebApp HMAC chain is used:
  - secret key: `HMAC_SHA256(botToken, "WebAppData")`
  - expected hash: `HMAC_SHA256(data_check_string, secret)`
- Hash comparison uses `timingSafeEqual`.
- `user` JSON is parsed only after the hash is valid.

Default max age:

```text
24 hours / 86400 seconds
```

## Safe Route

`POST /api/zodiac/telegram-auth/check` accepts:

```text
Authorization: tma <initData>
```

It returns only safe status fields:

- `ok`
- `status`
- `hasUser`
- masked Telegram user id, only when valid
- `authDate`
- `languageCode`

It does not return raw `initData`, raw Telegram user JSON, names, tokens, or
personal Mini App inputs.

## Forbidden Data

Never store, log, or send to analytics:

- raw `initData`
- bot token
- raw Telegram user JSON
- names
- birth date
- birth time
- city or city query
- raw question
- raw intention
- raw result text
- raw generated messages

## Profile Sync Flags

Future sync remains disabled by policy:

```text
ZODIAC_PROFILE_SYNC_ENABLED=false
ZODIAC_PROFILE_SYNC_BACKEND=none
ZODIAC_PROFILE_SYNC_READ_ENABLED=false
ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
```

The current type stub is `lib/zodiac-profile-sync-types.ts`. It is documentation
and compile-time shape only. It does not create endpoints, storage adapters,
background jobs, or read/write sync behavior.

## Checks

Run:

```bash
npm run zodiac:telegram-auth:check
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

The auth check uses a fake deterministic bot token. It must never read or print
the real `TELEGRAM_BOT_TOKEN`.

Expected auth self-check cases:

- valid fake initData: PASS
- tampered user id: `invalid_hash`
- missing hash: `malformed`
- expired `auth_date`: `expired`
- missing bot token: `bot_token_missing`
- malformed input: safe failure, no throw
- malformed user JSON after valid hash: safe failure
- timing-safe compare path: no throw

## Future Activation Gates

Do not add profile sync until all are true:

1. Real phone Telegram WebView pass is clean.
2. Server-side initData validation is used for every identity-dependent action.
3. Storage choice is explicitly approved.
4. Privacy rules for profile fields are reviewed.
5. Read/write sync endpoints are designed and tested separately.
6. Analytics remains aggregate-safe and never receives raw profile data.

Payments, Stars, weekly live, and profile sync require separate explicit
approval packages.
