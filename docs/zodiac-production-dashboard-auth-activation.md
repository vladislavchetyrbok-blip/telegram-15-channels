# Zodiac Production Dashboard Auth Activation

This document outlines the steps to activate the passcode layer on the production Vercel dashboard.

> [!WARNING]
> Never commit `.env.local` to the repository.
> Never print or log the plain text password or session secret in terminal/CI.
> If a session secret or password is leaked, rotate them immediately in Vercel.

## 1. Required Environment Variables

The dashboard authentication gate uses the following environment variables:

- `ZODIAC_DASHBOARD_AUTH_ENABLED`
- `ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256`
- `ZODIAC_DASHBOARD_SESSION_SECRET`

## 2. Generate Secrets Locally

You need a strong SHA-256 hash for the password, and a long random string for the session secret.

To generate the SHA-256 hash in Node.js:
```javascript
const crypto = require('crypto');
const password = 'your-strong-password';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
```

To generate a random session secret:
```javascript
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret);
```

## 3. Set Vercel Environment Variables

1. Go to the Vercel Dashboard for the `telegram-15-channels` project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following variables (ensure they are applied to the `Production` environment):
   - `ZODIAC_DASHBOARD_AUTH_ENABLED` = `true`
   - `ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256` = `<your_generated_hash>`
   - `ZODIAC_DASHBOARD_SESSION_SECRET` = `<your_generated_secret>`

## 4. Redeploy Requirement

Environment variables in Next.js require a new deployment to take effect.
1. Go to the **Deployments** tab in Vercel.
2. Click on the latest production deployment and select **Redeploy**.

## 5. Verification Steps

Once redeployed, perform the following checks:
1. Navigate to `https://telegram-15-channels.vercel.app/dashboard/networks/zodiac`.
2. Verify that it **redirects** you to `/dashboard/login`.
3. Try logging in with an incorrect password to ensure it is rejected.
4. Log in with the correct password and verify you are granted a session cookie and can access the dashboard.
5. Check `/dashboard/networks/zodiac/analytics` and ensure it is also protected.

## 6. Rollback

If you need to disable authentication:
1. Go to Vercel **Environment Variables**.
2. Change `ZODIAC_DASHBOARD_AUTH_ENABLED` to `false`.
3. **Redeploy** the application to apply the changes.

## Zodiac OS Naming System (Package 66)

* **Full platform** = Zodiac OS
* **Dashboard/admin** = Zodiac Control
* **Mini App** = Zodiac Mini
