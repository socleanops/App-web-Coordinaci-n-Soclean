## 2025-02-23 - Concurrently batch async DB mutations in loops
**Learning:** Sequential inserts in large batches (N+1) create significant latency (O(N)), especially over network bounds.
**Action:** Use chunked `Promise.all` concurrent execution across array iterations to achieve near O(1) latency relative to network round trips, accelerating bulk import routines.