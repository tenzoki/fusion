# Orchestrator Session — 260802-0848

**Directive:** Every rule file names the decision record, Circle, or analysis that produced it. The convention is documented in `rules/fusion-workbench-conventions.md`; all of the plugin's rule files carry a header, each naming a record or stating honestly that none is recoverable; a lint gate in the plugin's test suite fails when a file in `rules/` lacks a header and names the offending file. (Source: `circles/260801-1244-rule-provenance-header/_t_circle.md` `## Directive`; capability C8 of `shared/planning/260801-1122_o_spec-normative-consolidation.md`.)
**Mode:** custom (Circle Directive with an existing spec, no implementation plan yet)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| Workspace | `/Users/k1/Projects/productive/fusion` |
| Plugin version | 5.8.0 |
| Git HEAD at start | e8988d9 |
| Domain | `code` (from the Circle record's `**Domain:**` line; matches Setup detection) |
| Active Circle | `circles/260801-1244-rule-provenance-header` (activated via `/fusion:next` at 260802-0829) |
| Circle stores | created at Setup — the Circle held only its record, no artifact subdirectories |
| Circle-local issues / decisions / plans | 0 / 0 / 0 |
| Open issues (shared) | 18 |
| Open plans (shared) | 1 (`260801-1122_o_spec-normative-consolidation.md`, the spec covering all four Circles) |
| Open decisions | 0 open, 4 answered (D1, D2, D3 among them) |
| Guard | not halted; 2 prior blocks (both `git_branch_switch`, earlier sessions) |
| Interrupted session | none |
| Plane mirror | 1 activation transition deferred (no `PLANE_API_KEY`) |

### Ground-truth check taken at Setup

The plugin's `rules/` directory holds **ten** files, not the nine the Circle record and the spec both
state. Verified by `ls -1 rules/ | wc -l` on 2026-08-02. Exactly one carries a provenance line:
`rules/fusion-workbench-conventions.md:326`. The nine without a header are:

`agent-setup.md`, `context-lean-claude-md.md`, `context-manifest.md`, `critical-stance.md`,
`decision-record-examples.md`, `design-diagrams.md`, `git-branch-discipline.md`,
`protected-path-discipline.md`, `user-facing-output.md`.

The count discrepancy is a Grounding correction the shaper owns; the orchestrator does not edit
Circle-record content.

### Open scope the record hands forward

Three questions the Circle record and the spec (line 663) both leave open:

1. The header regex.
2. The header's required position in the file.
3. Whether the lint test validates that a cited record path resolves.

## Per-Turn Log

(No Turn started yet.)

## Coherence

<!-- RECONCILER-OWNED -->

*Computed 260802-1413 by the reconciler (domain `code`) at `b568ad9`, against the Directive on this file's line 3 and the Circle record's `## Directive`. Session-start anchor `e8988d9`, eight commits in range. Evidence detail in `history/260802-1413-reconciliation.md`.*

**Verdict:** review-needed

**Edges:**

- **Artifact↔Grounding:** OK. 8 of 8 acceptance criteria verified against the tree, not against `[DONE]` markers; `npm test` re-run at 260802-1411 gives 780 passing tests across 17 files; 10 reviewer issues filed, 7 closed with each closure checked against its cited commit rather than its resolution note, 3 left `_o_` by explicit user decision and all 3 re-verified still live; 2 decision records promoted `_a_`→`_i_` on realisation (`929dbf5`, `c2c2a04`, `de9d5aa`); 0 open decisions anywhere in `$SCAN_DECISIONS`. One residual, named rather than absorbed: the delivered change set is 14 non-workbench paths against a plan that bounded itself to 11, and one of the three extras (`templates/investigator-capture-layout.md`, `482e9c3`) is named in neither the spec nor the plan.
- **Artifact↔Directive:** **Flagged — on the Directive's wording, not on the work.** Every one of the eight commits moves toward the Directive; none is orthogonal to it and none moves away. But the Directive as written is not what the Circle delivered, in two ways that a downstream reader will hit. It still says "all nine of the plugin's rule files carry a header" when ten do — the same record's `## Grounding snapshot` corrects the count and states outright that the Directive still misstates it, so the record knowingly ships an internal contradiction. And its closing clause, that the header "makes the curator's grounding-in-history requirement true by construction rather than dependent on its diligence", is not delivered for any file that exists: 4 of 10 citations name a Circle directory and 6 name a commit, neither of which carries a state marker, and the spec established that no backfilled citation can ever be upgraded to the decision-record form, because neither cited Circle holds a record that motivated any of those files. **The Directive is partially met.** The mechanism is complete — convention documented, ten files backfilled, gate enforcing. The payoff clause holds forward only, for rule files written from now on, and never for the ten the curator will actually read. This matters beyond bookkeeping because `circles/260801-1244-curator` depends on this Circle hard and reads this Directive as its premise.
- **Grounding↔Directive:** OK. All 10 records across both paths in `$SCAN_DECISIONS` scanned (1 Circle-local, 9 shared). 0 open. 3 active (`_a_`) and consistent with the Directive: D1 `shared/decisions/260801-1020_a_where-does-normative-consistency-live.md` and D2 `…_a_may-any-fusion-writer-touch-rules.md` are downstream siblings whose realisation belongs to two Circles still `_a_`, and `shared/decisions/260719-2141_a_concurrency-worktree-slots-vs-single-active-circle.md` is unrelated to this Directive. 0 conflicting.

**Rebalance recommendation:** revise Directive

The recommendation is advisory and it is narrow. Nothing about the work needs redoing — the Artifact is sound and the Grounding is settled. What wants revising is the Directive text on `_t_circle.md`, so it says ten rather than nine, and so its payoff clause states the forward-only scope the spec already accepted as a limitation. Left as written, the record hands the curator Circle a premise stronger than what was built.

Accept Bounded Closure is *not* the reading here. The Directive's mechanism was reached in full; only its final clause is out of reach for the existing corpus, and that was known and accepted at the spec gate rather than discovered at the boundary.
