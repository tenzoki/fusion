# Both hooks fail silent instead of open when the guard-state directory is unwritable

---

**Severity:** Medium — the documented fail-open behaviour is absent on the error class most likely to occur
**Domain:** code
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/guard.ts:776-781`, `hooks/tracker.ts:532-537`
**Cross-references:**
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2a-3,
`circles/260801-1244-guard-rules-write/issues/260804-1607_c_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md` (closed; the visibility half of the same concern)

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

Empty stdout, non-zero exit. The same shape reproduced in `tracker.js`, where it additionally suppressed a halt that the same run had already earned (see the snapshot-staleness record `260809-1108`).

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
