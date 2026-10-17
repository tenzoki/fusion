# Closing review: the end-fence docs' entry-path conditions (fusion 13.1.11)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `2615df08..c239cdd6`
**Not-opened:** none
**Review domain:** code
**Work-item:** `261017-1659-migrate-landed-cell-docs-entry-path-conditions`
**Verdict:** accept. Three Low findings, each filed as an issue. None blocks the tag.

## Summary

The release changes only comment lines of `bin/fusion-migrate` and docs. It moves no code line, and the usage block is unchanged. The rewritten sentences hold in every cell of the plan's trace except one: the JSON-control branch of `rollback --end-fence` over a stale record of this workbench. The plan's cells table lists that cell as C7, but its claim check leaves it out. The `migrate.ts` row's refusal claim excepts only the legacy fence removal, so it is false there. The Undo paragraph's environment bound is narrower than the header's. The release surfaces are coherent.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 3 |

## How this pass checked

- I traced every subcommand from the wrapper's first line to each message, in `bin/fusion-migrate` and `hooks/migrate.ts` at `c239cdd6`, without relying on the plan's trace. The plan's prefix P1 to P8, its R1, R2 and E1 to E5, and its S1 to S7 and U1 to U8 match the code.
- I tested each rewritten sentence against the cells C1 to C10. I also tried cells neither table enumerates: a write lock (E2a), a journal-only intent with no codec-reported one, a codec-reported intent with no fence, a current record over a legacy tree with its own fence, a JSON-control stale record with an intent (C6 under JSON control), and a refused `inspect`.
- Every test ran in a scratch clone: `npm test` in `hooks/` is green apart from the two known `workbench-citation-lint` findings. `committed-dist` was green too, once the lockfile was supplied, which the clone lacks.
- In each of the three files, the multiset of backticked tokens equals `2615df08`'s.
- `bash -n` exits 0, and the no-argument usage output is byte-identical to `2615df08`'s.
- In the diff of `bin/fusion-migrate`, every changed line is a comment.
- `grep "before the reset"` finds nothing. "an intent the codec reports as pending" appears twice in `README-hooks.md`.

## Findings by theme

### The stale-record refusal claim, against the JSON branch of `rollback --end-fence` (Low)

The `migrate.ts` row of `README-hooks.md` `## Files` (line 235) says a stale record of this workbench "is refused by `run`, `resume` and `rollback` before any write, the fence removal of the --end-fence form below aside". The only --end-fence text below it is the removal over a legacy tree. In `hooks/migrate.ts` `endLeftFence`, the JSON branch needs `s.rollback`, a JSON-control tree, the record's own fence and the last rollback chunk not stored. It does not check `stale`. `stale` reads a record with `s.rollback` set as stale under JSON control when its plan index is missing or at other bytes and rollback chunk 0's answer is absent. The codec admits `end` naming the standing fence (`codec/README.md`, the `maintenance` table). So `rollback --end-fence` there sends `maintenance end`, writes `state.json` and exits 0. That is neither a refusal nor "before any write".

The header's `set-aside` entry (`bin/fusion-migrate` lines 92 to 96) uses the same narrow phrase, "the fence removal of --end-fence above aside". Read literally, it is false in the same cell. Read generously, the entry above also describes the JSON end. Two lines later the same entry names the same exception as "the --end-fence form excepted". That is two names for one exception in one sentence pair.

The plan's cells table has this cell (C7: "E4 if the last rollback chunk is not stored"). The implementer's note that C6 overlaps C7 under JSON control is right, and it matters here. But the plan's claim check says the refusal claim "holds for all three, with the --end-fence form excepted for C4". The Undo paragraph and the `bin/fusion-migrate` row of `README-hooks.md` except the whole form, so they hold.

Reach: the cell needs a git operation, or a hand edit, that keeps JSON control but drops or changes this migration's plan index while the ignored fence file stays. That is inference from the code. I did not reproduce it.

Fix: except the whole form in both places ("the --end-fence form aside"). Filed as `261017-1747-migrate-refusal-claims-except-only-the-legacy-fence-removal-where-end-fence-also-ends-a-json-fence-over-a-stale-record.md`.

### The Undo paragraph's environment bound (Low)

"This and each refusal below hold once the helper runs and its codec answers" has two gaps.

1. A codec refusal is an answer. `send` turns a refused `inspect` into exit 8, and the plan's own trace says `inspect` is refused over unreadable journal data. Then `status` says nothing, and `set-aside` renames nothing. The header's bound says "answers and admits", which covers this.
2. The bound covers "this" and "each refusal". The paragraph's other promises are outside it: the skill "says so and offers", set-aside "renames the session directory", and the skill "then surveys again". `skills/migrate/SKILL.md` stops on any non-zero `status` exit.

Fix: one bound over the whole paragraph, saying "answers and admits". Filed as `261017-1747-migrate-undo-note-environment-bound-covers-only-status-and-refusals-and-omits-a-codec-refusal.md`.

### Release procedure: where the review-coverage result goes (Low)

`README-agents.md` `## Releasing` step 0 says to state the `bin/fusion-review-coverage` result "in the release commit or the session log". The session log no longer takes writes (`rules/fusion-workbench-conventions.md` `## Session history`). The release commits of 13.1.8 to 13.1.11 do not state the result. Those of 13.1.6 and 13.1.7 do. The 13.1.11 plan sent the result to the executor's report, which nothing persists. In a scratch clone, `--since v13.1.10` gives `verdict=uncovered` for all five commits until this review lands. Filed as `261017-1747-releasing-step-0-names-the-closed-session-log-for-the-review-coverage-result-and-four-release-commits-omit-it.md`.

## Sentence by sentence: what holds

- **Header A** (the bound after "git is required too, and is asked."): holds. Exit 3 covers the throwing reads, and 7 and 8 cover the codec.
- **Header B** (the first sentences of the `rollback --end-fence` entry): holds. `recorded` runs before `inspect`, both for a missing record and for one of another path. On JSON control, the fence a refused first chunk left meets E4, and the codec admits its `end`. The idle and landed sentences are byte-identical. With the session bound, the landed sentence holds by E3, and the idle sentence by its "only when" form.
- **Header C** (`set-aside`): "never over an existing directory" matches S6. "Name this" holds for `run`, `resume` and plain `rollback` wherever `landedFence` is null, which is every cell inside the premise. "An intent the codec reports as pending" matches `standing`. "The fence removal ... aside": see the first finding.
- **README `migrate.ts` row**: the other-path parenthesis is exact (C9, C10). "Where they send" bounds `resume` and `rollback`. The idle clause is the ruling's "only when" list behind the session bound. The landed clause holds under "for such a session". The refusal claim: see the first finding.
- **README `bin/fusion-migrate` row**: holds. It excepts the whole form, and "only when" is a necessary claim.
- **Undo paragraph**: "can restore ... only while" holds. The record-of-this-workbench refusal holds, since it excepts the whole form. "Refuses to set the record aside" holds in every cell where a fence stands (S3, S4). The pending-intent clause matches `intentStands` in both `landedFence` and `idleFence`, and the message names no command for the fence. The `--end-fence` clause is bounded by "once that command's own checks pass", which also absorbs R2 and E2a. The landed sentence is byte-identical. The bound: see the second finding.

## Readability

The sentences can still be used, but the `migrate.ts` row is now 2 606 bytes in one table cell, against 2 001 at `2615df08`. Its middle clause stacks an absolute phrase ("the fence removal ... aside") on a parenthesis ("of another workbench path: ..."). "Which removes the fence once that command's own checks pass" in the Undo paragraph is nearly empty. A reader learns no condition from it, though it is true. The header's `set-aside` entry asks the reader to resolve "name this" and to match two differently worded exceptions. The fix for the first finding also removes that mismatch. None of this is a defect on its own, so none of it is filed.

## Release surfaces

- `plugin.json` 13.1.11, the `install.sh` and `README.md` pins at `tags/v13.1.11`, and the uncommitted marketplace entry at 13.1.11, which parses as JSON and changes only `version`.
- The two descriptions are equal.
- The help paragraph reads "Coming from 13.1.10 or earlier" and "13.1.2 to 13.1.11 need no migration", with a 13.1.11 sentence, per step 0's join rule. It is true for this release.
- The golden records `help/SKILL.md 16606`, equal to the file, and a total 80 bytes higher.
- The two `261017-1637-…` issues in container 261017-1605 carry their `Resolved:` lines and stand `closed` with disposition `fixed`.

## Cross-cutting observations

- The five rounds keep failing in the same way: a cell the analysis lists is dropped when a claim is checked against it. This time the table had C7, and the claim check skipped it. A claim check that names, for each sentence, every row of the cells table it was tested against would have caught it.
- The two exception phrasings ("the --end-fence form aside" and "the fence removal of the --end-fence form aside") are used side by side for one exception. Only the wider one is true everywhere.

## Recommended sequencing

No release blocker. Tag `v13.1.11` as planned. The two docs findings fit one follow-up patch that touches no code. The release-procedure finding is a one-line wording edit to `README-agents.md`, and the next release should state the coverage result in its commit or tag annotation.
