## 2024-05-24 - Exposed Sensitive Data in Logs
**Vulnerability:** The application was logging sensitive user information, including Personally Identifiable Information (PII) and passwords, directly to the browser console during the user creation process (`console.log("Data:", formData)`).
**Learning:** Logging entire objects, especially those originating from forms handling user credentials or personal data, creates a severe information leakage vulnerability on the client side.
**Prevention:** Never log entire form data objects. If debugging is necessary, log only specific, non-sensitive properties (like an ID or an action name) and ensure all debug logs are removed or sanitized before code is deployed.
