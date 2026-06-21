# Telegram Mini App Payment Provider Matrix

## Overview
This document outlines the payment provider options evaluated for the Zodiac Mini App monetization strategy.

## Payment Providers Evaluated

### 1. Telegram Stars (Native API)
The native in-app currency for the Telegram ecosystem.
- **Type**: In-App Currency
- **Complexity**: Low
- **Fees**: High (~30% due to Apple/Google ecosystem rules)
- **Recommendation**: **Primary option** for low-ticket digital horoscopes. Mandatory for compliance if selling digital goods inside iOS Mini Apps.

### 2. Stripe
Standard fiat payment gateway.
- **Type**: Fiat Gateway
- **Complexity**: Medium
- **Fees**: Low (2.9% + 30¢)
- **Recommendation**: Fallback / Web-only flow. Using this inside an iOS Mini App to sell digital goods risks a ban from Apple.

### 3. Crypto (TON)
Native cryptocurrency for Telegram.
- **Type**: Cryptocurrency
- **Complexity**: High
- **Fees**: Very Low
- **Recommendation**: Optional alternative checkout. High friction for non-crypto natives but extremely efficient for native users.

## Package Scope (Package 118)
- This is a **decision matrix documentation** package.
- **No active SDKs** (Stripe, TON, or Telegram Pay) are installed or active.
- The Mini App remains safely in a mock state without payment capabilities.
