The largest-store migration test asserts a 5 s wall-clock allowance and goes red under the suite's own parallel load
---
`codec/src/__tests__/migration.test.ts` (`a generated store of the largest measured copy's size`, the assertion `expect(t, `chunk ${i + 1}`).toBeLessThan(5_000)` near line 1883) compares each chunk's wall-clock time against 5 000 ms. On 2026-11-11/12, at `32ff15b7` plus two unrelated working-tree edits, `cd codec && npx vitest run` exited 1 on it in two full runs out of three: `chunk 6` took 5 083 ms while the hooks suite ran beside it, and `chunk 9` took 5 517 ms with nothing else running but vitest's own 22 files in parallel. The file alone passed both times (100 of 100), and a third full run passed (22 files, 1 924 tests). So the suite's exit code depends on machine load, and a red run carries no information about the code under test.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: the two executor reports of this package's dispatches (the `REQUESTS.md` append and the `install.test.ts` repair), and the orchestrator's own third run, exit 0, duration 242 s.

Acceptance: the full `cd codec && npx vitest run` no longer fails on this assertion under the suite's own parallelism, by a means that keeps the 5 s allowance a measured statement (the test run in isolation from the pool, or the allowance asserted where it is not contended), not by widening the number until it passes.
