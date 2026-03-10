## 2025-03-10 - ARIA Labels for Icon-only Buttons
**Learning:** Icon-only buttons (like the notification bell and sidebar toggle) across the layout components lacked `aria-label` attributes, which makes them inaccessible to screen readers as their purpose isn't conveyed through text content.
**Action:** Always ensure any `<Button>` or `<button>` that solely uses an `<Icon />` child has a descriptive `aria-label` prop. For dynamic states (like collapsed/expanded), the label should update accordingly to reflect the current action.
