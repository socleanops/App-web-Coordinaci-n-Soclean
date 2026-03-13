## 2024-02-28 - Pre-instantiate Intl.DateTimeFormat
**Learning:** Calling `new Date().toLocaleDateString()` inside a React `.map` loop creates a new `Intl.DateTimeFormat` object for every iteration, which is expensive and causes performance bottlenecks during list rendering.
**Action:** Extract the formatter by calling `const dateFormatter = new Intl.DateTimeFormat('locale')` outside the component (or memoize it with `useMemo`), and use `dateFormatter.format(date)` inside the render loop.
## 2026-03-13 - Pre-instantiate Intl.DateTimeFormat
**Learning:** Instantiating `Intl.DateTimeFormat` is expensive, and calling `new Date(...).toLocaleDateString()` in mapping loops creates many short-lived instances. Furthermore, when switching to `Intl.DateTimeFormat.prototype.format()`, invalid dates throw `RangeError` unlike `toLocaleDateString` which returns 'Invalid Date'.
**Action:** Extract `Intl.DateTimeFormat` instantiation outside of rendering cycles and add `!isNaN(date.getTime())` safety checks before formatting to prevent application crashes on invalid date strings.
