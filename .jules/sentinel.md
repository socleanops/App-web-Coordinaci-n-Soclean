## 2024-05-24 - Cross-Site Scripting (XSS) in Print Dialogs
**Vulnerability:** User inputs (like names, addresses, and ID numbers) were concatenated directly into a dynamically generated HTML string and written to a new window using `document.write(tableHtml)` without sanitization.
**Learning:** This architectural pattern bypasses React's built-in XSS protections (which automatically escape text in JSX). When developers step outside React and construct raw HTML strings, it is easy to forget manual escaping.
**Prevention:** Whenever building raw HTML strings, especially for `document.write` or `dangerouslySetInnerHTML`, always use an HTML escaping utility function (e.g., `escapeHtml`) on any user-controlled data before interpolation.
