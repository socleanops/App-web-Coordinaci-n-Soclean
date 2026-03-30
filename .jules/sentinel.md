## 2024-05-24 - Fix XSS Vulnerability in Print Dialogs
**Vulnerability:** User-controlled data (e.g., employee names, client names, service addresses) from Supabase was being directly interpolated into raw HTML string templates (`tableHtml += ...`) in `FuncionarioPrintDialog.tsx` and `HorarioPrintDialog.tsx` before being rendered in a new window for printing.
**Learning:** Directly concatenating dynamic data into HTML strings, even for internal reports or print views, bypasses React's automatic escaping and introduces Cross-Site Scripting (XSS) risks.
**Prevention:** Always use a utility function like `escapeHtml` to sanitize user inputs before inserting them into dynamically constructed HTML strings.
