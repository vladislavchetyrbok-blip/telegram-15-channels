# Zodiac Content Quality Review

## 1. Goal
The primary objective is to maintain strict editorial and technical standards for all auto-generated daily and weekly Zodiac horoscopes. This document serves as the foundation for the Quality Audit UI (`/dashboard/networks/zodiac/content-quality`) and automated linting scripts that may be implemented later.

## 2. Core Quality Guidelines
- **Tone & Voice:** 
  - Horoscopes must maintain a positive, constructive, and supportive tone.
  - Avoid fatalistic, overly negative, or definitive predictive statements.
  - The focus is on guidance, opportunities, and emotional reflection.
- **Variation & Freshness:** 
  - No exact identical phrase repeats within a 7-day rolling window for the same sign.
  - Structural variation (e.g., swapping intro, body, advice formats) is strongly encouraged to prevent AI footprint detection.
- **Safe Formulations:**
  - Medical, financial, or legal advice is strictly forbidden. 
  - Predictions should use words like "possible," "might," "favorable," rather than "will happen," "inevitable."
- **Formatting:**
  - Ensure correct Telegram markdown usage (`**bold**` or `*italic*` where appropriate for the platform).
  - Use appropriate standard emojis (2-4 per post max). 
  - Consistent length: 400-600 characters per daily post.

## 3. Call-To-Action (CTA) Library
To drive user engagement without spamming, CTAs must rotate dynamically across channels.
- **Engagement Prompts:** E.g., "А как вы планируете провести этот вечер? Делитесь в комментариях!"
- **Mini-App Funnel:** E.g., "Получи персональный гороскоп на год в нашем Mini App."
- **Community Sharing:** E.g., "Перешлите этот гороскоп тому, кому он сейчас нужен."
- *Rule:* Do not use the same CTA more than twice a week per channel.

## 4. Technical Constraints
- The quality audit layer is strictly a *read-and-validate* system.
- It evaluates `data/zodiac-daily-plan.json` outputs before they hit the ledger or are published.
- In `dry-run` or validation phases, posts that fail these quality checks must be flagged `REVIEW` or `FAILED`.
- The audit does NOT modify existing live automation or delete ledger history. 

## 5. Next Steps for Content Quality
- Integrate a pre-publish lint check into `scripts/publish-zodiac-dry-run.mjs`.
- Add an LLM-based API hook (optional, when live allowed) to dynamically score text positivity.
