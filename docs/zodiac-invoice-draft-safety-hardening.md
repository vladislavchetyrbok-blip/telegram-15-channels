# Zodiac Invoice Draft Safety Hardening

This document outlines the safety hardening layer for Telegram Stars payments in the Aphrodite Platform.

## Purpose

The safety hardening module acts as an ironclad gateway simulation that intercepts mock API calls to prevent any accidental live execution. Since the system is actively preventing real `sendInvoice` and `answerPreCheckoutQuery` dispatches, this layer intercepts the payload and strictly denies access while mimicking the signature of real Telegram API functions.

## Interception Logic

### `sendInvoice` Gateway

Before a payload reaches any dispatcher, it is wrapped by `simulateSendInvoiceBoundary`. This function:
1. Re-verifies `isStarsInvoiceDraftSafeForLiveSend` (which rigidly returns false).
2. Verifies `currency === "XTR"`.
3. Verifies `providerTokenMode === "omitted-for-stars"`.
4. Returns a simulated API gateway response showing it was intentionally intercepted and rejecting with `"LIVE_SEND_NOT_ALLOWED"`.

### `answerPreCheckoutQuery` Gateway

Since no live payments are processed, no webhook can legally answer a pre-checkout query. The `simulateAnswerPreCheckoutQueryBoundary` strictly rejects any incoming query requests with `"LIVE_SEND_NOT_ALLOWED"`.

## Next Steps

With the prototype gate, safety review, invoice draft builder, and safety hardening complete, the system is prepared to request **Owner Review**.
