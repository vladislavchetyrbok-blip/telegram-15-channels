# Aphrodite Platform / Telegram 15 Channels / Zodiac Mini App Guidelines

## 1. Project-Specific Priorities
- **Primary Goal:** Focus strictly on developing the Next.js / TypeScript dashboard, Telegram Bot API integrations, and the Zodiac Mini App.
- **Workflow Focus:** Manage the Aphrodite Channel Registry, Telegram 15 Channels, Daily/Weekly Zodiac Publishing, Channel Statuses, Schedules, Content Approval Workflows, and Package Reviews.
- **Quality Assurance:** Prioritize strict `build`, `lint`, and `typecheck` fixes. Always verify local UI changes via the browser. Read `implementation_plan.md` carefully before execution.

## 2. Core Web Development Stack
Use and prioritize the following technologies:
- Next.js (App Router), React, TypeScript, JavaScript, Node.js, npm, pnpm.
- REST API, API Routes, and Server Actions for backend logic.
- ESLint, Prettier, JSON, Zod for code quality and validation.

## 3. UI / Frontend / Design
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI.
- **Icons:** Lucide Icons.
- **Design Principles:** Mobile-first UI, Responsive Design, Dark Mode UI, Dashboard UI, Admin Panel UI.
- **State Management:** Implement robust Component Architecture with well-defined Empty States, Loading States, and Error States. Design Systems should be respected.
- **Review:** Perform rigorous Visual QA, UI/UX Review, and Accessibility (a11y) checks.

## 4. Browser Automation & QA
- Focus on Browser Automation, Chrome Browser Automation, Chrome DevTools, Playwright, E2E Testing, UI Testing, and Visual Regression Testing.
- Use Chrome DevTools for Console Error Checking and Network Request Debugging.
- Prioritize Localhost Testing over relying solely on static code analysis. Use Lighthouse and Responsive Testing. Use QA Checklists.

## 5. Database & Backend
- **Stack:** Prisma, PostgreSQL, SQLite.
- **Focus:** Data Modeling, Database Schema, Database Migrations, Seed Scripts.
- **Architecture:** Robust Backend Architecture with strict Validation, Logging, Error Handling, and Rate Limiting.
- **Security:** Strict Environment Variables and Secrets Management.

## 6. Telegram / Mini Apps / Publishing
- **Integrations:** Telegram Bot API, Telegram Mini Apps, Telegram WebApp SDK, Telegram Channels, Webhooks, Telegram Inline Buttons, Telegram Payments, Telegram Analytics.
- **Automation:** Telegram Publishing Automation, Content Automation, Social Media Automation, Channel Management.
- **Logic:** Scheduling, Cron Jobs, Content Pipelines, Duplicate Prevention, Publishing Ledger.

## 7. Git / GitHub / CI-CD
- **Workflows:** Git, GitHub, GitHub Actions, CI/CD.
- **Review:** Pull Request Review, Code Review, Commit Strategy.
- **Debugging:** Build Debugging, Typecheck Debugging, Deployment Debugging.
- **Documentation:** Release Notes, Changelog.

## 8. Hosting & Deployment
- **Hosting:** Vercel, Vercel Deployment, Vercel Logs.
- **Environments:** Production Build, Preview Deployment, Environment Configuration, Domain Configuration.
- **Ops:** Performance Optimization, Monitoring.

## 9. Product / Content / Localization
- **Management:** Product Management, SaaS Dashboard, Admin Dashboard, Content Management System, CMS Architecture.
- **Content Types:** Astrology Content, Zodiac Content, Horoscope Content.
- **Localization:** Russian Language Content, Ukrainian Language Content, English Language Content.
- **Metrics:** SEO, Analytics, User Retention, Subscription UX, Monetization.

## 10. Deprioritized / Excluded Domains
- **IGNORE ALL Science plugins and skills.**
- Do NOT use or suggest AlphaFold, AlphaGenome, ChEMBL, Clinical Trials, ClinVar, dbSNP, EMBL-EBI, Genomics, Bioinformatics, Chemistry database skills, Medical research skills, or Protein structure skills. 
- Exception: do not delete them from the global config, but actively ignore them in the context of the Aphrodite/Zodiac/Next.js project to avoid cluttering context.

## 11. Browser Settings / Actuation Rules
- **Browser JavaScript Execution Policy:** `Enabled / Allow`
- **Browser Actuation Rules (Allowed URLs):**
  - `http://localhost:3000/*`
  - `http://127.0.0.1:3000/*`
- **Goal:** Agents must actively check live pages via localhost during development and verification, rather than blindly approving based on local file links.

## 12. Final Goal Reminder
Always strive to be maximally useful for:
- Developing the Next.js / TypeScript project.
- Verifying UI in the browser directly.
- Fixing build / lint / typecheck errors.
- Working with Telegram Bot API and Telegram Mini Apps.
- Managing the Aphrodite system.
- Checking Package 70 and future packages.
- Working with dashboards, channels, schedules, publications, and content automation.
