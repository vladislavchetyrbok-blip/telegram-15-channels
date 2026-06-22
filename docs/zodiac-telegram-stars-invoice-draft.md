# Telegram Stars Invoice Draft Builder

This document outlines the local Telegram Stars Invoice Draft Builder constructed in Package 132. It enables us to safely prototype and verify the expected payload shape locally before wiring up any live APIs or webhooks.

## Purpose
The Draft Builder provides a deterministic mechanism for visualizing what `sendInvoice` will transmit. It ensures that the required structure (currency, token omission, static values) is perfectly aligned with Telegram Stars specifications without ever making an external network request.

## Safety Controls
- **`liveSendAllowed`** is strictly `false`.
- **`providerTokenMode`** is hardcoded to `omitted-for-stars`, which is the explicit requirement for Telegram Stars (`XTR`).
- **`currency`** is hardcoded to `XTR`.
- **`requiresOwnerApprovalBeforeSend`** is `true`, forcing an explicit owner review before this data can be handed off to a live bot script.

## Payload Determinism
The `payload` field in the invoice is deterministically formatted:
`{productCode}::{userRef}::{draftVersion}`

This guarantees that when the future `successful_payment` hook fires, the backend can deterministically parse and route the entitlement to the correct user for the correct product.

## Blocked Future Steps
- Sending the live invoice is blocked until Owner Approval and Webhook deployment.
- Handling `pre_checkout_query` is blocked.
- Handling `successful_payment` is blocked.
- Granting VIP access via entitlement creation is blocked.
