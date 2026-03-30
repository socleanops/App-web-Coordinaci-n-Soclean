## 2024-05-24 - Exposed Sensitive Data in Logs
**Vulnerability:** The application was logging sensitive user information, including Personally Identifiable Information (PII) and passwords, directly to the browser console during the user creation process (`console.log("Data:", formData)`).
**Learning:** Logging entire objects, especially those originating from forms handling user credentials or personal data, creates a severe information leakage vulnerability on the client side.
**Prevention:** Never log entire form data objects. If debugging is necessary, log only specific, non-sensitive properties (like an ID or an action name) and ensure all debug logs are removed or sanitized before code is deployed.
## 2026-03-27 - Exposed Sensitive Data in Console Logs
**Vulnerability:** Found remaining instance of hardcoded console logs (`console.log`) in `src/hooks/useAsistencia.ts` that logged schedules and details that could include PII or sensitive timing info.
**Learning:** Found an edge case where schedule objects containing foreign keys, statuses, and full entities can be dumped.
**Prevention:** Avoid debugging tools (`console.log`) in production code handling API results, and remove them promptly when found, relying on robust error tracking or dedicated audit mechanisms if they must exist.
## 2024-05-24 - Fix XSS Vulnerability in Print Dialogs
**Vulnerability:** User-controlled data (e.g., employee names, client names, service addresses) from Supabase was being directly interpolated into raw HTML string templates (`tableHtml += ...`) in `FuncionarioPrintDialog.tsx` and `HorarioPrintDialog.tsx` before being rendered in a new window for printing.
**Learning:** Directly concatenating dynamic data into HTML strings, even for internal reports or print views, bypasses React's automatic escaping and introduces Cross-Site Scripting (XSS) risks.
**Prevention:** Always use a utility function like `escapeHtml` to sanitize user inputs before inserting them into dynamically constructed HTML strings.
