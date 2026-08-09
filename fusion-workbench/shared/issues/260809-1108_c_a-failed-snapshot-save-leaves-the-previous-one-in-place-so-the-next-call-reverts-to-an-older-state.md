# A failed snapshot save leaves the previous one in place, so the next call reverts to an older state

---

**Severity:** High — the guard reverts a state no measurement ever objected to, while the code comment asserts the opposite behaviour
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/protected-snapshot.ts` (`saveSnapshot`, `loadSnapshot`), `hooks/tracker.ts` (`measureProtectedPaths`)
**Cross-references:**
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2c-3

---

## What is wrong

`saveSnapshot` writes to a temporary file and renames it, and swallows any failure:

```
hooks/lib/protected-snapshot.ts:459-468
  try {
    mkdirSync(...); writeFileSync(tmp, ...); renameSync(tmp, path);
  } catch {
    // A snapshot that cannot be written means the next comparison has no
    // before-picture and skips. Silent here on purpose: ...
  }
```

The comment states the safety argument the silence rests on, and the argument does not hold. The write that fails is the write to `${path}.tmp`. The previous `protected-snapshot.json` is never touched, so it is still there, and `loadSnapshot` returns it. There is a before-picture; it is simply the wrong one.

`loadSnapshot` validates the object's shape (`:483-492`) and never looks at `ts`, the field whose own documentation says it exists "for the reader of a stale snapshot file" (`:129`). No reader exists.

## Consequence

The next tool call compares the current tree against a snapshot from **two or more calls ago**. Every protected path that changed in the intervening calls is reported as changed by this one, reverted, and halted on. Those intervening changes may include an exempted rule write the guard already allowed, or a change the user made and the guard already accepted.

## Measured

Real hooks as subprocesses, scratch consuming project, `"protectedPaths": ["rules/**"]`. The snapshot write was made to fail in isolation by placing a directory at `protected-snapshot.json.tmp`, leaving the rest of `.guard-state/` writable so nothing else in the run was disturbed:

```
call 1  PreToolUse            snapshot recorded: rules/x.md = "A"
        (no change; no PostToolUse)

        rules/x.md -> "B"     a change from an earlier, settled call

call 2  PreToolUse            {}   snapshot save fails, silently.
                                   On-disk snapshot still says rules/x.md = "A"
        rules/x.md -> "C"     what THIS tool call changed
        PostToolUse           "rules/x.md was modified and has been restored to
                               its content from before this tool call." Halt.

        rules/x.md is now     "A"
```

State `B` was destroyed. No measurement had ever objected to it, and the message says the restore target was the content from before this call, which it was not.

## A second, sharper instance of the same shape

The same run, with the whole of `.guard-state/` unwritable rather than the snapshot alone, produced a worse ordering. `measureProtectedPaths` restores first (`hooks/tracker.ts:319-322`), emits events second (`:327-329`) and raises the halt third (`:335-343`). An I/O failure in the event emission therefore lands **after** the file has been written back and **before** the halt exists. Measured: the file was reverted, no halt was raised, no event was logged, and the hook exited non-zero with empty stdout, so the model was told nothing at all. Filed separately as the fail-open defect; noted here because the restore-before-record ordering is what makes it silent.

## Suggested direction

Two changes, both small, and the second is the one that generalises.

1. **A failed save removes the stale file.** In the `catch`, unlink `path` (best effort). Then the comment's claim becomes true: no before-picture, and the next comparison skips.
2. **The snapshot carries its own validity, and the reader checks it.** `ts` is already written. Have `loadSnapshot` reject a snapshot older than a small bound, and have `tracker.ts` consume the snapshot — unlink it after reading — so a snapshot is used exactly once. A single-use before-picture is the invariant the two-hook seam actually needs, and it closes this defect, the leftover-after-a-blocked-call case, and part of the parallel-call residual documented at `hooks/tracker.ts:272-280` in one move.

Point 2 subsumes point 1. If only one is taken, take point 2.

## Acceptance criteria

- [x] A snapshot that cannot be written leaves no snapshot behind, and the following PostToolUse measures nothing.
- [x] A snapshot is read at most once; a second PostToolUse without an intervening PreToolUse measures nothing.
- [x] The comment at `hooks/lib/protected-snapshot.ts:465-468` describes what the code does.
- [x] A test drives both cases through the real hooks, not through the module directly.

---
Resolved: `62f5490` — both halves of the suggested direction, minus the age
bound. `saveSnapshot`'s `catch` now removes the stale snapshot file (best
effort), so the comment's claim that the next comparison has no before-picture
and skips is true rather than merely stated; and `consumeSnapshot` unlinks the
picture as it reads it, with `tracker.ts` calling it in place of `loadSnapshot`,
so a before-picture belongs to exactly one measurement. The age bound the record
also suggested was deliberately **not** built: a legitimate tool-call window has
no upper limit — this repository's own suite holds one open for well over a
minute — so any threshold would turn a legitimate measurement into a silent
skip, a fail-open introduced to fix a fail-wrong. The `ts` field's documentation
now says it is written and not read instead of naming a reader that does not
exist. Pinned by two cases in
`hooks/lib/__tests__/protected-snapshot-integration.test.ts` driven through the
real hooks: the filed measurement reproduced (a directory placed at
`protected-snapshot.json.tmp`, the rest of `.guard-state/` writable), and a
second PostToolUse with no PreToolUse in front of it measuring nothing.
