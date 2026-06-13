# CONTROLLED DEPENDENCY UPGRADE PLAN

## 1. Current Dependency Status
- **Node Version**: v24.15.0
- **npm Version**: 11.12.1
- **Next.js**: 14.2.35
- **React / React-DOM**: 18.3.1
- **PostCSS**: 8.5.15
- **ESLint**: 8.57.1
- **TypeScript**: 5.9.3

### Vulnerabilities Found
The `npm audit --omit=dev` scan reported **2 vulnerabilities**:
1. **Next.js (High Severity)**: Multiple vulnerabilities including DoS via Image Optimizer remotePatterns, HTTP request smuggling in rewrites, unbounded next/image disk cache growth, cache poisoning, and Server Components DoS. 
2. **PostCSS (Moderate Severity)**: XSS via unescaped `</style>` in CSS stringify output. (Note: currently `postcss` is installed at 8.5.15 at the top level which satisfies `<8.5.10` vulnerability check, but `next` depends on vulnerable internal versions).

## 2. Why NOT to run `npm audit fix --force`
Running `npm audit fix --force` is strictly prohibited because:
- **Major Next.js Upgrade (Next 16)**: `npm audit fix --force` will forcefully install `next@16.2.9`.
- **Breaking Changes**: Moving from Next 14 to Next 16 introduces breaking changes in routing, caching, and Server Components.
- **React Compatibility**: Next 16 might require React 19, which can break existing hooks and UI libraries.
- **Build/Runtime Risk**: An unverified forced upgrade can completely break the application runtime and automated publishing scheduler. 

## 3. Recommended Upgrade Strategy
To safely address vulnerabilities without breaking the production pipeline, we should follow a structured, phased approach:

- **Phase A: Backup & Clean Git State**
  Ensure the working directory is clean and a fresh snapshot of the database/repository exists.
- **Phase B: Safe Incremental Upgrade (If applicable)**
  Attempt to update `next` to the latest patch/minor version within the `14.x` or `15.x` line before jumping to `16.x` to see if backported security patches exist.
- **Phase C: Build & Safety Checks**
  Run `npm run build`, `npm run lint`, and `npm run production:safety:check` to ensure no immediate breakage.
- **Phase D: Next 15/16 Migration (Isolated)**
  If a major version upgrade is unavoidable to resolve the vulnerabilities, it must be done in isolation with a thorough reading of the Next.js migration guide.
- **Phase E: React 19 Migration**
  Only update React if required by Next.js, and verify all UI components (Lucide React, Tailwind) compatibility.
- **Phase F: ESLint / TypeScript Upgrades**
  Upgrade dev tools separately to prevent mixed runtime/build errors.

## 4. Exact Proposed Commands for Future Apply Task
*(Do NOT execute these now. For future reference only).*

### Safe Upgrade Variant (Try patching without major bumps)
```bash
# Update within allowed ranges in package.json
npm update next react react-dom postcss
npm run build
npm run lint
npm run production:safety:check
```

### Major Upgrade Variant (If patching fails)
```bash
# Explicitly install the latest major versions
npm install next@latest react@latest react-dom@latest
npm install postcss@latest --save-exact
npm run build
npm run lint
npm run production:safety:check
```

## 5. Risk Matrix
| Package | Risk Level | Potential Breakage |
|---------|-----------|--------------------|
| **Next.js** | **High** | App Router, Caching, Middleware, Image Optimization, API routes (Supabase connectivity). |
| **React** | **High** | Client components, Hooks behavior, Third-party component libraries. |
| **PostCSS** | **Medium** | Tailwind CSS compilation, styling output. |
| **ESLint** | **Low** | Linting rules might become stricter, requiring code formatting updates. |
| **TypeScript** | **Low** | Stricter type checking might throw new compile-time errors. |

## 6. Rollback Plan
If any step of the upgrade breaks the build or runtime safety checks:
1. Revert dependency files:
   ```bash
   git restore package.json package-lock.json
   ```
2. Clean and reinstall previous dependencies:
   ```bash
   rm -rf node_modules
   npm ci
   ```
3. Revert any code changes made to accommodate the upgrade:
   ```bash
   git checkout .
   ```

## 7. Production Impact
- **Publishing Status**: Production/autopublish is currently **disabled** (`safeForScheduledPublishing: false`).
- The upgrade process must **not** involve turning on the publishing scheduler.
- After a successful upgrade, a full **dry-run check** (`npm run db:mirror:sync:dry` and `npm run production:safety:check`) is mandatory before even considering re-enabling production.

## 8. Explicit Confirmations
- [x] Package files (`package.json`, `package-lock.json`) were **not** changed.
- [x] No `npm install` or `npm update` was performed.
- [x] No `npm audit fix` was performed.
- [x] No live publishing was triggered.
- [x] No Supabase writes or migrations were performed.
- [x] Environment files (`.env`, `.env.local`) were **not** changed.
- [x] `docs/IMAGE_BATCH_LEO_7_PROMPTS.md` was **not** touched.
