# Reconciliation 260831-0159

**Domain:** code
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Session:** `260830-1801-orchestrator-session.md` (Phase 3, final)
**HEAD:** `6f3f7dd6`, session anchor `cda72f71`, 14 commits, 5 Turns
**Predecessor:** `260830-2254-reconciliation.md`, which covered the session's first plan only

The second and final reconciliation of this session. The first ran at 260830-2254 over the seven
steps of the citation-defect repair and returned `directive-partially-met` on one unbuilt item. The
user then answered that item and asked for the regression guard, a second plan ran to completion in
six steps, and this pass covers everything since and closes the session.

## What was read

Every live record in the three shared stores the resolver names for this agent, plus every record
either plan cites and every record the dispatch named. `bin/fusion-cadence-anchor changed-files` was
called under its `[ -x ]` guard and exited 4, so no delta bound was available and the inventory was
taken over the full stores rather than over what moved. No Circle is active, so every store resolves
to the shared one and no Circle store is in scope.

| store | read | changed by this pass |
|---|---|---|
| planning | 3 | 2 |
| issues | 31 | 1 |
| decisions | 74 | 0 |
| reviews | 34 | 0 |
| history | skimmed, 15 most recent in full | 1 written |

## Verification readings at HEAD

All four were run at HEAD rather than carried forward from a step history.

| reading | result |
|---|---|
| `cd hooks && npm test` | exit 0, 47 files, **818 tests passed** |
| `bin/fusion-citation-check` | `files=2410 declared-patterns=3 declared-files=45 tokens=22536 judged=17942 resolved=17257 dangling=313 store-prefixed=0 undecidable=3196 exempt=1770 verdict=violations` |
| `bin/fusion-citation-sweep --dry-run` | `files=0 rewrites=0 residual=2822 record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=dry-run` |
| `bin/fusion-review-coverage --since cda72f71` | `commits=14 reviews=87 unusable=24 uncovered=14 verdict=uncovered` |

`declared-patterns=3` and `declared-files=45` match the second plan's step-4 prediction exactly.
`store-prefixed=0` and `rewrites=0` are the two figures the release gate pins and neither moved.
`verdict=violations` did not move either, and it is not a regression: of the 313 dangling rows, 65
are the archive rows the corpus widening of `32fe0d49` brought in and exactly **one** sits in a file
this session wrote. That one is the permanent condition already filed as
`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`:
the orchestrator's session history names the consuming project's own source record, and no citation
form fusion accepts can express a record held in another project's workbench. Every other row outside
the archive predates the session.

## Plans

### `260830-1841_*_citation-mechanism-four-defect-repair.md`: `_p_` to `_c_`, Status Complete

Closed by this pass. The 260830-2254 pass withheld this rename over one stopping clause: the
checker's figures had to be in the session history and were not. The orchestrator wrote them at
Phase 3, under `## Checker and sweep figures at the last commit`, so the clause holds and the rename
becomes correct. Seven of seven steps were verified against the tree by the earlier pass and nothing
in the tree has moved under them since.

Eight clauses and one non-clause. Seven hold, and clause 8 stays deliberately unmet: the
review-coverage precondition binds a release, no release was cut, and nothing waives it. The
non-clause holds in one half and has been overtaken in the other:
`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`
is still `_o_` as written, while its companion on the same line has since been answered and built.

### `260831-0024_*_a-project-declares-its-citation-bearing-paths.md`: `_c_` confirmed

Six of six steps `[DONE]`, each verified against the tree and each with its own commit. Ten stopping
clauses: nine hold, and one was unmet at the closing commit.

**The finding, and it is bookkeeping rather than drift.** Clause 6 asks that the checker's six
figures be recorded in the session history at the plan's last commit. They were in no session
history when the plan was renamed to `_c_` at `6f3f7dd6`: the orchestrator's file carries a figures
table for the predecessor plan's range only, at `cda72f71` and `7be624e7`. The closure was premature
by the plan's own bounds. This pass writes the six figures into the orchestrator's session history
inside the `## Coherence` section it is authorised to append, so the clause is met there rather than
left open, and **the marker is not moved back**: reverting `_c_` to `_p_` for a condition met inside
the same close would be churn, and the fact is more useful recorded than enacted. The step tables and
the clause-by-clause reading are in the plan's own Reconciliation Log.

Clause 9 carries two release preconditions and both stand unwaived, because no release was cut. The
review-coverage figure is in the table above. On the second: the last tag is `v10.20.0` at
`89f67d66`, which predates the session anchor, no tag points at HEAD, and `.claude-plugin/plugin.json`
still reads `10.20.0` at HEAD as it did at `cda72f71`. This work is unreleased rather than released
untagged, which is the condition the clause is about.

## Records

Every record the dispatch named was verified in the tree, and no stamp-and-slug pair carries two
markers anywhere in the live workbench.

**Implemented (`_i_`), each carrying an `Implemented:` line that cites what realised it:**
`260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md`
(cites `32fe0d49`),
`260830-1841_*_where-may-a-store-prefixed-citation-begin-and-which-rooting-forms-does-the-grammar-name.md`
and
`260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`
(each cites a `path:line`, which the conventions offer as an alternative to a hash),
`260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md`
(cites the three commits of the second plan) and
`260831-0032_*_which-mechanism-enumerates-a-declared-citation-path-and-what-happens-where-git-will-not-answer.md`
(cites step 2's commit, and carries its `Answered:` line as well).

**Closed (`_c_`), each carrying a `Resolved:` note:**
`260831-0015_*_the-sweeps-guard-a-does-not-check-that-an-extra-path-argument-is-tracked.md`,
`260831-0031_*_four-documented-surfaces-still-describe-the-citation-corpus-and-sweep-guard-the-repair-replaced.md`
and
`260831-0038_*_the-answered-non-markdown-decision-carries-a-store-prefixed-token-that-reddens-the-citation-gate.md`.

**Open on purpose (`_o_`), left as they stand:**
`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`,
`260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`,
`260831-0033_*_does-the-sweeps-test-fixture-skip-survive-a-project-declaring-its-own-citation-bearing-paths.md`,
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`,
`260830-2247_*_the-repair-pass-cannot-undo-the-splice-damage-the-unanchored-store-strip-produced.md`
and
`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`.
The first three are residuals both plans named as not stopping conditions; the last three are defects
found beside the work rather than clauses of the Directive. None has an answer anywhere in the
analysis, planning or decision stores.

**One open issue the dispatch did not list, and it is not new to this pass:**
`260830-1845_*_staging-drift-does-not-name-asset-provenance-as-live-state-while-its-sibling-marker-is.md`,
filed during the session and untouched by either plan. It stays `_o_`. Two further shared issues were
open before the session and remain so, and neither is this session's:
`260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md`,
`260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md`,
`260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md`
and
`260828-1041_*_a-coder-dispatch-wrote-its-history-entry-to-shared-history-at-the-project-root.md`.

Nothing was misfiled. No issue turned out to be a decision and no decision turned out to be a defect,
so this pass writes no misfiled-record section.

## The citation trap

`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
was appended to with reconciliation evidence and stays `_o_`. Its own evidence heading reads three
instances by three writers, which was true when it was filed mid-session; the session closed at six
by four writers, the orchestrator twice and the reconciler once. The append cites each later instance
by how it is known, because this pass verified only two of the three later ones from the tree and
takes the other on the orchestrator's report. Nothing in the tree moved toward the record's
acceptance test: the exemption chain still keys on the one substring, and the four commits that
edited that file this session left it alone deliberately.

**No seventh instance was produced by this pass.** The blocking gate was run after every append and
reads 13 tests passed; the reporting checker at HEAD names no row in any file this pass wrote or
edited. Two forms in the appended text were deliberately not spelled: the marker letters are written
as the wildcard throughout, and the one place a bare stamp would have been the natural shorthand
names the reconciliation file by its full markerless basename instead.

## Review coverage

**Range:** `cda72f71..6f3f7dd6`, 14 commits.
**Covered:** none. No review file declares a range containing any of them.
**Not covered:** all 14.

```
6f3f7dd6  docs(decisions): the declared-paths work is recorded, and the plan closes
bb934a4f  docs: the configuration has two settings, and four descriptions catch up with the code
ebcbe525  feat(citations): fusion declares its own code surfaces, and guard (a) asks whether an extra path is tracked
5fd6bfab  feat(citations): the checker and the sweep read the paths a project declares
c08f70a5  feat(config): a project can declare which non-Markdown paths carry record citations
06b5aac1  docs(planning): the declared-paths extension is planned, and one red gate is repaired before it ships
7be624e7  docs(analyses): the report to the consuming project, and the repair gap it exposed
5907b4ae  test(sweep): no rewrite may turn a token the checker reports into one it cannot see
4412fc4a  docs(decisions): the frozen-stores question is answered, and the residual is cut where the measurement puts it
32fe0d49  fix(citations): the reporting checker reads the corpus the sweep rewrites
4cffcae4  fix(citations): a bracket-marked citation is read whole, and no rewrite may escape the grammar
cbc1d9fb  fix(citations): a store-prefixed citation begins at a boundary and carries its own rooting
d2e90ba9  fix(sweep): guard (a) asks whether a pending change touches what this run reads
94908036  chore(workbench): the citation-defect repair is planned and its two load-bearing choices are answered
```

**No review pass ran in this session at all**, and no Circle was active whose closure would have
triggered one. The helper also reports `unusable=24`: 24 of the 87 review files declare no usable
range, which is a standing property of the older corpus and not this session's. Both plans carry the
same precondition on any release that ships this work, and it is unmet and unwaived. Whether the
range may stay uncovered is the user's call, settled as advisory by
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`; the orchestrator
puts it to the user.

## Two things outside this repository, taken on report

The dispatch names two commits in the consuming project: `4f8aab36`, which repaired 158 citations
across 89 files with the shipped sweep and no fusion change, and `69fef330`, which declared 14 globs
covering the 193 files that carry repairable citations, with 164 build-output files and 4 fixture
files deliberately outside. **This pass verified neither.** They are in a tree this reconciler cannot
read, and they are cited below as reported rather than as checked. They matter to the verdict because
together they are the evidence that the Directive's purpose clause is met, so the label is on them
rather than left to be inferred.

## Nothing filed

This pass found no defect the session had not already filed, so no new issue was written. The two
conditions it names, the premature closure at the second plan's clause 6 and the unmet release
preconditions on both plans, are recorded in the plans and in the session's `## Coherence` section,
and neither is a defect in the tree.

## Not drift, recorded so it is not read as drift

`fusion-workbench/agentstate.yaml` reads `current_task: (none)` with the queue converged and every
entry `done` with a commit, which is current. Its `control.turn_start_head` still names `06b5aac1`,
the anchor of the last Turn rather than of the session, which is what that field is for. The file is
session state at the workbench root, written by the orchestrator, and outside this agent's edit
scope; the orchestrator closes it at Phase 4.

`git status --porcelain` lists one modified path, `fusion-workbench/orchestrator-events.jsonl`. That
is the machine-written event log, appended to by the hooks while the session runs, and it is the
in-flight class rather than a staging fault.

## What this pass left on disk, and the index it left empty

For the orchestrator's staging list. The paths are fenced because a full workbench path to a record
is the store-prefixed shape the gates report, and these are a file list rather than citations.

```
 M fusion-workbench/shared/history/260830-1801-orchestrator-session.md
 M fusion-workbench/shared/issues/260830-2235_o_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md
 M fusion-workbench/shared/planning/260831-0024_c_a-project-declares-its-citation-bearing-paths.md
 D fusion-workbench/shared/planning/260830-1841_p_citation-mechanism-four-defect-repair.md
?? fusion-workbench/shared/planning/260830-1841_c_citation-mechanism-four-defect-repair.md
```

The last two lines are the one marker rename this pass made, and both halves are named so the
staging list can carry them together. `fusion-workbench/orchestrator-events.jsonl` is also modified
and is the machine-written in-flight log, not this pass's work.

**The index is empty.** The rename was made with `git mv` and then unstaged with `git reset` against
the two paths, working tree untouched, because
`260824-2013_*_how-is-a-marker-rename-performed-and-staged-and-by-whom.md` was answered on 2026-08-29
as option 5: a marker rename is `mv` and only the orchestrator stages. That record sits in a terminal
Circle's own store, so it is outside this agent's resolved scan set and was reached through the plans
rather than through the inventory. It is `_a_` rather than `_i_`, and the tree agrees:
`rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` still says only that
a state change is a rename, with nothing about who stages it. Not filed as a defect, because an
answered decision awaiting realisation is exactly what `_a_` means.
