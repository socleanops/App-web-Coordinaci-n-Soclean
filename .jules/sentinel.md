## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.

## 2024-05-24 - Hardcoded Predictable Password during User Creation and Reset
**Vulnerability:** A predictable default password pattern (`SC${cedula}#2026`) was hardcoded into user creation and password reset flows, making accounts vulnerable to unauthorized access if a user's document ID is known.
**Learning:** System-generated passwords for user creation and resets must not use predictable patterns or user-specific information. Manual string concatenations involving user data introduce severe security risks.
**Prevention:** Always use cryptographically secure methods like `window.crypto.getRandomValues()` (via `generateComplexPassword`) to create strong, unguessable default passwords for new users and password resets.
## 2024-05-24 - Hardcoded Default Password during New User Creation and Reset
**Vulnerability:** Predictable default passwords ('SC' + user's ID/cedula + '#2026') used during user creation and administrative password resets enabled unauthorized access to newly created accounts and reset accounts.
**Learning:** System-generated initial and reset passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login or communicate securely.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateComplexPassword`) to securely generate temporary complex passwords instead of falling back to default IDs. Ensure existing sessions are deleted when resetting a password via RPC.
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

## 2024-05-24 - Information Leakage in Form Data Logging
**Vulnerability:** The application logs the entire `formData` object (which may contain PII like cédula, names, email, and potentially passwords depending on the context) and raw error messages/data structures to the browser console during the creation of a new "Funcionario" via the `useFuncionarios` hook.
**Learning:** Detailed logging of sensitive inputs, especially within client-side hooks interacting with forms or databases, inadvertently exposes sensitive information (PII/secrets) to anyone who can view the browser console or any scripts that capture console logs.
**Prevention:** Never log entire user input objects (e.g., `formData`) or raw database/API payloads to the console. Log only safe, necessary debugging information (like operation names or step indicators), and ensure any sensitive properties (like passwords or PII) are explicitly omitted or redacted before logging.
