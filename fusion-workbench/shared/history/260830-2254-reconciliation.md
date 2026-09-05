# Reconciliation — 260830-2254

**Status:** Complete
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Session:** `260830-1801-orchestrator-session.md` (Phase 3, final pass)
**HEAD:** `7be624e7`, session anchor `cda72f71`

## Scope

`bin/fusion-cadence-anchor changed-files last_reconcile_commit` exited 4, so no proven bound was
available and the pass read every live record in all five shared stores rather than a delta.
No Circle is active; `bin/fusion-paths reconciler` resolves every store to `shared/`.

## Counts

| store | records read | updated |
|---|---|---|
| planning | 2 | 1 (`260830-1841_*_citation-mechanism-four-defect-repair.md`, log appended, marker unchanged) |
| issues | 28 | 0 renamed, 1 filed |
| decisions | 72 (38 active: 8 `_o_`, 30 `_a_`) | 0 |
| reviews | 30 | 0 |
| history | 30 | 1 appended (`## Coherence` on the orchestrator's session file) |

## Verification runs

Both at `7be624e7`, working tree carrying one modification, `fusion-workbench/orchestrator-events.jsonl`,
which is the class-R2 row `bin/fusion-commit-lock` appends after every commit.

```
cd hooks && npm test        47 files, 806 tests passed, exit 0

bin/fusion-citation-check   files=2350 tokens=22206 judged=17672 resolved=16990
                            dangling=311 store-prefixed=0 undecidable=3157
                            exempt=1748 verdict=violations

bin/fusion-citation-sweep --dry-run
                            files=0 rewrites=0 residual=2784 record=0
                            circle-record=0 circle-dir=0 bare-record=0
                            stamp-bare=0 mode=dry-run

bin/fusion-review-coverage --since cda72f71
                            commits=8 reviews=87 unusable=24 uncovered=8
                            verdict=uncovered
```

`dangling=311` and `store-prefixed=0` are the figures the plan's step 4 predicted. `files` reads
2350 against the predicted 2332; the difference is the records filed since that measurement.
`rewrites=0` is the figure the release gate pins and it did not move.

## What the pass found

**Nothing claimed done was undone.** All seven plan steps carry `[DONE]` and every one was read
against the tree rather than against its own history file. The evidence per step is in the plan's
own `## Reconciliation Log`, appended by this pass, and is not repeated here.

**One acceptance criterion was re-run live rather than trusted.** With
`fusion-workbench/orchestrator-events.jsonl` the only modified path,
`bin/fusion-citation-sweep --write` exits **5** (guard (b), no `--yes`) and writes nothing. At
`cda72f71` the same call exited 4 on guard (a). Defect 4 is repaired and demonstrable at HEAD,
which is the one repair whose effect is visible from outside the test suite.

**One stopping clause of eight is unmet, and it is bookkeeping rather than work.** The checker's
figures are not recorded in the session history: `260830-1801-orchestrator-session.md` ends at
`## Turn log` with `(pending)` and its `**Status:**` reads `In progress`. That file belongs to the
orchestrator, so the clause is met by the orchestrator's own Phase 3 close, not by this pass.

**The plan's marker was deliberately left at `_p_`.** The reconciler's default is "all steps
`[DONE]` → rename to `_c_`". This plan wrote its own stopping section, which is the stricter
instrument, and one of its clauses is open. The rename becomes correct the moment the figures
above reach the session history and nothing else is outstanding. Recorded rather than performed,
so the closure is a decision somebody made rather than a default that fired.

**One release precondition is unmet on purpose.** `bin/fusion-review-coverage --since v10.20.0`
has not been run as a release precondition because no release was cut. Every one of the session's
eight commits is uncovered; no reviewer ran. That does **not** flag the Artifact↔Grounding edge:
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` settles
coverage as advisory and states in as many words that an uncovered commit does not flag that edge.
The gap is named, which is what that record requires, and whether a release may go out over it is
the user's call.

**Two decisions stay `_o_` on purpose and were checked rather than assumed.**
`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`
and
`260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md`
each carry `## Recommendation` reading "None yet", and no answer to either exists in
`shared/analyses/`, `shared/planning/` or anywhere in the decision store. Neither marker moved.
`260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`, filed by step 5,
is the same case.

**Three decisions reached `_i_` correctly.**
`260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md`
cites commit `32fe0d49`;
`260830-1841_*_where-may-a-store-prefixed-citation-begin-and-which-rooting-forms-does-the-grammar-name.md`
cites `hooks/lib/citation-scan.ts:201`; and
`260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`
cites `hooks/citation-sweep.ts:294`. Each carries an `Answered:` line naming the plan approval
before its `Implemented:` line, so the two-event lifecycle is recorded rather than collapsed. The
last two cite a `path:line` where the plan's clause 6 said "the commit"; both forms are permitted
by `rules/fusion-workbench-conventions.md` `### Decision files`, so nothing was corrected and the
divergence is recorded in the plan's log.

**Three issues stay `_o_` correctly.** `260830-1845_*_staging-drift-does-not-name-asset-provenance-as-live-state-while-its-sibling-marker-is.md`,
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
and `260830-2247_*_the-repair-pass-cannot-undo-the-splice-damage-the-unanchored-store-strip-produced.md`.
None has a fix on disk; each names an acceptance test that nothing at HEAD satisfies. No issue
anywhere in the store became closable during this pass.

**No issue in this store is misfiled as a decision**, and none of the three above is: each states
a defect with an acceptance test, which is the "go fix it" side of the split.

## Filed by this pass

`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`

The checker reports exactly one violation row inside a file this session wrote, and it is the
orchestrator's own session history at line 26 naming the consuming project's source record. The
line is honest prose and the citation cannot be repaired: every accepted form resolves by a lookup
inside *this* workbench, so a record held in another project's is `dangling` by construction and
will be at every future run. fusion now takes defect reports from consuming projects, so the shape
arrives once per cross-project session. Adjacent records checked before filing and none covers it:
`260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md`
answers the mirror image and is `_i_`;
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
covers a token that names nothing, where this one names something real held elsewhere.

## Left alone, and why

`fusion-workbench/agentstate.yaml` still reads `current_task: P-7`, `status: "running"`, and the
P-7 queue entry carries no `commit:` while `7be624e7` landed it. Session state at the workbench
root, written by the orchestrator, outside this agent's edit scope. The orchestrator closes it at
Phase 4.

`260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md` carries
a `Reconciled 260828-0907` note reading "still `_o_`" above the `Answered:` and `Implemented:` lines
that superseded it. Historical trace of an earlier pass, left unedited per the preserve-content rule.

## Coherence

The three-edge verdict for this session was computed by this pass and appended to
`260830-1801-orchestrator-session.md` `## Coherence`. Verdict `directive-partially-met`,
recommendation `accept Bounded Closure`. The reasoning is in that section and is not duplicated here.

## Two notes on the figures above

**They were taken before this pass filed its own records**, at `7be624e7` with a working tree
carrying only the event-log row. Re-run after this pass, the checker reads `files=2352` and the
sweep `residual=2788`; the deltas are the two records this pass wrote. `dangling=311` and
`store-prefixed=0` are unchanged, which is the reading that matters: this pass added no violation.

**It did add one, and the suite caught it.** The first draft of
`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`
spelled the session history's path with its store segment in an inline code span, which is not an
exemption. That is a `store-prefixed` violation, in a record filed about citation form, and it
reddened both citation gates: `workbench-citation-lint.test.ts` and the `rewrites=0` pin in
`citation-sweep.test.ts`, from the one line. Corrected to the storeless basename; `npm test` reads
806 passed exit 0 and `store-prefixed=0` afterwards. Recorded because it is a third instance of
exactly the shape
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
measures, arriving from a fourth writer within an hour of that record being filed, and this one
was not a fixture: it was an ordinary pointer written in the ordinary way.
