## 2024-03-11 - Adding ARIA labels to Attendance components
**Learning:** Icon-only buttons in complex data tables or calendars (like week navigators or refresh actions) often lack programmatic names in this project, which severely degrades screen-reader experiences. While `lucide-react` icons are visual indicators, they lack text alternatives by default.
**Action:** When working on navigation or action buttons without visible text, always add a localized `aria-label` (e.g., in Spanish like "Semana anterior" or "Actualizar datos") to `<Button size="icon">` components to ensure parity between visual and programmatic meaning.
## 2024-03-22 - Missing ARIA labels and title tooltips on Icon-Only Buttons
**Learning:** Icon-only actions in data tables (like Edit, Delete, or App-level Navigation) are often missing programmatic names and tooltips. This not only impairs screen reader users, but also sighted users who are not familiar with what an icon represents.
**Action:** Always include a localized `aria-label` (and `title` tooltip for desktop users) when rendering `<Button size="icon">` to ensure functional parity between the visual representation and its accessible name.

## 2025-03-26 - Accesibilidad en botones toggle personalizados
**Learning:** Los botones que actúan como "toggles" o selectores múltiples (como los días de la semana en la creación de horarios) no informan su estado seleccionado a los lectores de pantalla si solo usan clases de CSS para reflejar la selección.
**Action:** Al implementar botones toggle personalizados que no usan un elemento `<input type="checkbox">` oculto, siempre hay que asegurar que se agregue el atributo `aria-pressed={state}` para comunicar el estado correcto a las tecnologías de asistencia, y opcionalmente `aria-label` si el contenido de texto no es suficientemente descriptivo por sí solo.
