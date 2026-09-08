# Orchestrator Session — 260908-1529

**Status:** In progress
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Directive:** Finish the active Circle `260906-2258-bounded-executor-dispatches`: run plan steps 4 to 16 of `260907-1450_*_plan-bounded-executor-dispatches.md` to the closure the plan's `## Where this Circle stops` describes.
**Mode:** plan

## Snapshot at Setup

- **Workbench root:** `/Users/k1/Projects/productive/fusion`
- **Git HEAD at start:** `637d0b04`
- **Turn budget:** `max_turns=12`, resolved from `fusion.json` via `bin/fusion-turn-budget`. The same helper's second line reports `dispatch_minutes=20`. No configuration diagnostics were returned on stderr.
- **Domain:** `code`. `bin/fusion-count-sources` returned `code_files=148`, `data_files=10`, `counted_by=git-ls-files`; source files are present and data does not outweigh them, so the cascade's second branch applies.
- **Circle records:** 1 active, 0 anticipated, 18 closed-coherent, 3 bounded, 1 superseded. Because the anticipated-plus-active count is above zero the portfolio hint applies; `/fusion:next` had in fact already been run in this session before Setup, and its briefing found nothing to activate.
- **Open defect records:** 2 in this Circle's store, 18 in the shared store.
- **Open plans:** 1 open and 1 in progress in this Circle's store (the spec and the plan), 2 open in the shared store.
- **Open decision records:** 13 across both stores. Two of them belong to this Circle, and one of those, `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md`, is named by a closure clause of the plan. See the list under `## Open decisions` below.
- **Guard:** observation-only since 260816; no halted state exists to snapshot.

## Session context

The Circle was activated on 260907-0657 and its first session was interrupted, re-entered on 260908, and re-scoped by the user to a patch release cut from the `v10.24.0` tag. That release landed on `release/v10.24.1` and reached no commit on `main`. Plan steps 1 to 3 are done: step 1 is the gate, whose negative verdict the user released after the break-even derivation; steps 2 and 3 landed the `orchestrator.dispatchMinutes` leaf and its printing from `bin/fusion-turn-budget`.

Before Setup this session pulled 21 commits from `origin/main`, written by the other checkout `1d05b0e4` (`russet-marsh`), which closed `260907-0829-message-between-checkouts-read-before-pull` and released v10.25.0. The rebase was clean and the two local commits were replayed on top.

## Open decisions at Setup

This Circle's store:

- `260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md`
- `260907-2330_*_does-the-shapers-portfolio-activation-mode-write-a-new-spec-or-revise-in-place.md`

Shared store: `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`, `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`, `260825-1456_*_does-claude-mds-register-repair-reach-the-curators-pass-and-under-what-evidence.md`, `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md`, `260831-0033_*_does-the-sweeps-test-fixture-skip-survive-a-project-declaring-its-own-citation-bearing-paths.md`, `260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`, `260827-1305_*_which-agents-run-on-a-smaller-model.md`, `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`, `260831-2143_*_does-a-project-declare-its-own-identifier-head-fields.md`, `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`, `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`.

## Per-Turn Log

(pending)

## Coherence
<!-- RECONCILER-OWNED -->

**Verdict:** review-needed

**Edges:**
- Artifact↔Grounding: 16 of 16 plan steps verified against the tree at `de94102f`, none from its marker / 4 drift items, all four in the plan and spec text rather than in the work, and three of them already filed (`260908-1619_*_...`, `260908-1648_*_...`, `260908-1720_*_...`), the fourth being the plan's closure clause asking four pinned values to be byte-identical to `abcaa823` where `RULE_BASELINE` is not, by a comment block `01e0f688` rewrote with every numeric entry unchanged (Grounding at fault) / 0 open coderev+ontorev issues, and no review pass has run in this Circle at all, so this edge is read from the reconciliation alone and the Circle's one review at closure has not yet had its say.
- Artifact↔Directive: the 12 commits `637d0b04..de94102f` move toward the stated Directive and nothing in the range is orthogonal to it. Each of steps 4 to 16 lands where the plan says: `56d7a515` step 4 (`_dispatchBound` byte-identical in both `fusion.json` files), `af558fe0` step 5 (`rules/bounded-dispatch.md`, provenance at line 3, no minute literal), `04151cee` steps 6 and 7 (seven bound agents receive it, eight exempt do not, four new `ROLES` entries, three emptied ones deleted), `bb5dbda4` step 8 (both narratives now in `rules/commit-lock.md` `## Two measured defects behind this procedure`), `5e5b2519` step 9 and `a734a1c4` step 10 (`### Bounded dispatches` at `agents/orchestrator.md:456`, one `Stop by:` site, zero `20 minutes`), `3684f9b1` step 11, `4fe1e1e5` step 12 and `8b42e9e6` step 13 (`bin/fusion-events dispatches` exits 0 and prints all three `limit=` lines), `6b239475` step 14, `994fd07e` step 15, `de94102f` step 16.
- Grounding↔Directive: 46 active decision records exist (3 in this Circle's store, 11 `_o_` and 32 `_a_` in the shared store, counted by marker). **The 3 in this Circle's store were read and are consistent with the Directive, 0 conflicting; the 43 shared ones were inventoried at marker level and not opened**, so this edge is evaluated over the Circle's own store and its reach is stated rather than implied. One moved this pass: `260908-0025_*_the-agents-budget-is-281-bytes-short-after-another-sessions-growth-so-what-gives.md` is realised by `bb5dbda4` and renamed `_a_` to `_i_`. `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md` is already `_i_`, which answers the plan's closure clause about it. The Circle's three remaining open decisions each defer a question this Directive does not turn on.

**Rebalance recommendation:** revise Grounding

**What the verdict does not say.** The build itself is sound and the byte reckoning came in with room: `agents/*.md` sums to 417 145 against the `AGENT_BASELINE` sum of 399 843, a net of 17 302 against `AGENT_HEAD_ROOM` of 18 000, so 698 bytes of head-room stand where the plan forecast about 456. `surface-growth-bound.test.ts` is byte-identical to `abcaa823`. The flag is on the plan and spec text, which now state three things the tree contradicts and one that the tree contradicts by a comment.

## Coherence — re-take after the Rebalance, 2026-09-08 18:54Z
<!-- RECONCILER-OWNED -->

**This block does not replace the one above it.** The first verdict was taken at `de94102f`; this one
at `31b2d82e`, after the Rebalance gate where the user chose *Revise Grounding* and that choice was
discharged by filing
`260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`.
The two together are the record of what the Rebalance changed.

**Verdict:** review-needed

**Edges:**
- Artifact↔Grounding: unchanged in substance, and re-verified rather than carried over. All four passages still stand verbatim in `260907-1450_*_plan-bounded-executor-dispatches.md`: the `30-minute` illustration at line 218 against the same step's `Do not:` line at 245, "exactly eight blocks" at line 290, the `grep -c '045a14f\|f38f37d'`-returns-0 verification at line 350, and the four-values-byte-identical-to-`abcaa823` closure clause at line 560. `31b2d82e` is the only commit since the first verdict and it is additive bookkeeping — 12 files, 270 insertions, 0 deletions, no line of plan or specification prose rewritten. **What the Rebalance did change is the recordedness of one of the four**: the `RULE_BASELINE` clause had been named only in `260908-1845-orchestrator-byte-reckoning.md` and in the reconciliation log, and is now item 4 of a filed decision. **What it did not change is the text.** (Grounding at fault) / 0 open coderev+ontorev issues, reviews store still empty, so this edge is again read from the reconciliation alone.
- Artifact↔Directive: the 13 commits `637d0b04..31b2d82e` move toward the stated Directive; the twelve of the first verdict are unchanged and the thirteenth, `31b2d82e`, writes only workbench records — this Circle's reconciliation log, its session history and its decision store. Nothing in the range is orthogonal to the Directive and nothing since the first verdict advances a plan step, because none is left to advance.
- Grounding↔Directive: 4 active decisions in this Circle's store, all read, 0 conflicting; the 43 shared ones were again inventoried at marker level and not opened, so this edge's reach is stated rather than implied, exactly as in the first verdict. The new record is `_o_` and consistent with the Directive: it asks what happens to a completed plan's text and does not contest that steps 4 to 16 landed. It is cited **from** the plan's three defect records and cites the plan itself; the plan does not cite it back, so a reader arriving at the plan meets the three defects through the reconciliation log and does not meet the decision.

**Rebalance recommendation:** revise Grounding

**Why the verdict did not move, stated plainly.** Filing a question about a defect is not the same as
the Grounding accounting for it. The four passages still tell a reader something the tree contradicts,
and a record asking *whether they may be corrected* leaves every one of them saying what it said. The
new record is explicit on this in its own words — filing it "does not repair that text and was never
meant to" — and its option 2, the one that would make the filed defects themselves the correction, is
**unchosen**. Reading this edge as repaired would decide that open question in the record's favour from
the reconciler's chair, which is not the reconciler's to do.

**What the recommendation means the second time, since it is the same word.** `revise Grounding` is the
mechanical mapping from a flagged Artifact↔Grounding edge with the Grounding at fault, and it is
advisory. It should not be read as an instruction to run the same gate again: a second revision of the
Grounding cannot land while the decision governing *how* a completed plan may be revised is open. The
thing that unblocks this edge is an answer to
`260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`,
and that answer is the user's to give and the orchestrator's to relay.

**One reading considered and rejected.** `directive-partially-met` was weighed, because the Directive
names closure as `## Where this Circle stops` describes it and one clause of that section reads no.
It was rejected on the definition's own terms: that verdict requires that nothing drifted, and four
passages have. The clause reading no is the fourth drift item, not a separate shortfall, and it is
answered no by `01e0f688`, a commit from another checkout that this Circle did not make.

## The ruling on this record

**2026-09-08, user, Kai Stalmann <ks@qantr.com>.** At the Rebalance gate's second re-entry the user
was put the question filed as
`260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`,
with its three options and their foreclosures, and chose **option 1: amend the plan and the
specification in place at the four passages.**

What the ruling settles, in the terms the record put it: the closed marker on a completed plan does
not make its text exempt from correction, and the reader who opens the plan without its reconciliation
log is the reader the correction is for. The cost the record names is accepted rather than argued
away — the four defect records' acceptance tests are rewritten against the corrected text, and each
record keeps its own account of what stood before, so the evidence survives in the records rather
than in the plan.

The gate sequence that reached it, for a reader reconstructing the session: Phase 3 returned
`review-needed` with `revise Grounding` recommended; Gate 1 **Keep it**, Gate 2 **Revise Grounding**,
branch (a), which filed this record; the re-taken verdict did not move, because filing a question
about a defect is not the Grounding accounting for it; Gate 1 **Keep it** again, Gate 2 **Revise
Artifact**, and this ruling is what gives that pass its scope.
