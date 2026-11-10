# Security Plan

**Status: planning only.** The present prototype has no server-side accounts or backend. Its local account flow is only a navigation preview: it derives a salted PBKDF2 verifier in the browser and stores the verifier in `localStorage`. It does not verify email ownership, sync accounts, or protect real financial data. Browser storage is user-editable and accessible to same-origin scripts; never use it for production credentials or sensitive financial account data.

## Baseline requirements for backend work

- Hash passwords using a modern password-hashing scheme and appropriate parameters; never log or store raw passwords.
- Implement password recovery only through a verified email flow with short-lived, single-use, securely stored reset tokens and generic responses that prevent account enumeration.
- Use secure, HTTP-only, same-site cookies or a carefully designed token approach; define CSRF, refresh, revocation, and session expiry behavior.
- Require server-side authorization for every user-owned object and administrative action; default to least privilege.
- Validate and normalize inputs at the API boundary; use parameterized database access and safe output handling.
- Rate-limit authentication and abuse-prone operations; use generic recovery responses to avoid account enumeration.
- Keep API keys, provider tokens, and signing secrets in managed server-side secret storage; support rotation and redaction.
- Enforce TLS in deployment, secure cookie settings, restrictive CORS, security headers, request/body limits, and dependency updates.
- Encrypt integration credentials using an appropriate key-management design; do not store broker passwords as ordinary plaintext.
- Record security-relevant audit events with limited, redacted fields and controlled retention.
- Define data export/deletion, retention, backup protection, and recovery procedures before production.

## External data and file handling

Treat provider responses, imported statements, Telegram content, and uploaded files as untrusted. Validate schemas, enforce size/type limits, protect against injection and malicious files, and avoid embedding raw external HTML. Restrict attachment access to authorized users.

## Financial safeguards

No real-money execution is enabled. Any future execution capability requires a separate explicit milestone, regulatory review, demo testing, explicit user authorization, configured limits, duplicate/stale request protections, auditability, and emergency disable controls.

## Release security work

Before production, establish a threat model, security testing approach, dependency review, secret scanning, incident response contacts, backup/restore drills, and an access review. These are not yet performed.
