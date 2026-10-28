# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within KrishiConnect AI, please do not disclose it publicly in GitHub issues.

Please email the project maintainers with details, reproduction steps, and potential impact. We will acknowledge receipt within 48 hours and coordinate a timely patch release.

## Key Security Principles
- **No Private Keys in Client Bundles**: Secrets such as `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `DATA_GOV_IN_API_KEY` are kept strictly server-side in API routes.
- **Row Level Security (RLS)**: Enforced on all Supabase tables so authenticated farmers can never view other farmers' plot coordinates or financial records.
- **Input Validation**: All client inputs to APIs are validated and sanitized.
