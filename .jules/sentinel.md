## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.
## 2026-03-22 - Prevent predictable default passwords
**Vulnerability:** Predictable default passwords based on user ID.
**Learning:** The application was using an insecure deterministic string like SC[cedula]#2026 for password defaults, which can be easily guessed.
**Prevention:** Use a cryptographically secure random password generator (like generateComplexPassword using crypto.getRandomValues) and display it securely.
