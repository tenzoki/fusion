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
