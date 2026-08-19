# Orchestrator Session — 260818-2301

**Directive:** (not yet stated — Setup ran ahead of the user's task)
**Mode:** (not yet resolved)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| Workbench | /Users/k1/Projects/productive/fusion/fusion-workbench |
| Plugin version | 10.2.0 |
| git HEAD at start | 52b1d95 |
| Turn budget | 12 (resolved from fusion.json / defaults; no loader diagnostics) |
| Detected domain | code (code_files=98, data_files=10, counted_by=git-ls-files) |
| Active Circle | none |
| Circles | 9 closed-coherent, 1 bounded, 1 superseded; 0 anticipated, 0 active |
| Portfolio hint | not printed — no anticipated or active Circles |
| Open defect records (shared) | 87 |
| Open plan records (shared) | 0 |
| Open decision records (shared) | 3 |
| Legacy halt flag | absent |
| Permission file | .claude/settings.local.json already at bypassPermissions; Step 0g question skipped |
| Monitor binary | refreshed from the installed plugin |
| Interrupted session | none (no agentstate.yaml) |

## Turns

(none yet)

## Open decisions answered at a user gate (before any Turn)

Three open decision records were put to the user in one gate. All three were answered with the
record's own recommendation, appended an `Answered:` line citing this history file, and renamed
`_o_` → `_a_`.

| Record | Answer |
|---|---|
| `260816-1707_a_to-whom-is-the-new-workbench-tracking-rule-emitted…` | Option 1 — `rules/workbench-tracking.md` is emitted to no agent; the conventions file points at it and `/fusion:cleanup`'s archive step cites it in its own body. Unblocks the move approved in `260816-0711`. |
| `260817-1613_a_does-a-plan-stated-precondition-get-any-mechanism…` | Option 2 with option 1's honesty — the orchestrator reads `## Where this Circle stops` aloud at Phase 4 and asks; `agents/planner.md` states that the human at that gate is the whole of the enforcement. |
| `260818-2212_a_should-the-decision-records-status-field-exist-at-all…` | Option 1 — the `**Status:**` field leaves the decision-record template in two rule files; the filename marker is the only source. The 94 existing records stay as they stand. |

### Head-room measured before proposing realisation work

Taken at HEAD `52b1d95` with the baseline maps in `hooks/lib/__tests__/surface-growth-bound.test.ts`:

| Surface | Baseline floor | Measured | Remaining head-room |
|---|---|---|---|
| `agents/*.md` | 399 843 | 411 203 | 6 640 of 18 000 |
| `skills/*/SKILL.md` | 220 439 | 229 335 | 11 104 of 20 000 |

The second answer is the only one that adds to `agents/`; the first and third remove bytes from the
always-on rule set. Both growth-bound tests pass at HEAD.

## Turn 1

**Tasks:** T1, T3, T4 (commit `b200902`), T2 (commit `b54ace5`). All four done.

| Task | What landed |
|---|---|
| T1 | `rules/workbench-tracking.md` created, section moved verbatim, pointer left, fifth header-table row, cited by `skills/archive/SKILL.md`, `CLAUDE.md` Layout row. Realises `260816-1707` and unblocks `260816-0711`. |
| T3 | `## Where this Circle stops` added to the plan output format with the honesty paragraph; `agents/orchestrator.md` Phase 4 step 2b reads it aloud before the closure rename. Realises `260817-1613`, closes `260818-2343`. |
| T4 | The missing re-approval note above the `reference-resolution-lint` BASELINE, with a per-file measurement taken in a detached worktree at `52b1d95` with `agents/*.md` held at HEAD. |
| T2 | `**Status:**` out of the decision-record template and the worked example, with the position on existing records stated. Realises `260818-2212`, closes `260811-2146` and `260812-1232`. |

**Decisions realised this Turn:** `260816-1707`, `260816-0711`, `260817-1613`, `260818-2212` — all `_a_` → `_i_`.

### Three orchestrator errors, recorded because they cost time

1. **Parallel dispatch on a shared test corpus.** T1 and T3 were dispatched concurrently and each was told to run the full suite. Both suites went red on the other's in-flight edits, T3 reported itself blocked, and its verification had to be re-run on the settled tree. The file scopes were disjoint; the *verification* was not.
2. **A glob that caught a bystander.** `mv 260816-1707_a_*` renamed a second, unrelated record sharing the timestamp prefix. Reverted, body untouched, git records no change to it. Later transitions were written out by full filename.
3. **A wrong claim in a dispatch prompt.** The T4 brief explained `hooks/lib/staging-drift.ts`'s zero contribution as "a bare file path was already a counted token". False: `hooks/lib/*.ts` is scanned `recordsOnly`, so classes (a) and (b) are never read there. The executor checked rather than transcribed, and said so. Verified at `reference-resolution-lint.test.ts:176,656-657`.

A fourth belongs to the executors and is filed: T3 used `git stash`/`pop` while T1 was writing (`shared/issues/260819-0001_o_*`).

### Review

`coderev`, range `52b1d95..b54ace5`, both commits now covered. Eleven findings, ten filed as records
(`260819-0038` … `260819-0042`) plus an `Also seen:` line on `260819-0028`.

The High finding is that `skills/archive/SKILL.md:11` asserts "This skill reads
`rules/workbench-tracking.md`" and no step in its process does. That sentence is the *positive
reason* decision `260816-1707` gave for allowing a third no-agent rule file, so the answer was
realised as a claim rather than a mechanism. The decision's own Cons column named the risk. Verified
independently: the file appears twice more in the skill, both times as a parenthetical citation.

The review also found the always-on byte figures this session quoted (98 874 → 95 458 → 96 277) are
the `[analyst]` dispatch total, not the always-on floor; on `CLAUDE.md`'s own definition the floor ran
101 393 → 97 977 → 98 796. Same deltas, wrong label, and the same class as open issue `260816-1345`.

## Turn 2

**Tasks:** U1, U2, U3 concurrently on disjoint file sets, then U4 as a consolidation pass. All four
done, one commit. Ten of the eleven Turn-1 review findings closed, plus `260816-1051`, which an
executor found in a sentence it was already rewriting and left rather than taking uninstructed.

**The dispatch method changed after Turn 1's failure, and the change is the point.** Turn 1
dispatched two executors on disjoint *file* sets and told each to run the full suite; both suites
went red on the other's in-flight edits, and one executor reached for `git stash` to measure a delta,
reverting the whole tree to HEAD while the other was writing. Turn 2 kept the disjoint file sets and
added two constraints: **no executor runs the suite**, and **no executor writes a shared pinned
constant** — each measures its own contribution and reports it. U4 then re-measured per file, wrote
`{1156, 149, 102}` once with a note attributing all eight figures, and found they sum to the
whole-tree total exactly. Three agents had independently declined to write that constant, one of them
stating the reason unprompted: three writers of one number leave the last writer's figure standing.

**Two executors corrected their dispatch rather than following it.** U1 was told to add the fifth
rule file to a README enumeration with an "emitted to no agent" qualifier; it found that three of the
five are emitted to no agent, so the qualifier would have implied a contrast that does not exist, and
wrote what the partition table supports. U3 was asked to judge whether the `**Status:**` removal needs
the three migration surfaces its Circle-record twin got, and declined to write any: v10.2.0 is tagged
on an ancestor, so the removal is in no released version, and both available moves state something
false — a v10.2 note tells an installed base it carries a change it does not, and a v10.3 note names a
version number nobody has chosen. That finding stays open as the carrier for a release-time check.

**One defect was introduced and caught inside the Turn.** U1's new Step 1 block used `SRC` as a root
variable; `ROOT_VARS` in `reference-resolution-lint.test.ts` does not declare it, so the citation was
an unclassified-root violation. U2 found it while measuring its own zero contribution and reported it
as not its own. U4 renamed it to `FUSION_SRC`, the name that already exists for that value, rather
than declaring a synonym beside it.

**Verification:** `cd hooks && npx vitest run` — exit 0, 36 files, 672 tests, run by U4 on the settled
tree and again by the orchestrator before committing.

**Byte movement.** Always-on floor 98 796 → 98 733 (U3's two folds, both net negative).
`agents/` +766 (head-room 4 069 → 3 303). `skills/` +750 (729 for the read instruction, 21 for the
rename). No baseline moved; both goldens regenerated after all four tasks landed, never before.
