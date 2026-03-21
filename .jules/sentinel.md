## 2024-05-24 - Hardcoded Default Password during Bulk Import
**Vulnerability:** Predictable default passwords (user's ID/cedula) used in bulk import enabled unauthorized access to newly created accounts.
**Learning:** System-generated initial passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateSecureRandomString`) to securely generate temporary complex passwords instead of falling back to default IDs.
## 2024-05-24 - Hardcoded Default Password during New User Creation and Reset
**Vulnerability:** Predictable default passwords ('SC' + user's ID/cedula + '#2026') used during user creation and administrative password resets enabled unauthorized access to newly created accounts and reset accounts.
**Learning:** System-generated initial and reset passwords must always use secure, unguessable randomness that meets complexity requirements, forcing users to use reset-password flows for their first login or communicate securely.
**Prevention:** Use `window.crypto.getRandomValues()` (via `generateComplexPassword`) to securely generate temporary complex passwords instead of falling back to default IDs. Ensure existing sessions are deleted when resetting a password via RPC.
