# Zodiac VIP Preview Shell

## Overview
The VIP Preview Shell provides a static boundary to showcase upcoming premium features without implementing real payment or access logic. This allows users to see what's coming and interact with a mock interface while protecting the live automation and database.

## Protected Automation Rules
- **No real payment**: Transactions are simulated or disabled entirely.
- **No real unlock**: Premium features cannot be accessed.
- **No subscription state**: User subscription tier is not tracked.
- **No database write**: No profile or transaction records are saved.
- **No Telegram API call**: No bot interactions occur from this route.
- **No production Telegram delivery change**: Live channel posts are untouched.
- **No workflow/cron/publish script changes**: Automation scripts remain locked.

## Future VIP Features
- Extended Birth Matrix interpretation
- Deeper Mystic Numbers interpretation
- Personalized affirmations pack
- Compatibility expansion
- Relationship map
- Lunar calendar insights
- Saved personal profile
- Private daily guidance

## Implementation Phasing
The `vip-preview` page exists as a safe static entry point.
Before VIP logic can be made real, the following dependencies must be resolved:
1. Design entitlement model.
2. Design payment boundary.
3. Design profile storage.
4. Design privacy and refund/access rules.
Only after that, implement real VIP logic in a separate package.
