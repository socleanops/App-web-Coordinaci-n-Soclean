## 2024-04-03 - [Fix Predictable Password Generation]
**Vulnerability:** Predictable default passwords using user ID and static suffixes (`SC${cedula}#2026`).
**Learning:** Default password logic was explicitly circumventing secure generation in favor of memorable patterns, creating a severe attack vector if user IDs (cédulas) are known.
**Prevention:** Always use cryptographically secure random generators (like `generateComplexPassword`) for any system-generated secrets or initial passwords.

## 2024-04-03 - [Information Leakage via Console Logs]
**Vulnerability:** Debug console logs were exposing entire objects containing form data, PII, and potentially passwords to the browser console.
**Learning:** Developers often leave debug logs that serialize entire objects (`console.log("Data:", formData)`). In production, this can leak highly sensitive information to anyone with access to the browser console or to any third-party scripts reading console output.
**Prevention:** Never log entire objects containing user data or passwords. If logging is necessary for debugging, log specific, non-sensitive properties.
