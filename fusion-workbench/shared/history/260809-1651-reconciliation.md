# Reconciliation — the guard defect round

**Date:** 2026-08-09 16:51
**Agent:** reconciler
**Domain:** code
**Session reconciled:** `260808-0920-orchestrator-session.md`
**Directive:** Guard-Verhalten anschauen und konsolidieren. Ziel: Zuverlässigkeit, Determinismus, Vereinfachung.
**Range:** `451a07e..fb262d8`, six commits, no active Circle (all stores resolve to `shared/`)

---

## Scope

| Store | Reviewed | Updated |
|---|---|---|
| `shared/planning/` | 6 plans | 1 (status line corrected, reconciliation log added) |
| `shared/issues/` | 83 defects (38 open, 45 closed) | 16 (6 closed confirmed, 10 open annotated) |
| `shared/decisions/` | 15 records | 2 (both this session's) |
| `shared/reviews/` | 8 reviews | 0 — none belongs to this session |
| `shared/analyses/` | 9 analyses | 0 — checked against the tree, none renamed or annotated |
| `shared/history/` | recent entries skimmed | 1 append (`## Coherence` onto the orchestrator's session file) |

**Verification run here, not taken on trust.** `npm test` in `hooks/`: 33 test files, 1078 tests, 0 failures, exit 0, 78 s. Identical to the counts the session reported, against a baseline of 1030.

---

## The headline: no defect was closed early

The six defects renamed `_c_` this session were checked criterion by criterion against the tree and against a passing suite, not against their own `Resolved:` notes. **All 27 acceptance criteria across the six records are met.** Each record now carries a reconciliation note naming the code sites and the test cases that discharge it.

| Record | Criteria | Verdict |
|---|---|---|
| `260809-1104_*_a-symlink-in-place-of-a-protected-file-writes-through-it-and-removes-the-path-from-the-watched-set.md` (Critical, symlink in place of a protected file) | 6 | all met — `lstatSync` fingerprint with a third domain value, links kept in the watched set, `O_NOFOLLOW` plus parent-chain refusal on restore, and the rule text's completeness claim rewritten rather than re-asserted |
| `260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md` (trailing separator lifts the branch deny) | 4 | all met — the five HEAD-moving flags are scanned above the `--` allow, and fusion's own revert spelling is pinned from the other side |
| `260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md` (lost unknown-global-option fix) | 5 | all met — the walk resumes rather than stopping, the sibling records are named in a test title, and the no-new-allow direction is measured against a recorded baseline corpus rather than argued |
| `260809-1107_*_any-writer-active-during-the-tool-call-window-is-attributed-to-the-agent-and-reverted.md` (any concurrent writer attributed to the agent) | 4 | all met, plus the four separate obligations of the decision that overruled the plan on this point |
| `260809-1108_*_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md` (stale before-picture) | 4 | all met — failed save unlinks, `consumeSnapshot` unlinks on read, and the age bound the record suggested was deliberately not built, with the reason recorded in the code |
| `260809-1231_*_the-restore-writes-through-a-symlinked-parent-directory-which-the-final-component-check-does-not-cover.md` (restore through a symlinked parent) | 4 | all met — and the record's own `inference:` label is discharged, since the case it declined to reproduce is now a passing test |

Three of the six carried an acceptance criterion that only the rule-text step could satisfy, and the plan held them `_o_` until that step landed. That sequencing held: all six were renamed after `fb262d8`, not after their code commits.

## The plan: six of seven steps, and the seventh is the one unmet claim

`260809-1229_*_plan-five-severe-guard-defects.md` claimed in its header that "all seven steps landed". Six did. **Step 0, the environment precondition, was not performed**: its acceptance criterion is that the installed copy under `$FUSION_PLUGIN_ROOT` reports the same version as the work tree, and it reports `6.0.1` against `6.1.0`.

It gates no deliverable. The suite runs `npm run build` and spawns the work-tree build, which is why every step verified green with the precondition unmet, and the plan forbade live verification of the branch steps in this repository anyway. So the plan's *output* is complete while its *precondition* is not, and the header now says exactly that. The step is still worth performing before the next live guard session, for the reason the plan gives: `$FUSION_PLUGIN_ROOT` is pinned for a session's whole life.

Steps 1 to 6 are each verified at a named code site and a named passing test; the table is in the plan's own Reconciliation Log rather than repeated here.

## Nothing open was quietly finished

Ten open defects were checked against the tree rather than assumed still open. **None was resolved by this session's work.** Four of them share a file with the round and were checked for exactly that reason:

- `260809-1109_*_both-hooks-fail-silent-instead-of-open-when-the-guard-state-directory-is-unwritable.md` (both hooks fail silent when `.guard-state/` is unwritable) — `hooks/tracker.ts` was substantially rewritten and the top-level handler was not touched. Both hooks still call `emitEvent` before the verdict. One thing improved in its favour: the sharper instance it inherited from `260809-1108_*_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md` is closed, so the fail-silent path now costs a lost verdict rather than a lost verdict plus a wrong revert.
- `260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md` (case-sensitive command word) — `git-branch-guard.ts` was rewritten around it in `9716ee5` and the comparison is unchanged.
- `260809-1226_*_the-rule-still-promises-a-branch-switch-cannot-be-smuggled-into-a-compound-command.md` (the rule still promises a branch switch cannot be smuggled into a compound command) — `fb262d8` edited the same file for three other obligations and left the sentence standing. Its `## Why` section was strengthened in the direction the record asks for, which makes the contradiction between the two sections sharper rather than softer.
- `260809-1548_*_an-unknown-global-option-carrying-its-own-value-should-not-also-consume-the-next-word.md` (an attached-value global option should not also consume the next word) — deliberately not built, as its own text says, and confirmed unbuilt in the code.

The four `260809-1101` support-layer defects, `260809-1111_*_a-plain-line-in-an-unquoted-heredoc-body-is-classified-as-a-command.md`, and `260808-0920` are all in files absent from the diff and are annotated as such.

## The two decisions

**`260809-1527_*_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md` — `_i_` confirmed.** All four implementation obligations are demonstrable in `hooks/tracker.ts`, checked one by one: the narrowing is gated on the four write tools with `Bash` excluded, a spared path is still preserved and described and emitted as its own event, the halt is raised for a spared path exactly as for a reverted one, and the `Bash` half is pinned by a test named for the obligation. One detail the record did not ask for is worth having on the file: the spare comparison folds case, because the protected patterns are matched folded and an unfolded comparison would spare `RULES/x.md` from a payload naming `rules/x.md`.

**`260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md` — stays open, correctly.** No answer exists anywhere on disk, and none could have arisen here: the question is what a *consuming* project's `fusion-guard.json` declares, and no such file is visible from this tree. The four files it concerns are absent from the diff and the configuration surface is unchanged. Consolidation target C5 stays blocked behind it.

## The analyses: eleven of twelve consolidation targets stand

Both analyses stay as they are. Checked individually against the tree:

- **`1103` Target 3 (single-use snapshot) is realised** — it *is* Step 4 of the plan, minus the age bound. It should be struck from the cleanup list, as the plan's own coupling table says.
- **`1101` C4 is anticipated as promised** — the new preservation writer takes the resolved root as a parameter and its header states why an internal workbench walk would have been wrong.
- **The other ten stand untouched**, each confirmed by reading the code rather than by assuming the diff: T1, T2, T4/C6, T5, T6, C1, C2, C3, C5, and the `1101` open questions.

**One inaccuracy found in the plan's coupling table.** It says Step 5 adds a fifth call site to C2's read-coerce-write triple. The new writer does `mkdirSync` then `writeFileSync` with no temporary file and no rename, so it is not an instance of that pattern; C2 still has exactly the four sites the analysis measured. The error is in the harmless direction — C2 is smaller than the table implies — but a planner sizing the step from the table would get it wrong. Recorded in the plan's Reconciliation Log rather than edited into the table, which is analysis content.

**The analyses' line citations into three modules are now stale.** `protected-snapshot.ts`, `tracker.ts` and `git-branch-guard.ts` all moved by hundreds of lines, so citations like `protected-snapshot.ts:272-273` and `git-branch-guard.ts:246` no longer point at what they name. That is the class already filed as `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them` — filed there for rule files, and this is the same mechanism one store over. Not refiled; cited.

## Findings that are not about the guard

**Session bookkeeping froze for the fourth time**, and this instance is worse than the three before it. `agentstate.yaml` says turn 1, one task done, zero commits, an analyst still running; the reality is two analyses, a seven-step plan, six commits and six defects closed. The divergence check the issue itself proposes was computed again: the file says `0` commits, `git rev-list --count 451a07e..HEAD` says `6`.

What is new: **the session history file's `**Directive:**` line reads "(not yet stated)" while `agentstate.yaml` carries the real Directive.** Those are the two surfaces the reconciler's own Step 2.5 names as canonical, and they now contradict each other on that field. `agentstate.yaml` was still present, so this reconciliation survived on it — but the orchestrator deletes that file on a clean exit, and after this session's clean exit the only surviving statement of the Directive would be "(not yet stated)". The fallback risk that record has carried since 260801 is one clean exit away from being a data loss.

Appended as a fourth instance to `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` rather than refiled. Not repaired, per that record's own candidate 3: `agentstate.yaml` and the session history's own sections are outside the reconciler's scope, and a second writer on them is worse than the drift.

**`fusion-workbench/.commit-lock/holder` is still tracked**, both parts of its fix unapplied. One observation added to the record while checking it: the same sweep hazard applies to `.guard-state/`, which is tracked and whose four files change on every session, so its churn is continuous where the lock holder's was transient.

## New issues filed

None. Every finding above either landed as an annotation on an existing record or, in the two cases where a record already exists for the class, was appended to it as a further instance. Filing a fifth bookkeeping issue or a second line-citation issue would have split the evidence rather than adding any.

## Coherence verdict

`coherent`. Written to `260808-0920-orchestrator-session.md` `## Coherence`; the three edges and their evidence are there.
