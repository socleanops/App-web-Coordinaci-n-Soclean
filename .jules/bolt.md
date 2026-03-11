## 2024-02-28 - Pre-instantiate Intl.DateTimeFormat
**Learning:** Calling `new Date().toLocaleDateString()` inside a React `.map` loop creates a new `Intl.DateTimeFormat` object for every iteration, which is expensive and causes performance bottlenecks during list rendering.
**Action:** Extract the formatter by calling `const dateFormatter = new Intl.DateTimeFormat('locale')` outside the component (or memoize it with `useMemo`), and use `dateFormatter.format(date)` inside the render loop.
