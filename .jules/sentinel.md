## 2024-05-15 - Prevent Predictable Default Passwords
**Vulnerability:** Predictable default passwords generated using user ID/Cédula (`SC${cedula}#2026`) allow unauthorized access.
**Learning:** Default passwords must be securely randomized using `window.crypto` to prevent guessing.
**Prevention:** Use `generateSecureRandomString` combined with strong password requirements for initial credentials and resets.
