## 2024-05-18 - Weak Password Complexity
**Vulnerability:** The login form lacked robust password complexity rules, only checking for a minimum of 6 characters.
**Learning:** Always enforce strong password policies on the client side to prevent brute-force attacks and weak credentials, in addition to server-side enforcement.
**Prevention:** Use regular expressions in schema validation (like Zod) to enforce length, uppercase, lowercase, numbers, and special characters.
