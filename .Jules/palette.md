## 2024-05-18 - Add aria-pressed to custom toggles
**Learning:** Custom UI toggle buttons (e.g., selectable day chips or multi-select elements) that do not use a hidden native `<input type="checkbox">` need `aria-pressed` to correctly communicate their selection state to assistive technologies.
**Action:** Always include the `aria-pressed={state}` attribute on custom toggles.
