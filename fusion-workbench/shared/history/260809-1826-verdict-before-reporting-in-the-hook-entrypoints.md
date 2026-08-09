# Verdict before reporting, in the hook entry points

**Status:** Complete
**Agent:** coder
**Task:** tasklist task 2, `I:260809-1109-failopen`
**Source record:** `fusion-workbench/shared/issues/260809-1109_*_both-hooks-fail-silent-instead-of-open-….md`

---

## What was wrong

`hooks/guard.ts` and `hooks/tracker.ts` each ended with a top-level handler whose
comment promised fail-open and which called `emitEvent(...)` before `allow()` /
`respond()`. `emitEvent` appends under `fusion-workbench/.guard-state/`, which is
where nearly every write those two files make goes — so an I/O failure there was
both the likeliest reason the handler ran and the one reason it could not
survive. The emit threw a second time, the verdict line never ran, and the
process exited 1 with empty stdout.

Reproduced before touching anything, real hooks as subprocesses in a scratch
project with `.guard-state/` at mode `0555`:

```
guard.ts   → exit=1, STDOUT: []
tracker.ts → exit=1, STDOUT: []
```

## What was done

A shared tail, `hooks/lib/fail-open.ts`, rather than three inline copies of an
ordering rule. `failOpen(tag, err, verdict, emit?)` calls the hook's own verdict
function first and unguarded, then the event emit and the stderr marker line in a
`try` of its own each. Putting the verdict inside the helper is what makes the
order structural: a call site cannot get it wrong by writing its two statements
the other way round. The two reporting steps are guarded separately because they
fail independently — the stderr line does not touch the state directory, so a
dead state directory must not cost the diagnostic that says why.

Call sites:

- `hooks/guard.ts` — `failOpen("guard", err, allow, () => emitEvent("guard_error", …))`
- `hooks/tracker.ts` — `failOpen("tracker", err, () => respond(), () => emitEvent("guard_error", …))`
- `hooks/session-start.ts` — `failOpen("session-start", error, () => process.stdout.write("{}\n"))`, no event emit

`session-start.ts` shared the ordering (stderr, then the `{}`) but not the
defect: it writes nothing under `.guard-state/` on any path, so its report could
not fail from the same cause. It was reordered anyway, because a broken stderr
should not cost the session its verdict either, and it passes no `emit` — giving
it one would mean a SessionStart hook creating guard state before a single tool
call has run.

`clear-halt.ts` genuinely differs and was not given a fail-open tail. It is a
manual tool a human runs; it owes Claude Code no verdict on stdout, and a run
that could not do its job must exit non-zero with the stack trace rather than
print a reassuring line — which is the whole subject of issue `260805-1134` in
its header. The reporting half does carry over: its closing `emitEvent` sits
after `saveEscalation`, so the halt is already cleared by the time it runs, and
it is now best effort with a note on stderr rather than able to withdraw the
confirmation of work already finished.

## Measured after

Same scratch project, same mode:

```
guard.ts   Edit notes.txt   → exit=0, STDOUT: {}, STDERR: [guard] Error: EACCES …escalation.json.tmp
tracker.ts Edit notes.txt   → exit=0, STDOUT: {}, STDERR: [tracker] Error: EACCES …cross-file.json.tmp
```

All four acceptance criteria met. `npm test` in `hooks/`: 35 files, 1120 tests,
all passing.

## The test

`hooks/lib/__tests__/hook-fail-open.test.ts`, seven cases. Three drive the real
hooks as subprocesses against a project whose `.guard-state/` exists and is
unwritable; four are in-process cases on `failOpen` itself (verdict before emit,
a throwing emit, a throwing stderr write, a thrown value that is not an `Error`).

It reuses the existing harness rather than building a mechanism:
`withProject`, `guardEntry`, `trackerEntry` and `childEnv` from
`helpers/guard-harness.ts`. What it cannot reuse is `runGuard` / `runTracker` —
both throw on seeing the fail-open marker on stderr, deliberately, and that
marker is the state under test — so the three subprocess cases spawn through the
harness's entry resolution and read the raw result.

Two things keep them honest. The state directory has to be created before it is
chmodded, because the state writers call `mkdirSync(dir, {recursive: true})`
first and would otherwise get a writable one under the writable
`fusion-workbench/`. And every subprocess case asserts the marker line as well as
the verdict: running as root, or on a filesystem that ignores the mode bits,
nothing fails and both hooks emit exactly what the criteria ask for, so without
the marker assertion the case would be green while checking nothing.

## Filed

`fusion-workbench/shared/issues/260809-1825_*_an-unwritable-guard-state-directory-turns-….md`.
Measuring the fix surfaced that `guard.ts` persists the escalation counter before
it writes a deny (`saveEscalation` then `block`, in all three checks), so an
unwritable state directory throws while the verdict is still unwritten and the
fail-open allow goes out on a protected path. It is the same ordering defect one
level down, it is not a regression (the same call previously exited 1 with empty
stdout), and fixing it would change what the hook decides — out of scope here.
The test case "fails open on a protected path too" pins the current behaviour and
names the record, so the day that deny is restored, the pin fails and points at
its own replacement.

## Files changed

- `hooks/lib/fail-open.ts` (new)
- `hooks/guard.ts`
- `hooks/tracker.ts`
- `hooks/session-start.ts`
- `hooks/clear-halt.ts`
- `hooks/lib/__tests__/hook-fail-open.test.ts` (new)
- `README-hooks.md` — the `lib/` file table, which
  `derivable-enumerations-lint.test.ts` checks against the tree
- `hooks/dist/**` — rebuilt

Not committed: the orchestrator commits under the commit lock.
