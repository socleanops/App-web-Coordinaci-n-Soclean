
## 2024-05-24 - Dynamic HTML Generation XSS via document.write
**Vulnerability:** XSS vulnerability through unsanitized user inputs injected into `document.write()` when generating print dialog HTML (e.g., `HorarioPrintDialog` and `FuncionarioPrintDialog`).
**Learning:** Using template literals to inject variables directly into an HTML document context without escaping exposes the application to XSS attacks if data contains malicious `<script>` tags or HTML entities.
**Prevention:** Always use an `escapeHtml` utility or similar sanitization library before interpolating user-controlled data into HTML strings that are dynamically written or evaluated by the browser.
