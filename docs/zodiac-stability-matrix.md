# Zodiac Stability Matrix

## Description
The Zodiac Stability Matrix is a diagnostic read-only control page (`/dashboard/networks/zodiac/stability`). It protects the already-working daily/weekly automation and provides a health check baseline.

## Constraints & Rules
- **Package 100 is read-only.**
- **Package 100 does not alter daily automation.**
- **Package 100 does not alter cron/workflows/publish scripts.**
- **Package 100 is a stability baseline before new features.**
- `production:safety:check` may remain locked due to expected missing live env variables.

The matrix clearly shows what components are protected, ensuring no future package silently modifies the core scheduling scripts, ledger, or database configurations without proper oversight.
