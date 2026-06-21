# Zodiac Template Refinement Workbench

The **Zodiac Template Refinement Workbench** is an Aphrodite dashboard feature designed for safely managing, auditing, and refining the structure and content of Zodiac posts before they are integrated into the daily publishing system.

**Location:** `/dashboard/networks/zodiac/template-refinement`

## Goals
- **Safety First:** Improve template variations without touching the live Telegram API or existing production tokens.
- **Tone and Structure:** Provide a visual interface to see how different signs are treated, what CTAs are used, and how introductions are structured.
- **Reduce Repetition:** Maintain libraries of introductory phrases, CTA phrases (Mini App hooks), and sign-specific logic to ensure variety and engagement over time without triggering "spam" impressions.

## Core Features
1. **Status Cards:** Quick overview of the available structure templates and CTA hooks.
2. **Post Structure Diagram:** A visual outline of how a standard Zodiac post is constructed (Introduction -> Sign specific body -> Universal CTA -> Tags).
3. **Template Libraries:**
   - **Introductions:** Sets of opening sentences to set the mood (e.g. morning vs evening, energetic vs calm).
   - **Call-to-Actions (CTAs):** Safe hooks directing users to the Telegram Mini App or urging subscriptions, avoiding pushy or guaranteed language.
4. **Sign Differentiation:** A reference guide ensuring each sign gets distinct, personalized characteristics rather than generic astrology filler.

## Integration with Aphrodite
This page is part of the Zodiac Dashboard group and does not modify `generate-zodiac-plan.mjs` directly. Instead, it serves as a "workbench" for editors and administrators to establish best practices, which are then manually or semi-automatically transferred into the live generation logic (`zodiac-channel-profiles.ts`).

## Security
- Fully protected by the Aphrodite login system (`/login`).
- Read-only visual tool: performs zero database writes and zero Telegram API calls.
