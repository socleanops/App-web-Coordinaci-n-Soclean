## 2024-05-18 - Fix Cross-Site Scripting (XSS) in print dialogs
**Vulnerability:** User inputs (like employee names, client names, directions) were being directly interpolated into an HTML string and written to a new window using `document.write` for printing, without any escaping.
**Learning:** Always sanitize user input before dynamically injecting it into the DOM, even in secondary functions like print windows, to prevent XSS attacks. The new `escapeHtml` utility should be used for this purpose.
**Prevention:** Ensure that all dynamically generated HTML strings pass variables through an HTML escaping function (like `escapeHtml`) before being written to the document or set as `innerHTML`.
