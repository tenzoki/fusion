# Tasklist rebuild — 260811-1734

**Agent:** taskplanner (domain `code`)
**Workbench HEAD at build time:** `f70cb07`
**Active Circle:** none (`.active-circle` absent; `fusion-paths` emitted no `CIRCLE` key)
**Output:** `fusion-workbench/tasklist.md`, rebuilt from scratch

## Why a rebuild and not an update

The previous queue was written at 09:03 against HEAD `7785330`. Twenty commits and three Turns
landed after it, 31 records closed and roughly 30 were filed, and all twelve open decision records
were answered or deferred in one sitting. The dispatch directed that the old file be treated as a
stale input to be replaced, and that every carried-over entry be re-checked against the record on
disk. Both were done.

## What was scanned

`bin/fusion-paths taskplanner` resolved `SCAN_*` to the shared stores alone, because no Circle is
active. The scan therefore covered:

| Store | Files | Open work found |
|---|---|---|
| `shared/issues/` | 208 | **62** with marker `_o_`, none `_p_` |
| `shared/decisions/` | 31 | 0 open (`_o_`); 13 answered (`_a_`), 3 deferred (`_d_`), 15 implemented (`_i_`) |
| `shared/planning/` | 6 | 1 open, deliberately out of scope (see below) |
| `shared/reviews/` | 19 | 3 from this session, all already decomposed into filed issues |
| `shared/history/` | skimmed | the three Turn logs and the reconciliation of `260811-0109` |

**A second pass reached what `$SCAN_ISSUES` cannot.** With no Circle active the resolver does not
name any Circle store, so the records inside already-closed Circles are invisible to it. They were
reached by naming their paths: **10 open records across four Circles** —
`260719-1536-plane-mirror-integration` (1), `260801-1244-guard-rules-write` (6),
`260805-2005-textschicht-gegen-code-nachziehen` (1), `260807-0923-guard-misst-statt-orakelt` (2).
The previous build found 16 across five; six have since closed, and the fifth Circle
(`260804-1205-shell-reachability-model`, now `_s_`) holds none. Per the Origin Rule nothing was
moved — the queue cites each by workbench-relative path.

**Total inventoried: 72 open defect records, plus 7 answered decisions whose realisation no defect
record carries.**

## What was extracted

- **74 open tasks**, of which **22 are blocked**: 20 need a human decision before an executor can
  start, 2 need the user at a machine this session cannot reach.
- **3 records were pulled out of the task list entirely** because the work behind them is done and
  only the marker lags. They are listed with their evidence, not dropped.

## The finding that changes the queue's shape

**`cd hooks && npm test` is red at HEAD `f70cb07`: 49 files, 1284 tests, 1 failed.** The dispatch
stated the suite was green at 1284, and it was — before commit `1064fec`. That commit answered the
twelve decisions and renamed their markers, and two shipped source files still cite two of them by
the old marker:

- `hooks/lib/reverted-copy.ts:32` → `…/260807-0945_o_integritaet-des-eskalationsspeichers.md`, now `_a_`
- `hooks/lib/review-coverage.ts:78` → `…/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`, now `_d_`

`reference-resolution-lint.test.ts` catches both and names the fix: the ratified wildcard form
`_*_`. This is task 1 and it gates the whole queue, because the executor report contract derives
`Result` from the suite's exit code, so every executor dispatched before it lands reports `blocked`
whatever it achieved. **No open record covers this**; the queue says so rather than inventing a
source.

A second, smaller drift in the same commit, recorded here rather than filed: its message says
"Eight are answered, four deferred". The rename list shows nine `_a_` and three `_d_`.

## Records resolved on disk with the marker unmoved

| Record | State |
|---|---|
| `260810-1632_*_the-churn-stand-down-still-asks-cwd…` | **Fully resolved** by commit `1d5eed6`. `hooks/tracker.ts:1079` now reads `isFusionPluginRoot(workbenchRoot)`, and the comment at `:1043-1077` was rewritten — it names the record, cites `25c5454` as what falsified the old premise, and covers the null-root case. |
| `260810-0819_*_head-carries-six-records-twice…` | **Criterion 1 met, measured now:** git and disk both count 62 `_o_` records and the duplicate-stem probe returns nothing. **Criterion 2 met by a different mechanism** than the record asked for — a measurement (`hooks/lib/staging-drift.ts`) plus a staging-shape rule and gate, rather than the convention-plus-decision it specified. **Criterion 3 unmet:** `260807-1941_c_`'s deferral is still unanswered. Queued as task 34. |
| `260809-2255_*_the-branch-policy-verification-left-an-active-halt…` | **Criterion 1 met:** `escalation.json` reads `haltActive: false, consecutiveBlocks: 0` and the human clearing is recorded. **Criterion 2 arguably moot** — it asks for a rule naming the branch policy, and that policy was deleted in `7598073`. Queued as task 47 for the user's call. |

## What the decision sweep changed

No decision record is open. That makes "waiting on a decision" a different question than it was, and
the queue separates the two cases rather than carrying the old classification forward.

**Released — previously blocked, now buildable:**

- The baseline pin for the drift check (`260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`) was bound to land after
  `I:260801-2038-frozen-state`; that record is now `_c_`, so the sequencing constraint is
  discharged. Queued as task 25, and it closes the open skip-licence record beside it.
- The duplicate-filing check (`circles/…/260805-1548_o_`) was held open by the rule-text ratchet
  question. That decision is now `_i_` — commit `3163281` set 12 000 bytes of headroom over the role
  floor — and the ~430-byte paragraph the record already drafted fits. Queued as task 27.
- The domain-capture record (`260810-2110_o_`) was waiting on a `bin/` helper decision that is now
  answered. Queued as task 41, behind task 4.
- The five realisation records `260811-1730_*_realise-the-measurement-chassis-first-two-pieces-throttle-onto-the-existing-seam-and-one-git-wrapper.md` … `260811-1734` exist because their decisions were
  answered today.

**Genuinely parked, with the trigger named:**

- `260810-0710_d` re-opens when the lint cohort's fate is settled — records `260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`,
  `260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md` and `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`. **The first two are now `_c_`; only `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md` is left, and it
  is task 30.** Landing task 30 fires this trigger, and the answer then governs tasks 46 and 47.
- `260810-0718_*_should-rebuild-map-merge-with-the-existing-map-or-replace-it.md_d` re-opens at the first real `push --rebuild-map` recovery against a workbench that
  has seeded from Plane.
- `260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md_d` re-opens when someone measures whether any reachable consuming project populates
  CHECK 3's configuration surface — machine-bound, `unite` first.

## How the five realisation records were handled

Each of `260811-1730_*_realise-the-measurement-chassis-first-two-pieces-throttle-onto-the-existing-seam-and-one-git-wrapper.md` … `260811-1734` cites its decision and states what the chosen answer
**excludes**. Every one of those exclusions was carried into the queue entry verbatim in substance,
because a later executor reading only the queue must not be able to widen the work:

- Task 2 (`1730`) names the tracker bodies, CLI mains and `bin/` wrappers as out of scope and says
  plainly not to turn it into option 1.
- Task 5 (`1731`) carries "no ceiling anywhere, including `emitEvent`" and records that dropping
  `guard_allow` was offered and not taken.
- Task 6 (`1732`) carries "no fallback path may exist" and the reason the loudness is the substance.
- Task 4 (`1733`) carries the domain-capture exclusion, and that exclusion is task 41's own bound.
- Task 11 (`1734`) carries "acceptance is per instance, not for the class — do not close on a rule
  being written down", plus the two rejected options that must not return as supplements.

**`260811-1734` was split, as its own text invites.** It says it should not be attempted in one
dispatch and offers per-surface records. The four instances it names as measured were pulled out as
tasks 7 (the churn-rank contract, closing `260811-1612_*_claude-md-is-the-fifth-surface-of-the-churn-rank-output-contract-and-was-left-on-the-old-one.md`), 8 (the routing table, closing
`260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` and `260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md`), 9 (the hooks README table, realising decision `260811-1522`) and
10 (`max_turns`, closing `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`). Task 11 is the residual parent: the sweep for instances
nobody has enumerated yet, depending on the four and explicitly not a licence to redo them.

## Re-verification, and where the records had drifted

Fourteen entries were checked against the file on disk rather than trusted. Three carry a correction
to their own record's citation:

- Task 14: the exemption regex is at `commit-message-path.test.ts:187`, not `:141`. Text unchanged.
- Task 29: the record says the two queue-head parsers "already differ" by a `2>/dev/null`. At HEAD
  they are no longer near-copies but **two different implementations** — `grep -oE … | tr -d` at
  `agents/orchestrator.md:703` against a single `sed -E` at `:745`. The defect is worse than filed.
- Task 30: the re-implemented control asserts `.not.toBe(3)`, not `.not.toBe(5)`. Same shape.

Seven Turn-1 review findings (`260811-1142_*_the-three-measurement-modules-hand-roll-a-guard-state-store-the-seam-built-for-it-already-owns.md` … `260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md`) were each confirmed live by reading the
cited line, not by trusting the review. All seven still stand.

## Out of scope, stated so its absence says nothing

`260801-1122_*_spec-normative-consolidation.md` is the one open plan and was **not**
inventoried. The Directive is open defect records only — no plan steps, no new capability work, no
Circle activation. The portfolio's one anticipated Circle, `260801-1244-curator`, was not
touched; decision `260801-1020_*_where-does-normative-consistency-live` realises there, which is why
it is reported rather than queued.

## Changes against the previous queue

- **Added:** 24 entries with no counterpart, plus task 1.
- **Removed:** every entry whose source now carries `_c_` — 31 records, including the whole
  `260811-14xx` cohort and `260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md`, the red-suite task the previous queue led with.
- **Moved out of the task list:** the three resolved and partially-resolved records above.
- **Re-classified:** four previously "needs a human answer" entries are now unblocked; task 30 is now
  a deferred decision's trigger rather than an ordinary finding.

## Dependency graph

Rendered as a Mermaid `flowchart TD` in the queue, with five subgraphs and one gate node. The gate
is real rather than drawn for tidiness — a red suite makes every executor report `blocked` — so it
feeds the cluster heads instead of carrying 74 edges. Inside the clusters only genuine orderings are
drawn: the source-root convention before its helper; the four surface instances before the residual
sweep; `260811-1610_*_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md` before `260811-1616_*_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md` (same paragraph); `260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md` before `260811-1611_*_the-positive-control-documents-the-keyword-exemption-dependency-in-a-comment-and-asserts-something-else.md`
(answering the first may close the second); `260811-1147_*_both-reviewer-prompts-place-the-mandated-fields-beside-a-sender-field-neither-prompt-defines.md` before `260811-1148_*_parse-not-opened-misreads-a-prose-value-as-a-file-list-or-as-a-declared-none.md` (same parser);
`260811-1617_*_record-260811-1547-states-its-proposed-lint-has-no-exceptions-and-a-shipped-skill-already-is-one.md` before `260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md` (the amendment is what makes the lint buildable). The remaining
50 tasks are independent and ordered by priority alone.
