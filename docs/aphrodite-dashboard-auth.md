# Aphrodite Dashboard Auth

This document outlines how authentication works for the Aphrodite dashboard.

## Overview

The dashboard `/dashboard/*` routes are protected using a signed session cookie (`aphrodite_session`). Unauthenticated users are redirected to `/login`.

The system does NOT use an external database or third-party auth providers. Instead, it relies on environment variables.

## Required Environment Variables

You must provide the following variables. Locally, put them in a `.env.local` file (which is ignored by Git). In Vercel, set them in the project's Environment Variables settings.

```env
APHRODITE_ADMIN_LOGIN=your-secure-login
APHRODITE_ADMIN_PASSWORD=your-secure-password
APHRODITE_SESSION_SECRET=a-long-random-string-used-for-signing-cookies
```

**CRITICAL SAFETY RULES:**
- Do NOT hardcode passwords in source code.
- Do NOT commit `.env.local`.
- Live publishing is strictly separated and NOT automatically enabled just by logging in.

## How It Works

1. **Login (`/api/auth/login`)**: The user submits credentials to the login route handler. It validates them against the environment variables. If valid, it generates a session string (`session_<timestamp>`), signs it using Web Crypto HMAC-SHA256 and `APHRODITE_SESSION_SECRET`, and sets an HttpOnly cookie.
2. **Middleware (`middleware.ts`)**: On every request to `/dashboard/*`, the middleware intercepts the request, reads the `aphrodite_session` cookie, verifies the HMAC signature using the secret, checks expiration (7 days), and either allows the request or redirects to `/login`.
3. **Logout (`/api/auth/logout`)**: Clears the cookie and redirects to `/login`.

## Local Development & QA

To test locally without exposing real credentials:
1. Copy `.env.example` to `.env.local`.
2. Change the dummy values to your local test credentials.
3. The `npm run zodiac:dashboard:qa` script will inject its own test credentials to perform automated end-to-end verification. It logs in via the real `/api/auth/login` endpoint using those test credentials and reuses the cookie, ensuring the middleware logic is tested without weakening security.
