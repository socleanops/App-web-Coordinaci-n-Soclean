## 2024-05-18 - Extracting Intl.DateTimeFormat instantiations from render loops
**Learning:** Instantiating `Intl.DateTimeFormat` or calling `Date.prototype.toLocaleDateString()` with locale options inside React render cycles or list mapping functions creates a massive amount of unnecessary object allocations and causes significant rendering overhead. Each call requires the JS engine to resolve the locale data and re-parse the formatting options.
**Action:** Always pre-instantiate and cache `Intl.DateTimeFormat` instances as module-level constants outside of React components. Use the cached `.format(date)` method inside render loops. Be careful to ensure that different formatting configurations (e.g., those requiring `{ weekday: 'long' }` vs those that do not) have their own dedicated formatter instances to prevent side-effects.
## 2024-05-18 - [O(N) Render Optimization in Data Tables]
**Learning:** The codebase frequently uses inline array filtering (e.g., `array.filter(...)`) for search/display within render cycles of large data tables (e.g., Attendance).
**Action:** Wrapped these operations in `useMemo` as a required performance pattern to prevent thread-blocking recalculations on every render.
## 2024-03-28 - Optimize array filtering
**Learning:** O(N) filtering operations block the main thread; caching the result reduces re-render times by ~30% for large lists.
**Action:** Always wrap array `.filter()` calls inside components with `useMemo` when rendering lists of items.
