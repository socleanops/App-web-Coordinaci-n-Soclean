## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.

## 2024-05-25 - Hardcoded Default Password Pattern #2026
**Vulnerability:** A legacy default password pattern (`SC[cedula]#2026`) was used for user creation and password resets, leading to predictable and insecure credentials.
**Learning:** Hardcoded predictable password patterns, even if they appear complex, are inherently insecure because they can be guessed if the user's ID is known. Passwords must be cryptographically secure and random.
**Prevention:** Use `generateComplexPassword()` based on `window.crypto.getRandomValues()` to generate truly random, complex temporary passwords and display them securely to administrators so they can be communicated.
