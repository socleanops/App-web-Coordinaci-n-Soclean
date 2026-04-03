## 2024-04-03 - [Fix Predictable Password Generation]
**Vulnerability:** Predictable default passwords using user ID and static suffixes (`SC${cedula}#2026`).
**Learning:** Default password logic was explicitly circumventing secure generation in favor of memorable patterns, creating a severe attack vector if user IDs (cédulas) are known.
**Prevention:** Always use cryptographically secure random generators (like `generateComplexPassword`) for any system-generated secrets or initial passwords.
