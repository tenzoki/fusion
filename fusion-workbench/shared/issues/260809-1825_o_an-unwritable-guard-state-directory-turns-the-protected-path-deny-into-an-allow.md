# An unwritable guard-state directory turns the protected-path deny into an allow

---

**Severity:** Medium — the deny the guard already decided is discarded by a failure in its own bookkeeping
**Domain:** code
**Filed by:** coder, while fixing `260809-1109` (verdict before reporting)
**Affects:** `hooks/guard.ts` — CHECK 1 (halt), CHECK 2 (protected path) and CHECK 3 (decision-governed), each of which calls `saveEscalation` before `block`
**Cross-references:**
`fusion-workbench/shared/issues/260809-1109_*_both-hooks-fail-silent-instead-of-open-….md` (the handler this was found from; a different fix in a different place),
`hooks/lib/__tests__/hook-fail-open.test.ts` — the case "fails open on a protected path too" pins the current behaviour

---

## What is wrong

Every deny in `guard.ts` persists the escalation counter before it writes the
verdict:

```
const halted = recordBlock(escalation, …);
saveEscalation(escalation);      // ← writes fusion-workbench/.guard-state/
emitBlockEvent(halted, …);
block(reason);                   // ← the verdict
```

`saveEscalation` writes `escalation.json.tmp` and renames it, so it needs write
permission on `.guard-state/`. When it throws, the deny that was already decided
is never written. The top-level handler then supplies the fail-open verdict,
which is an allow — on a protected path.

The order is the same one issue `260809-1109` closed in the top-level handlers,
one level down: a record about the decision stands ahead of the decision.

## Measured

Scratch consuming project, `.guard-state/` at mode `0555`, real hook as a
subprocess, after the `260809-1109` fix landed:

```
$ echo '<PreToolUse Edit rules/x.md>' | tsx hooks/guard.ts
exit=0
STDOUT: {}
STDERR: [guard] Error: Error: EACCES: permission denied, open '…/.guard-state/escalation.json.tmp'
```

`{}` is the allow. The same call with a writable state directory blocks.

## What this is not

It is not a regression from `260809-1109`. Before that fix the same call exited 1
with empty stdout, and what Claude Code makes of that was never measured — the
ambiguity the record was filed about. The outcome is now stated rather than
guessed at; it is not yet the right outcome.

Nor is it reachable by an agent: `.guard-state/` is created by the hooks
themselves under a workbench the user owns, so an unwritable one means a
filesystem full, a permissions change, a read-only mount, or a restored backup —
not something a tool call arranges. That is what keeps this Medium rather than
High, and it does not make the behaviour correct.

## Suggested direction

Write the verdict before persisting the counter, in all three checks: `block`
first, then `saveEscalation` and `emitBlockEvent` as best-effort reporting.
A deny is a decision the guard already made from the config and the path; the
counter is a record of it, and a record must not be able to withdraw what it
records. This is exactly the shape `lib/fail-open.ts` states for the top-level
handlers, applied to the three sites inside `main`.

Two things to check while doing it, rather than assume:

- The halt in CHECK 1 has the same shape and the same fix.
- `tracker.ts`'s measurement raises its halt through `saveEscalation` too. Its
  situation differs — the write-back has already happened by then, so the file is
  restored whatever the escalation write does — but the halt itself and the
  sentence naming the file can still be lost, and the same reordering probably
  applies.

An alternative worth weighing before coding: make `saveEscalation` best effort at
its call sites instead, so a failed counter write is reported and stepped over
rather than thrown. That trades a lost deny for a lost count, which is the
cheaper loss, but it spreads the decision across every caller — prefer the
reordering unless something makes it impossible.

## Acceptance criteria

- [ ] With `.guard-state/` unwritable, an `Edit` of a protected path still emits
      `{"decision":"block", …}` and exits 0.
- [ ] The same for a halted project (CHECK 1) and for a decision-governed path
      that escalates (CHECK 3).
- [ ] A failure persisting the escalation counter is reported, not silent.
- [ ] `hooks/lib/__tests__/hook-fail-open.test.ts` "fails open on a protected
      path too" is rewritten to assert the deny, and its comment stops pointing
      at this record.
