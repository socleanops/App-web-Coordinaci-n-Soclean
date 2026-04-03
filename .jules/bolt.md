## 2025-02-14 - Optimize loop invariants within useMemo
**Learning:** Using inline `.filter()` inside React components executes the filter computation on every single render. Additionally, repeating operations like `.toLowerCase()` inside the loop for every element is highly inefficient.
**Action:** When filtering arrays, wrap the operation in `useMemo` and hoist invariant operations (such as `searchTerm.toLowerCase()`) outside the array iteration to avoid redundant per-element calculations.
