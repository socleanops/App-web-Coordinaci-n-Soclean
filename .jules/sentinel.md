## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.
## 2026-03-22 - Prevent predictable default passwords
**Vulnerability:** Predictable default passwords based on user ID.
**Learning:** The application was using an insecure deterministic string like SC[cedula]#2026 for password defaults, which can be easily guessed.
**Prevention:** Use a cryptographically secure random password generator (like generateComplexPassword using crypto.getRandomValues) and display it securely.
## 2024-05-24 - Fix predictable default passwords
**Vulnerability:** Default and reset passwords used a predictable pattern (`SC${cedula}#2026`), allowing unauthorized access if an attacker knows a user's ID/cédula.
**Learning:** Default fallback passwords must be cryptographically secure and surfaced clearly in the UI, rather than relying on predictable patterns.
**Prevention:** Use a secure password generator using `window.crypto.getRandomValues()` and ensure the UI conveys the generated password securely.

## 2025-05-15 - Mixed Content Vulnerability with Google Maps Icons
**Vulnerability:** Serving assets (Google Maps markers) over insecure HTTP in an HTTPS application.
**Learning:** Insecure asset requests can be blocked by browsers or lead to mixed content vulnerabilities, compromising the security context of the page.
**Prevention:** Always use HTTPS for external asset URLs to ensure they load correctly in secure contexts.
