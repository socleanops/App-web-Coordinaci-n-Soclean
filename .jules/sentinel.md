## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.

## 2024-05-24 - Hardcoded Predictable Password during User Creation and Reset
**Vulnerability:** A predictable default password pattern (`SC${cedula}#2026`) was hardcoded into user creation and password reset flows, making accounts vulnerable to unauthorized access if a user's document ID is known.
**Learning:** System-generated passwords for user creation and resets must not use predictable patterns or user-specific information. Manual string concatenations involving user data introduce severe security risks.
**Prevention:** Always use cryptographically secure methods like `window.crypto.getRandomValues()` (via `generateComplexPassword`) to create strong, unguessable default passwords for new users and password resets.
