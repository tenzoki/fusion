# Closing review: migrate, a rollback fence after a git reset, and the two set-aside messages (13.1.5, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `39624096..e4ad6fbf`
**Not-opened:** none
**Domain:** code
**Work-item:** 261016-1431-migrate-rollback-fence-after-reset-and-set-aside-messages
**Cross-references:** `261016-1438-plan-migrate-a-rollback-fence-after-a-git-reset-and-the-two-set-aside-messages.md`, `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`, `261016-1052-reviewer-closing-pass-over-the-migrate-step-7-stale-session-package.md`, `261016-1807-a-rollback-cut-after-its-first-chunk-then-reset-with-git-gets-refusals-that-point-at-each-other.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. I could not get the new legacy branch of `rollback --end-fence` to remove a fence that guards a real rollback (cells A and B) or a fence from another owner (cell D). That includes the cells the shipped tests do not build. The committed `hooks/dist` is the byte-exact compile of the source. The suites in scope are green, and no baseline, head-room or `BASELINE` was edited.

One Low finding: a sixth cell, a rollback cut after its first chunk and then reset with git. There the refusals point at each other. The fence is correctly kept, and at 13.1.4 this cell was a dead end too.

## Totals

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | |
| High | 0 | |
| Medium | 0 | |
| Low | 1 | L1 |

## What was verified

**The central risk: the legacy branch ends no fence it must not end.** `endLeftFence` (`hooks/migrate.ts`) takes the legacy branch only when all of these hold:
- `i.state === "legacy"`;
- `stale(...) !== null`;
- `idleFence` is non-null. That needs the fence id to equal `s.rollback.begin_id`, `i.pending === null`, an empty `journal/`, and no `s.schedule.rollback` id under `ops/`.

It then also refuses on `write.lock`, and unless the fence file still re-reads as exactly `{operation_id, since}` with both values equal to `inspect`'s.

I ran these cells against the real bundle, in a scratch copy of `e4ad6fbf` (probe cases appended to a scratch copy of `migrate.test.ts`, not the live file):

| Cell | How it was built | `rollback --end-fence` | Fence bytes | Afterwards |
|---|---|---|---|---|
| A, legacy, not reset | shipped case "cell A", kill at rollback chunk 2 | exit 5 | identical | `rollback` gives `result=legacy` |
| A, committed then reset | shipped case "cell A reset with git" and my probe P1 | exit 5 | identical | see L1 |
| B, chunk 0 answered, `end` not sent, without and with commit-and-reset | probe P2, kill at `{phase: "rollback", chunk: 0}` | exit 5 both times | identical | `rollback` gives `result=legacy` both times |
| C plus any `journal/` entry | probe P3 | exit 8 (`inspect` refuses the stray intent) | identical | nothing removed |
| C, fence of another id | shipped case | exit 5 | identical | |
| D, a `maintenance begin` through `bin/fusion-record` | shipped case "cell D" | exit 5 | identical | `fence=` names the foreign id |
| C, non-default `--session` | probe P4 | exit 0 | removed | the note names `set-aside --consent --session <dir>, then run` |

Why it holds. A real rollback reaches a legacy tree only by storing a scheduled rollback chunk (the first after activation removes the manifest), or with one in its intent, which sets `i.pending`. Both fail `idleFence`. A race on the unlink needs a codec mutation that lands on a legacy store under this fence. The only one that applies is a further rollback chunk of this record, and `rollback` refuses a stale record in `current()` before sending anything.

One observation on the decision text, not a defect. The ruling's pro for option 1 says that on a legacy store the codec refuses every mutation except `plan` and the chunk-0 `end`. Cell A shows the codec also admits the remaining rollback chunks on a legacy store. The conclusion still holds, for the reason above, and the header of `hooks/migrate.ts` does not repeat the claim.

**dist is the compile.** `npm run build` in a scratch copy reproduced `hooks/dist/` byte-identically (`diff -r` empty), `migrate.js` and `migrate.d.ts` included.

**Tests.** `npx vitest run` over `migrate.test.ts`, `store-name-migration.test.ts`, `committed-dist.test.ts`, `surface-growth-bound.test.ts` and `reference-resolution-lint.test.ts`: 5 files, 108 tests, all passed. I did not rerun the whole hooks suite. Its two `workbench-citation-lint` findings are pre-existing, per the dispatch.

**Messages name the command that works.** `command()` adds `--session` exactly when the session is not `sessionDir(wb, undefined)`. `current()`, `setAside`, `endFenceWay` and the write-lock refusal use it. `preconditions` uses it with the set-aside directory, which is never the default. Probe P4 shows every message under a custom session carrying `--session <dir>`. The rolled-back branch of `setAside` names `run` (pinned by test). One cosmetic point: the `note=` line of the legacy branch builds `set-aside --consent[ --session …]` by hand, without the `bin/fusion-migrate` prefix that `command()` gives. As a `KEY=value` line that is defensible, so I filed nothing.

**Step 7 matches the helper.** The `ROUTE=stale` line in `skills/migrate/SKILL.md` runs `set-aside --consent`. On exit 0 it runs the survey block again. The cell C case runs the shipped `**Survey.**` block and gets `ROUTE=stale`, then `ROUTE=survey` after the set-aside. On exit 5 it shows the stderr. That holds for cell C. It does not hold for L1's cell, whose stderr names no working step. The line covers exits 0 and 5 only. `set-aside` can also exit 8 when `inspect` refuses (probe P3) or 7. Showing the stderr is the obvious reading, and the file stands at 28 997 of 29 000 bytes, so I filed nothing for that.

**Release surfaces for 13.1.5.**
- `.claude-plugin/plugin.json`, `install.sh` and `README.md` read 13.1.5. `grep 13.1.4` finds no stale pin in them or in `README-agents.md`.
- The help paragraph is relabelled "Coming from 13.1.4 or earlier" and "13.1.2 to 13.1.5". Its 13.1.5 sentence names `rollback --end-fence`.
- `docs/upgrading-to-v13.md` `**Undo.**` no longer promises that a re-run continues.
- The marketplace entry is outside this repository and I did not check it. Plan step 7 owes it before the push.

**No bound was edited.** The diff touches neither `surface-growth-bound.test.ts` nor `reference-resolution-lint.test.ts`. `BASELINE` stands at 2061/371/11, and the lint passed against it. Only the measured golden moved: `migrate/SKILL.md` 28998 to 28997, `help/SKILL.md` +187, `migrate.test.ts` 340 to 451. Those figures sit inside the bounds the test applies.

**The previous review's findings.** The two issues of `261016-1052-reviewer-closing-pass-over-the-migrate-step-7-stale-session-package.md` are closed as `fixed` in fb8b4515. I checked each `Resolved:` line against the code and the tests. M1, the idle fence, is ended by the legacy branch and pinned by two cell C cases. L1, the `--session` on the stale refusal and `run` for a rolled-back record, is pinned by test. L3 is the reworded doc comment of `stale()`, and it is in place. L2, the survey block run again, is pinned in `store-name-migration.test.ts` case (i).

## Findings

### L1: a rollback cut after its first chunk, then reset with git, gets refusals that point at each other (Low)

Issue: `261016-1807-a-rollback-cut-after-its-first-chunk-then-reset-with-git-gets-refusals-that-point-at-each-other.md`.

The decision's table puts cell A at `record=current`. With the migration committed and then reset, the plan index leaves with the reset and `stale()` reads stale. The shipped test pins exactly that. Probe P1 got these answers:
- `rollback`, `resume` and `run` name `` `bin/fusion-migrate set-aside --consent` `` as the way out (`current()`).
- `set-aside --consent` refuses: "the tool that set it closes it" (`setAside`, the non-idle branch).
- `rollback --end-fence` gives its generic refusal.

So the messages loop. The fence is kept byte-identical, which is the safety property this package must hold. The defect is only that no message names a working step, while Step 7's line now promises that the exit-5 stderr names "the way out".

Scope: `hooks/migrate.ts` `current()` and `setAside()`, and the one test case. Fix direction: in that cell, stop naming `set-aside` and name the situation. Whether to offer a round trip through git is a question for the planner to put as a decision if needed.

## Cross-cutting observations

- The decision's cell table assumed the plan index survives in cells A and B. A git reset removes it in both. Cell B survives because `stale()` also accepts chunk 0's stored answer. Cell A has no such second witness. L1 is that gap.
- The guard sits in one function, `idleFence`, as the plan asked. `setAside`, `current()` and `endLeftFence` all read it, so the messages cannot drift from the removal condition.

## Recommended sequencing

- Before the tag: nothing from this review. Plan step 7, the marketplace entry, is still owed before the push.
- Cleanup: L1, in a later patch.
