# Closing review: migrate, a rollback cut after it landed chunks and then reset with git (13.1.6, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `e4ad6fbf..74992939`
**Not-opened:** none
**Domain:** code
**Work-item:** 261016-1951-migrate-rollback-cut-then-reset-circular-refusals
**Cross-references:** `261016-2000-plan-migrate-rollback-cut-then-reset-circular-refusals.md`, `261016-1958-is-a-rollback-fence-ended-when-the-rollback-landed-chunks-and-a-git-reset-then-took-the-tree-back-to-markdown.md`, `261016-1807-a-rollback-cut-after-its-first-chunk-then-reset-with-git-gets-refusals-that-point-at-each-other.md`, `261016-1807-reviewer-closing-pass-over-the-migrate-rollback-fence-after-reset-package.md`, `261016-2123-migrate-landed-fence-message-asserts-a-git-reset-it-never-checked.md`, `261016-2123-migrate-proposal-unverified-branch-of-the-hand-deletion-is-untested-and-undocumented.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. The helper names the hand deletion of `.json-state/maintenance.json` only in the ruled cell: a stale legacy record, this record's own fence, chunks landed, no intent, a proposal at its hash, and none of its control paths standing. My scratch probes could not make it name the deletion anywhere else. The helper itself removes nothing in that cell. Cells A, B, C and D behave as at 13.1.5. `hooks/dist/migrate.js` is the byte-exact compile of `hooks/migrate.ts`.

There are two Low findings. The situation sentence states a git reset as fact, which is false for a tree made stale by hand. The proposal-unverified branch has no test and no doc line.

## Totals

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | |
| High | 0 | |
| Medium | 0 | |
| Low | 2 | L1, L2 |

## What was verified

**The central risk: the deletion is named only at K=0 with a verifying proposal.** The way-out clause comes from `landedWay` (`hooks/migrate.ts`), and only `landedThenReset` calls it. Its callers reach it only when `landedFence` is non-null. That function needs `ownFence` (`i.state === "legacy"`, `s.rollback !== null`, fence id `=== s.rollback.begin_id`), `landed.length > 0` and `!intentStands` (that is, `i.pending === null` and `journal/` empty). Each caller also requires the record to be stale:
- `current` returns early on `shows === null`;
- `setAside` is inside `shows !== null && standing(i)`;
- `endLeftFence` checks `stale(...) !== null`;
- `preconditions` checks `stale(wb, sib, …)`.

`landedWay` then reads the proposal and requires `sha(raw) === s.proposal.sha256`. It counts the control paths with `lstat`, and only ENOENT or ENOTDIR counts as absent. It names the deletion only when the count is 0.

I built these rows in a scratch clone at `74992939`, as extra `it` blocks appended to the clone's `hooks/lib/__tests__/migrate.test.ts`. They used the real bundle, the `killPlugin()` kill at `{phase: "rollback", chunk: 2}`, a real commit and a real `git reset`. Each row ran `rollback`, `resume`, `run`, `set-aside --consent` and `rollback --end-fence`, and checked that the fence stayed byte-identical and the session stayed in place:

| Row | Tree | Deletion named | Exit |
|---|---|---|---|
| R1 | reset cell, K=0, proposal verifies | yes, all five | 5 |
| R2 | proposal removed | no, "missing or at other bytes" | 5 |
| R3 | proposal plus one byte | no, same | 5 |
| R4 | a directory at one control path | no, "1 of the 41 … stand" | 5 |
| R4b | a dangling symlink at one control path | no, "1 of the 41 … stand" | 5 |
| R5 | a non-intent file under `journal/` | no. `inspect` itself refuses (`pending-initialize-unreadable`) | 8 |
| R6 | no reset; rollback cut after chunk 2, plan index deleted by hand | no, "24 of the 41 … stand" | 5 |
| R7 | record set aside under 13.1.4, proposal removed (`run` via `preconditions`) | no | 5 |
| R7b | same, proposal back | yes, under `--session <aside>` | 5 |
| R8 | round trip: reset back to the migrated commit (`json-control`, `record=current`) | no. `rollback` exit 8 `chunk-out-of-order`, `--end-fence` generic exit 5, `set-aside` "record=current". Unchanged from 13.1.5 | 8 / 5 / 5 |

R5 did not exercise `intentStands` with a real intent directory. The codec refuses before the helper decides. Reading the code settles it instead: `landedFence` returns null whenever `intentStands` holds, so no deletion can be named.

**Cells A, B, C and D behave as at 13.1.5.** The test diff over the range touches only the "cell A reset with git" case (`git diff e4ad6fbf..74992939 -- hooks/lib/__tests__/migrate.test.ts` is one hunk). The cell A, cell B (chunk 0), cell C (both cases) and cell D cases are unchanged and green. By construction, `idleFence` is unchanged:
- old: legacy ∧ own id ∧ no pending ∧ empty journal ∧ no scheduled rollback chunk stored;
- new: `ownFence` ∧ `landed = []` ∧ `!intentStands`.

The predicates are the same. The new branches fire only where `landedFence` is non-null, which needs `landed > 0` on a stale legacy record with this record's fence. Cell C has `landed = []`, cell D fails the id, and cells A (unreset) and B are current. R8 covers cell A reset to the committed migration.

**`hooks/dist/migrate.js` is the compile.** In the scratch clone, `npm run build` left `git status --porcelain` empty.

**The suite.** In the scratch clone, `npm test` ran 1177 passed, 6 failed, 14 skipped. The 6 reds:
- the 2 known `workbench-citation-lint` findings (both 261010-1045 issue files);
- 3 `committed-dist` toolchain rows (the scratch clone has no `hooks/package-lock.json`; the build itself reproduces the dist byte for byte);
- `guard-state-shape` and `session-start-event`. These fail identically at `v13.1.5` in the same clone, because the reviewer shell exports `FUSION_CHECKOUT`. They are environmental and not in the range.

`migrate.test.ts`, `surface-growth-bound` and `reference-resolution-lint` are green. `BASELINE` was not edited in the range, so it stays 2061/371/11. `wc -c skills/migrate/SKILL.md` gives 28997. The golden moved only for `help/SKILL.md` (16046 to 16203) and `migrate.test.ts` (451 to 488 lines), with no baseline or head-room constant edited.

**The skill does not act on the deletion.** `skills/migrate/SKILL.md` `ROUTE=stale`, on exit 5, shows the stderr and stops. An agent that follows the skill relays the clause to the user and deletes nothing, which keeps option 2's "the helper itself removes nothing".

**The plan's `## Where this work stops`, clause by clause.**
- Step 1 gate held: the pin was committed first in 5531f699, and the issue's `Resolved:` line quotes it. Holds.
- Every refusal in this cell names chunk 2 and the reset, with no `set-aside --consent` and no "the tool that set it". Holds, per the test and R1.
- A record set aside under 13.1.4: named under its `--session`, without "once no rollback chunk of that record landed". Holds, per the test and R7b.
- `maintenance.json` is byte-identical before the way out. Holds.
- The decision carries the answer, and only option 2 is built. Holds. The Answered and Implemented lines stand, and the decision record is at `implemented`. The helper's own count, which withholds the deletion while any path stands, is the plan's allowed form ("the helper's own count printed in the clause").
- The way out is taken and ends at `result=json-control`. Holds.
- The option 3 rows: not applicable.
- `SKILL.md` is 28997 bytes, and the bounds are green with no baseline edit. Holds.
- `BASELINE` is unmoved. Holds.
- The dist is the compile, staged together with the source (364172a9 and bef889dd each carry both). Holds.
- The issue has a `Resolved:` line, and the suite ran after it. Holds. The issue is closed `fixed`.
- A closing review before the tag: this file.
- `plugin.json` and both pins read 13.1.6, and the help covers 13.1.6. Holds. `marketplace.json` is plan step 6, still open. It is outside this repository and due before the push.

**The consultant's note on `bin/fusion-record` and `bin/fusion-archive`. Judged: it does not matter, and no issue is filed.** The `bin/fusion-archive` sentence ("With the inventory lost, deleting `.json-state/maintenance.json` is no recovery") concerns the archive helper's own fence and inventory. A migration rollback fence is not that. The `bin/fusion-record` sentence is scoped to "the host's record of the move" and already has the exception this cell uses: "the host … restores or verifies a known complete state under the fence before removing it". Here the helper verifies a known complete state, the proposal at its hash with none of its control paths standing, before it names the deletion. The 13.1.5 idle-fence removal already relied on that same clause. The exception is stated, not hidden.

## Findings

### L1 (Low): the situation sentence asserts a git reset it never checked

`landedThenReset` (`hooks/migrate.ts`) always says "then the tree was reset to Markdown, so its plan index is gone". `landedWay` adds "nothing was written or lost". `landedFence` checks neither. Row R6 (no reset, plan index deleted by hand) got the full sentence, followed by "24 of the 41 control paths … stand, so the fence must stay". In that tree no reset happened, and rollback chunk 2's writes remain. The safety outcome is right. The account of the cause is wrong.

- Scope: the four callers `current`, `setAside`, `endLeftFence` and `preconditions`. Wording only.
- Fix direction: state what was observed, the plan index and chunk 0's answer both absent, and give the reset as the usual cause. Drop "nothing was written or lost" in the K>0 branch.
- Issue: `261016-2123-migrate-landed-fence-message-asserts-a-git-reset-it-never-checked.md`.

### L2 (Low): the proposal-unverified branch has no test and no doc line

The extended case pins K=0 and K=1 but never removes or alters the proposal. Deleting the `sha(raw) !== s.proposal.sha256` check would leave the suite green. R2 and R3 show the branch works today. Three surfaces each list three conditions for the deletion and omit "no deletion is named when the proposal is missing or at other bytes": `bin/fusion-migrate`'s header (the `rollback` entry), the `migrate.ts` row in `README-hooks.md` `## Files`, and `docs/upgrading-to-v13.md` `**Undo.**`.

- Scope: the test and the three doc surfaces. No code change.
- Issue: `261016-2123-migrate-proposal-unverified-branch-of-the-hand-deletion-is-untested-and-undocumented.md`.

## Cross-cutting observations

- One classifier (`ownFence`) now feeds `idleFence` and `landedFence`, and every message reads it. The four call sites carry no rule of their own. That matches the plan's approach, and it is why one probe row covers all five subcommands at once.
- Both findings sit in the same message pair (`landedThenReset` and `landedWay`). One small follow-up can take both.
- The K>0 branch is a dead end by design. It names no step, which is option 1's honest outcome for a tree that still carries control state. Neither finding asks for a way out there.

## Recommended sequencing

- Release blocker: none. Tag `v13.1.6` may be created. The marketplace entry (plan step 6) is due before the push.
- Cleanup: L1 and L2, together, in a later patch. Neither changes what the helper removes.
