## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.
## 2024-05-24 - Fix predictable default passwords
**Vulnerability:** Default and reset passwords used a predictable pattern (`SC${cedula}#2026`), allowing unauthorized access if an attacker knows a user's ID/cédula.
**Learning:** Default fallback passwords must be cryptographically secure and surfaced clearly in the UI, rather than relying on predictable patterns.
**Prevention:** Use a secure password generator using `window.crypto.getRandomValues()` and ensure the UI conveys the generated password securely.
