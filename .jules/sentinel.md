## 2024-05-24 - Fix predictable default passwords
**Vulnerability:** Default passwords generated for users were predictable based on their cedula (e.g. `SC${cedula}#2026`), leading to insecure user accounts and potential account takeover.
**Learning:** Password generation patterns must not rely on easily guessable information or fixed patterns. Even temporary passwords must be secure.
**Prevention:** Use a cryptographically secure random number generator (CSPRNG) like `window.crypto.getRandomValues` to generate default passwords. Always enforce password complexity requirements (length, uppercase, lowercase, numbers, special characters) on auto-generated passwords.
