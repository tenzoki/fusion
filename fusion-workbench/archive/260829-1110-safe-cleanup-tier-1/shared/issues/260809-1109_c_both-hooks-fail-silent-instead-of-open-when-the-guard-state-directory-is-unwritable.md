# Both hooks fail silent instead of open when the guard-state directory is unwritable

---

**Severity:** Medium — the documented fail-open behaviour is absent on the error class most likely to occur
**Domain:** code
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/guard.ts:776-781`, `hooks/tracker.ts:532-537`
**Cross-references:**
`260809-1103-guard-enforced-policies.md` §Findings 2a-3,
`260804-1607_*_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md` (closed; the visibility half of the same concern)

---

## What is wrong

Both hooks end with a top-level handler whose stated purpose is to fail open:

```
hooks/guard.ts:776-781
  main().catch((err) => {
    // Fail open on unexpected errors — don't block the agent
    emitEvent("guard_error", undefined, undefined, `Guard error (fail-open): ${err}`);
    process.stderr.write(`[guard] Error: ${err}\n`);
    allow();
  });
```

`emitEvent` appends to `fusion-workbench/.guard-state/events.jsonl`. When the original failure was an I/O error under `.guard-state/` — the single most likely cause of an unexpected throw in these two files, since almost every write they make goes there — `emitEvent` throws again inside the handler. `allow()` on the next line never runs. The process exits non-zero having written nothing to stdout.

The recovery path depends on the resource whose failure it is recovering from.

## Measured

Real hook as a subprocess, scratch consuming project, `.guard-state/` set read-only, a `Write` call at an unprotected path:

```
$ echo '<PreToolUse Write payload>' | node hooks/dist/guard.js
exit=1
STDOUT: []
STDERR: Error: EACCES: permission denied, open '.../.guard-state/events.jsonl'
```

Empty stdout, non-zero exit. The same shape reproduced in `tracker.js`, where it additionally suppressed a halt that the same run had already earned (see the snapshot-staleness record `260809-1108_*_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md`).

`speculation:` how Claude Code treats a PreToolUse hook that exits non-zero with empty stdout. I did not measure it. Both readings are bad in different ways: read as "no verdict", the guard is off with no notice; read as an error, the agent is blocked with no reason. Neither is the "fail open" the comment promises, and the ambiguity itself is worth removing.

## Suggested direction

Write the verdict first, then try to report. In both handlers, move `allow()` (respectively `respond()`) above the `emitEvent` call, and wrap the reporting in its own `try`/`catch`. The verdict is the hook's contract with Claude Code; the event log is best effort, and it must not be able to withdraw the verdict.

`process.stderr.write` can stay where it is. It does not touch the failing resource.

Worth checking in the same pass whether the same inversion exists in the other compiled hooks (`session-start.ts`, `clear-halt.ts`); the pattern is copyable.

## Acceptance criteria

- [ ] With `.guard-state/` unwritable, `guard.js` writes `{}` to stdout and exits 0.
- [ ] With `.guard-state/` unwritable, `tracker.js` writes a valid response envelope to stdout and exits 0.
- [ ] A failure inside the error reporting cannot suppress the verdict.
- [ ] A test drives both through the real subprocess with an unwritable state directory.

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Checked because this session rewrote one of the two files it names.**
`hooks/tracker.ts` was substantially rewritten in `62f5490` and `d8745f0`, so the handler this record cites by line was a plausible incidental fix. It was not touched. Both top-level handlers still call `emitEvent` before the verdict: `hooks/guard.ts` ends `emitEvent(...)` then `allow()`, `hooks/tracker.ts` ends `emitEvent(...)` then `respond()`. All four acceptance criteria remain unmet. One thing did change in the record's favour: the sharper instance it inherited from `260809-1108_*_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md` — a stale before-picture surviving the same failure — is closed, so the fail-silent path now costs a lost verdict rather than a lost verdict plus a wrong revert.

---
Resolved: the verdict is written before the report in all three hook entry points. `hooks/lib/fail-open.ts` is the new shared tail — it calls the hook's own verdict function first and unguarded, then the event emit and the stderr marker in a `try` each, so neither reporting step can withdraw a verdict already written or take the other down with it. `hooks/guard.ts` and `hooks/tracker.ts` now end in `failOpen("guard", err, allow, …)` / `failOpen("tracker", err, () => respond(), …)`; `hooks/session-start.ts` routes its handler through the same helper with no event emit, which is the one way its situation differs (it writes nothing under `.guard-state/` on any path, so it has no log to append to).

Measured on the real hooks as subprocesses, scratch project, `.guard-state/` at mode `0555` — before: `exit=1, STDOUT: []` for both; after: `exit=0, STDOUT: {}` for both, with the `[guard] Error:` / `[tracker] Error:` line still on stderr. All four acceptance criteria met. `hooks/lib/__tests__/hook-fail-open.test.ts` drives both through the real subprocess against an unwritable state directory and asserts the marker line as well as the verdict, so a run where the mode bits do not bite (root, or a filesystem that ignores them) fails loudly instead of passing vacuously.

`hooks/clear-halt.ts` was checked and deliberately not given a fail-open tail: it is a manual tool reporting to a human, owes Claude Code no verdict, and a run that could not do its job must exit non-zero with the stack trace rather than print a reassuring line. The reporting half does apply there, so its closing `emitEvent` is now best effort with a note on stderr — the halt is already cleared by then and an unwritable log must not cost the confirmation.

One consequence surfaced while measuring and is filed rather than fixed here: with `.guard-state/` unwritable, `guard.ts` persists the escalation counter before it writes a deny, so the deny is lost and the fail-open allow goes out on a protected path — `260809-1825_*_an-unwritable-guard-state-directory-turns-….md`. Not a regression (the same call previously exited 1 with empty stdout), and the same ordering defect one level down.
