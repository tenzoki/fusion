# coder — four low-priority corrections: one seam documented, one stand-down moved, two counts fixed

**Status:** Complete
**Session:** `260811-1329-coder-four-low-priority-corrections.md`
**Agent:** coder
**Tasks:** 26 (`I:260810-1030-comments-fixture`), 36 (`I:260805-1839-tracker-standdown`),
29 (`I:260810-0751-three-counts`), 34 (`I:260811-0109-review-totals-ten`) — disjoint file sets,
four independent fixes, four source records.

---

## Verification

`cd hooks && npm test` → **exit 0**, 48 files, 1248 tests, run against the final tree with the
bookkeeping already in place. HEAD `f2d9905` carried 1246; the two added are task 36's.

One run in between exited 1 and is reported rather than dropped: a vitest worker died in
`lib/__tests__/monitor-warnings-panel.test.ts` (`Error: Worker exited unexpectedly`, 47 of 48 files,
1239 of 1248 tests, **no assertion failed**). That file allocates a pseudo-terminal. It passes alone
(exit 0, 12 tests) and the full suite passed both before and after, so the crash is read as
environmental and not as a result of these changes — none of which touch `bin/monitor`. Stated,
not swept: if it recurs it is a real flake in that file and deserves a record.

## Task 26 — the second `bin/fusion-plane` test seam gets documented like the first

`--comments-fixture` and `FUSION_PLANE_COMMENTS_FIXTURE` now appear at the four surfaces `--fixture`
already occupied: the `push` synopsis in the file header, the header's test-seam paragraph, the
`push` block in `usage()`, and the `Env:` list in `usage()`.

The description says one thing `98c8b3f`'s `--fixture` text did not have to: the seam is read on the
`--plan` path only and behind the `spec_comment` opt-in. Verified rather than assumed — the read at
`bin/fusion-plane:1202` sits inside the `if [ "$DRYRUN" -eq 1 ]` branch opening at `:1176`, and the
live path does its own `GET issues/<id>/comments/` at `:570` without consulting the capture. So on a
live push the flag is accepted and inert, which a reader of the old synopsis could not have known
because the flag was not in it.

The record's second question — asked once for all seams instead of once per seam — was answered by
enumerating every `case` arm of `cmd_push`, `cmd_map` and `cmd_seed` and every `FUSION_PLANE_*` name
in the file, then checking both lists. `--comments-fixture` and its env twin were the only
omissions. The series ends here rather than at the next seam.

## Task 36 — the tracker's stand-down asks the workbench root

`hooks/tracker.ts` imports `isFusionPluginRoot` in place of `isFusionPluginCwd`, and the gate reads
`const workbenchRoot = findWorkbenchRoot(); if (workbenchRoot !== null && isFusionPluginRoot(workbenchRoot))`
— the question `measurementRoot()` already answers, at the same directory.

**Half the record was already closed before this task.** v6.0.1 moved the protected-path
measurement's own stand-down to the walked-up root, so the measurement has not depended on cwd
since, and the "would revert a fusion developer's edits" half of the record is historical. What was
left is the half the record actually measured: log noise and a churn count that depended on which
directory the session started in.

**A null root is deliberately not a stand-down here**, unlike in `measurementRoot()` where both
causes fold into one null. Without a workbench `churnKey` returns null and `emitEvent` writes
nowhere, so there is nothing to stand down; folding them would answer "fusion's own repository" for
any directory that never ran `/fusion:setup`.

**Measured against a root that is not this repository**, because the guard stands down here and a
local check proves nothing. Two cases in `lib/__tests__/churn-key-anchor.test.ts`, each a real
subprocess against a throwaway `withPluginProject` root: the tracker run from `<root>/fusion-workbench`
writes no `churn.json` and appends no `tracker_record` event, and the same holds from the root as it
always did. The first fails against the tracker at `f2d9905` (`expected { …(3) } to be null`) and
passes after; the second passes both ways. The control is the case already in that file which runs
the tracker from `fusion-workbench/` of an ordinary project and asserts the churn it recorded — still
green, which is the evidence that no consuming project's behaviour moved.

`hooks/dist/` rebuilt by `npm test`'s own build step; the diff is confined to `tracker.js` and
`lib/self-detect.{js,d.ts}`, so the committed build reproduces from source.

## Task 29 — the record about counting gives one count

`shared/issues/260810-0710_c_*:13` read "third instance" and "the three" while its list carried two
bullets, its next line said "Both", and `8d66265`'s message said "second". It now reads "second" and
"the two".

Counted against the tree rather than taken from the record: `ac68437` touches exactly two prompt
files; two records were filed for the shape that night; a search of every issue store for the shape's
own vocabulary returns those two and the record reporting the miscount. Two.

A dated correction note was appended above the existing `Resolved:` line rather than editing the
text silently, and the record stays closed.

## Task 34 — the 19:18 review's totals match its body

Low reads 6 and the sentence reads "Eleven findings, eleven records filed". Counted off the body:
twelve labelled bullets, of which the `M3` at `agents/orchestrator.md:429` is marked folded into `H2`
and filed no record, leaving eleven with a record each;
`ls 260810-1918_?_*.md | wc -l` → 11, all `_c_`.

The reconciler's annotation was left exactly as written — it describes the document at `e2a34f0` and
is the only record of what the table said when the count was taken — and a dated correction section
was appended below it.

Two things deliberately not done. The duplicate `M3` label stays: eleven filed records cite these
labels, and renaming one to fix a typo would break a citation. And no `**Reviewed-range:**` /
`**Not-opened:**` header was added — the file predates `afd7c2e`'s mandate,
`bin/fusion-review-coverage` is right to call it unusable, and a hand-written header would make a
range nobody re-opened look covered.

## Reported, not acted on

- **Task 65 / issue `260810-1632` is now trivially closable, and I did not close it.** Its human gate
  was a choice between two answers for the gate at `hooks/tracker.ts`; task 36's own acceptance
  criterion ("the tracker's stand-down and the protected-path measurement ask the same directory")
  settles it in favour of answer 1, and the falsified comment the record insists must not stand was
  rewritten with the change. Its acceptance clause about `CLAUDE.md` needs nothing: `CLAUDE.md`
  describes the write guard's two halves and never mentions the churn gate, so no account moved.
- **The guard-shape record's third question has live instances today.** A scan of `agents/*.md` and
  `skills/*/SKILL.md` for a guard in final position finds at least three genuine sites beyond the two
  `ac68437` fixed: `skills/circle-stash/SKILL.md` 7.2 and 7.7, `skills/circle-pop/SKILL.md` 7.4. Each
  exits non-zero when the guarded file is simply absent. Out of scope for a count scoped to one Turn;
  reported for filing.
- **`CLAUDE.md:127` carries a sentence that was already false before this task.** "In this repo the
  measurement stands down entirely, so seeing it here means the cwd was not the plugin root" — the
  measurement's stand-down has asked the workbench root, not cwd, since v6.0.1. Not touched here.

---

**Files changed**

- `bin/fusion-plane`
- `hooks/tracker.ts`, `hooks/lib/self-detect.ts`, `hooks/lib/__tests__/churn-key-anchor.test.ts`
- `hooks/dist/tracker.js`, `hooks/dist/lib/self-detect.js`, `hooks/dist/lib/self-detect.d.ts` (rebuild)
- `260810-0710_*_the-drift-checks-last-line-…md`
- `260810-1918-coderev-turn-1-range-5ef92eb-940d522.md`
- four source records closed `_o_` → `_c_`; `fusion-workbench/tasklist.md` tasks 26, 29, 34, 36 ticked
