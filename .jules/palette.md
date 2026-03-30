
## $(date +%Y-%m-%d) - Add ARIA Labels to Icon-only Buttons
**Learning:** Icon-only buttons using Radix/Lucide icons within data tables often lack native screen reader context. The `title` attribute provides tooltip context for sighted users, but explicit `aria-label` attributes must be paired with them for reliable screen reader accessibility. Found missing ARIA labels on multiple icon-only action buttons in the Schedules data table.
**Action:** Always verify that every `<Button size="icon">` utilizing only an icon child contains a descriptive, localized `aria-label` matching the `title` attribute intent.
