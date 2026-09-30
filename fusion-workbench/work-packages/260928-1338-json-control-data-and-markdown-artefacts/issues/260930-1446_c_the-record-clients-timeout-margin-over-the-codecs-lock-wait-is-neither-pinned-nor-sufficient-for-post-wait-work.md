The record client's timeout margin over the codec's lock wait is neither pinned nor sufficient for post-wait work
---
`hooks/lib/record-client.ts` sets `DEFAULT_TIMEOUT_MS = 70_000` so that the codec's typed `conflict/lock-timeout` (after 65 s) "arrives first". No test ties the two constants, and the 5 s margin does not cover the work the codec does after its wait: `codec/src/kernel.ts` `read` checks the deadline only after running the body, and `recoverUnderLock` runs recovery after acquiring the lock with the remaining wait. On a large workbench an unscoped `list` or `reconcile` that starts near the 65 s mark is SIGKILLed by the client and reported `unanswered/timeout` instead of the typed answer.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** 260929-2025_*_which-response-size-does-the-claude-side-client-accept-from-the-codec-and-which-environment-does-the-child-get.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md

Evidence:
- `hooks/lib/record-client.ts`: `DEFAULT_TIMEOUT_MS = 70_000`, header `## The timeout sits above the codec's own`; `killSignal: "SIGKILL"`.
- `codec/src/kernel.ts` `read`: `waitMs = options.waitMs ?? LOCK_STALE_MS + 5_000`; the loop runs `body(...)` and the `after` snapshot, then tests `now() - started >= waitMs`. `codec/src/store.ts` `LOCK_STALE_MS = 60_000`.
- Both readers send `list` and `reconcile` without a scope (`hooks/lib/scope.ts`, `hooks/lib/work-graph.ts`); `codec/fixtures/prior/REQUESTS.md` request 31 measures about 460 bytes per row and expects this repository's workbench to exceed 2 000 records after migration.
- `hooks/lib/__tests__/record-client.test.ts` tests the timeout with `timeoutMs: 1500` against a stand-in only; no case compares `DEFAULT_TIMEOUT_MS` with the codec's wait, and no case exercises `maxBuffer` (an overflow surfaces as cause `exit`, "could not be run to its end", not a cause of its own).
- A SIGKILL during a reader's recovery leaves `.json-state/write.lock` for up to `LOCK_STALE_MS` and every other reader waiting on it.

Fix direction: pin the relation by a test that reads the codec's default wait (export it, or read it from `inspect`) and asserts the client's timeout exceeds it by a stated margin; size the margin from a measured body duration of `reconcile` at the request-31 scale, or have the codec bound total time rather than the wait alone (a Prior-side question). Give an oversized answer its own `unanswered` cause or document that `exit` covers it.

Acceptance: a test fails when the codec's default wait is raised to or past the client's timeout; the margin is stated with the measurement it rests on; the `maxBuffer` path has a case.

---
Resolved: this change. `hooks/lib/record-client.ts` sets `DEFAULT_TIMEOUT_MS = CODEC_WAIT_MS + POST_WAIT_MARGIN_MS` (65 000 + 5 000). From the codec's source the typed answer can arrive at most one step after the wait (a `read` iteration, or a 50 ms poll plus the work under the lock), so the margin covers process start plus one uncontended call. Measured 2026-09-30 through the client over 2 500 records (1 250 packages, one adopted plan each), M2 Max: every operation but `reconcile` at 0.18 to 0.84 s, so 5 s stays, stated in the header with that measurement. `reconcile` is not covered by any constant: 2.1 s at 200 records, 47 s at 1 000, 310 s at 2 500, filed as `260930-1712_*_the-codecs-reconcile-grows-with-the-square-of-the-record-count-and-outlasts-the-clients-timeout-from-about-1200-records.md`. `hooks/lib/__tests__/record-client.test.ts` reads both default waits off `codec/src/kernel.ts` and `codec/src/store.ts` and fails when either moves or changes form (shown red with `+ 10_000` and with `?? 90_000` on a scratch copy); an answer past `MAX_RESPONSE_BYTES` has a case, `unanswered/exit` naming `ENOBUFS`, which the header now documents instead of a cause of its own.
