## 2024-02-28 - Pre-instantiate Intl.DateTimeFormat
**Learning:** Calling `new Date().toLocaleDateString()` inside a React `.map` loop creates a new `Intl.DateTimeFormat` object for every iteration, which is expensive and causes performance bottlenecks during list rendering.
**Action:** Extract the formatter by calling `const dateFormatter = new Intl.DateTimeFormat('locale')` outside the component (or memoize it with `useMemo`), and use `dateFormatter.format(date)` inside the render loop.

## 2024-11-20 - Intl.DateTimeFormat caching in lists
**Learning:** `toLocaleDateString()` and `toLocaleTimeString()` in JavaScript inherently instantiate new `Intl.DateTimeFormat` objects. Using them inside `.map()` functions for large lists (like the Attendance table rendering) causes significant garbage collection overhead and potential UI blocking during render.
**Action:** Always pre-instantiate `Intl.DateTimeFormat` objects outside the component (or memoize them if locale/options are dynamic) and use `formatter.format(date)` instead inside render loops.
