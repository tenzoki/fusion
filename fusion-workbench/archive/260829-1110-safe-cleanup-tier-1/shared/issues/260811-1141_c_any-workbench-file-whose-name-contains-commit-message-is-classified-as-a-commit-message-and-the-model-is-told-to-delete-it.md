# Any workbench file whose name contains "commit-message" is classified as a commit-message file, and the model is told to delete it

---
**Severity:** High
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `hooks/lib/staging-drift.ts:208`, `:306-315`, `:536-542`; `agents/orchestrator.md` `## Staging check` class table; `hooks/lib/__tests__/commit-message-path.test.ts:68-76`
**Cross-references:** issue `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md` (the record this module answers); commit `cac41ef`

---

## The defect

`classify()` tests `COMMIT_MESSAGE = /commit[-._]?(msg|message)/i` against `basename(rel)` alone,
with no directory scoping, and it runs **first** — ahead of the store test — by explicit design
(`staging-drift.ts:296-305`). So an authored record whose topic slug happens to contain
"commit message" is not a `record`. It is a `commit-message`, and `stagingSentence` then tells the
model:

> `Delete it and use the prescribed path.`

`agents/orchestrator.md` `## Staging check` repeats the instruction in its class table: for
`commit-message`, "delete it".

## Evidence — this is not hypothetical

A file matching the pattern already exists in this workbench:

```
fusion-workbench/shared/history/260810-1810-coder-commit-message-out-of-the-shell.md
```

Run through the shipped classifier:

```
$ node -e 'import("./dist/lib/staging-drift.js").then(m => console.log(
    m.classify("shared/history/260810-1810-coder-commit-message-out-of-the-shell.md", "")))'
{ klass: 'commit-message',
  why: 'a commit message inside the workbench — Step 3b prescribes /tmp/fusion-commit-msg-<task-id>.txt' }
```

Reproduced end to end against a scratch project root (git repo + workbench + `agentstate.yaml`),
with an unstaged history record named `260812-0900-coder-commit-message-fix.md` and a commit moving
HEAD. `hooks/dist/tracker.js` returned:

> A commit-message file is sitting in the workbench:
> `shared/history/260812-0900-coder-commit-message-fix.md`. Step 3b writes the message to
> `/tmp/fusion-commit-msg-<task-id>.txt` … **Delete it and use the prescribed path.**

## Why it is High and not cosmetic

Two failures at once, and the second hides the first.

1. **The instruction is destructive.** The model is told to delete an authored session record. The
   guard's protected-path measurement does not cover `fusion-workbench/`, so nothing stops it.
2. **The real fault is suppressed.** The classes are exclusive. That same file *is* an unstaged
   record — exactly the defect `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md` was filed about — and because it landed in the
   `commit-message` class it never appears in the `record` list, never reaches the "add these paths
   to the next Step 3b staging list" sentence, and is not in `report.faults` as a record.

This codebase files records about commit procedure regularly: `grep -l commit` over the workbench
returns 20+ artifacts today, one of which already matches the pattern. The probability of recurrence
is not low.

## Why the current shape was chosen, and why the reason does not hold

The header at `:296-305` justifies the ordering: "`commit-message` runs first so a message file
dropped inside a store is still read as one". That case is real, but it is bought at the price of
misreading every record *about* commit messages. The pattern is also deliberately broad
(`:198-207`: "a name pattern rather than the one path that was improvised"), which is right for
finding the next improvisation and wrong as the sole discriminator.

## Fix direction

The distinguishing fact is not the name. A commit-message leftover is a file **git has never
tracked and no store owns**; an authored record carries the store's own filename shape. Two cuts,
either of which closes it:

- **Scope the pattern.** Apply `COMMIT_MESSAGE` only to paths that are *not* under a `STORES`
  segment and are not `ROOT_RECORDS` — i.e. run the store test first and let `commit-message` claim
  only what is left. A message file genuinely dropped inside `shared/issues/` then reports as an
  unstaged `record`, which is a *safe* misread: the model stages it instead of deleting it.
- **Or require the record shape to lose.** Records match `^\d{6}-\d{4}[-_]`; a leftover message file
  does not. Exclude anything matching the artifact filename pattern from `commit-message`.

Whichever is chosen, the sentence at `:536-542` should stop saying "Delete it" unconditionally —
"delete it if it is a leftover, and tell the user which file it was" is the honest wording for a
class that can be entered by a false positive.

`hooks/lib/__tests__/commit-message-path.test.ts:68-76` reaches through `classify` deliberately, so
it inherits the same over-match: `workbenchMessagePaths()` would flag a prompt line naming
`fusion-workbench/shared/issues/…commit-message….md`. Fixing `classify` fixes both.

## Test gap

`staging-drift.test.ts` has no fixture whose record name matches the pattern. Its
commit-message case (`:163`) uses `.commit-msg-tmp`, the genuine leftover. Add a control with an
authored record named `…-commit-message-….md` under a store and assert it classifies as `record`.

---
Resolved: `classify()` in `hooks/lib/staging-drift.ts` now runs the `COMMIT_MESSAGE` name test
**last**, over only what `LIVE_STATE`, `stashes/`, `ROOT_RECORDS` and `STORES` have all declined to
claim — the record's first cut ("scope the pattern"), taken over the filename-shape cut because
every other class here is already decided by location and the store-shape convention has exceptions
the date-stamp pattern does not cover. The three real records named in the Evidence section now
classify as `record` and reach the unstaged-record fault list, closing both halves: the destructive
instruction and the suppression behind it. Stated cost, carried in the code: a commit message
genuinely dropped inside a store is read as an unstaged `record`, so the model stages it rather than
deleting it and the `/tmp` sentence is not printed for it — a misread in the safe direction.
`stagingSentence()` no longer says "Delete it" unconditionally; it says read the file first, and why.
`agents/orchestrator.md` `## Staging check` class table carries the same wording, and the prose at
`agents/orchestrator.md:418`, `skills/commit/SKILL.md` and `hooks/tracker.ts` was narrowed to match.
Tests: `staging-drift.test.ts` gains the missing control (all three real filenames, asserted
`record`) plus a tracker case asserting the suppressed record fault now reaches the model;
`commit-message-path.test.ts` gains a control pinning the boundary in both directions and documents
the narrowing its `workbenchMessagePaths()` inherits. `cd hooks && npm test` — 1246 passed, exit 0.
