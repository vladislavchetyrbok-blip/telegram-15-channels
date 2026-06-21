# Aphrodite Legacy 15 Channels: Restart Plan

This document outlines the strategy for restarting the paused 15-channel legacy network under the Aphrodite platform.

## Background
The network consists of 10 general-topic channels and 5 real estate channels. They have been paused and require an audit, content updates, and a strict phased rollout to ensure quality and safety. Live publishing is strictly disabled until explicit authorization is granted.

## Phased Strategy

### Phase 1: Audit
- Verify access rights and administrator status for all 15 channels.
- Check legacy bot permissions (if applicable) and confirm channels are linked to the dashboard in read-only mode.

### Phase 2: Profiles & Avatars
- Ensure each channel has a localized (RU/UA) description.
- Review and update channel avatars and pinned messages.

### Phase 3: Content Preparation (Studio)
- Generate a minimum of 7 drafts per channel using Aphrodite Studio templates.
- Ensure all content matches the approved categories, languages, and formats.

### Phase 4: Rubrics & CTA Check
- Audit inline buttons and Call-to-Action strings.
- Verify formatting of the generated templates against the initial rubrics.

### Phase 5: Dry-Run
- Publish posts in `dry-run` mode to verify structure and timing without calling the Telegram API.

### Phase 6: Live Approval
- Final step. Requires strict code/token intervention to unblock live publishing for specific test channels.

## Frequency Guidelines
- **General Channels:** 3–5 posts per week.
- **Real Estate Channels:** 3 posts per week.
- **Dnipro Real Estate Channels:** 3–5 posts per week.
- **High-Frequency (AI/Money/Dnipro):** 5 posts per week.

## Safety Directives
- **Dry-run First:** No content leaves the platform without passing the dry-run checklist.
- **Studio Dependency:** All posts must originate from the Studio's queue and be vetted before reaching the channel's specific ledger.
- **No Live API Calls:** `production:safety:check` mandates zero live calls during the preparation phases.
