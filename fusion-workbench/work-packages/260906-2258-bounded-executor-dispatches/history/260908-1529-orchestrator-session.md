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

## Coherence — post-amendment re-take, 2026-09-08 20:24Z

<!-- RECONCILER-OWNED -->

**Verdict:** review-needed

**Edges:**
- Artifact↔Grounding: 5 corrected passages verified against the tree, all 5 hold; 3 defect records closed, each closure earned by its own acceptance test; 1 decision correctly at `_i_`; 4 assertions in the plan's own `## Reconciliation Log` were made false by that same amendment, one of them giving a closure clause the wrong answer (Grounding at fault). 0 open reviewer-filed issues, since no review pass has run in this Circle.
- Artifact↔Directive: the two commits in `de94102f..HEAD` move toward the stated Directive. `31b2d82e` filed the question the Directive's closure needed answered and `6be2ec5e` executed the ruling on it; neither touches a plan step's outcome, and step 16 stays done.
- Grounding↔Directive: consistent over the delta. The only decision record that moved in `de94102f..HEAD` is `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`, `_o_` to `_a_` on the user's ruling and `_a_` to `_i_` on `6be2ec5e`, which realises the Directive rather than conflicting with it. The 3 remaining `_o_` records in this Circle and the 43 active records in the shared store were read at the re-take of 18:54Z and none moved since.

**Rebalance recommendation:** revise Grounding

### What was verified, and how

The five corrections were read against the tree rather than against the account of them.

1. Step 5, plan line 218, states the overshoot without numerals. `grep -n 'minute 19\|minute 49\|30-minute'` over the plan and the specification returns two hits, both reporting the contradiction rather than asserting the illustration, which is what the record's acceptance test permits. The specification returns none: its residual 2 is clean.
2. Step 7, plan line 290, reads `exactly seven blocks`. `grep -n 'eight blocks'` returns one hit, in the reconciliation log.
3. Step 8 verification item 3, plan line 350, reads the two hashes separately. The tree answers it: `grep -c 045a14f agents/orchestrator.md` returns 0, `grep -c f38f37d agents/orchestrator.md` returns 1, `grep -c '045a14f\|f38f37d' rules/commit-lock.md` returns 2.
4. The closure clause, plan line 560, asks whether the four pinned values carry the same **values** as at `abcaa823`, compared entry by entry, and names `01e0f688` as the comment rewrite that answers the byte reading no. Both halves check out: `RULE_BASELINE`'s five numeric entries are unchanged in value across `abcaa823..HEAD` while their trailing comments were rewritten, and a comment-stripped diff of `surface-growth-bound.test.ts` over the same range shows no code change at all.
5. The risk table, plan line 636, states the residual without numerals and no longer claims the built rule file states the example. `grep -rn 'states the example'` over the planning store returns nothing, and `rules/bounded-dispatch.md` carries no minute numeral, which is what Step 5's acceptance criterion requires.

**None of the three record closures is unearned.** Each was re-run as its own record wrote it, against the tree and not against the resolution note. `260908-1619_*_...` and `260908-1648_*_...` pass on the branch their tests permit, where the surviving hits are text about the contradiction rather than the contradiction; `260908-1720_*_...` passes on the first of the two repairs its test names, with the counts confirmed above. The fifth site the correcting pass found and reported rather than touching is fixed in both its halves.

### What still stands

**The amendment moved the contradiction into the plan's account of itself.** Before `6be2ec5e` the plan's prescriptive text disagreed with the tree and the plan's `## Reconciliation Log` said so correctly. After it the prescriptive text agrees and the log does not. Four assertions at plan lines 707 to 720 are now false:

- `Three passages of this plan now state something the tree contradicts` — none of the three does.
- `each already filed and each left standing here rather than edited` — all three were edited, in the commit that closed their records.
- The three itemised citations describe text at lines 218, 290 and 350 that no longer reads that way. The line numbers still resolve; the quoted content is gone.
- `## Where this Circle stops asks whether four pinned values are byte-identical to abcaa823` — it no longer asks that, and the log's verdict on it, `answered no on a technicality`, is now wrong in the direction that matters. The amended clause is answered **yes**, cleanly and on the values, so a closure clause the log reports as failing is passing.

The last of those is the one with consequences beyond tidiness. Closure reads `## Where this Circle stops`, and the plan's own log currently tells a reader that one of its clauses reads no.

This is the same fault as the previous take's, one level in, and it is Grounding at fault for the same reason: the correction was made and the Grounding's account of its own correctness was not brought along. The commit message states plainly that no reconciliation-log entry was added, so the omission was deliberate rather than missed, and the convention cited for it, that a reconciliation annotates and does not rewrite a plan, does not forbid the repair. A new dated entry appended below the existing one, recording that the three passages were corrected in `6be2ec5e` and that the closure clause now reads yes, leaves every earlier word standing. That is the same shape as the three Coherence blocks in this file.

**Carried forward, unaddressed and not claimed otherwise.** Neither `260907-1450_*_plan-bounded-executor-dispatches.md` nor `260907-0820_*_spec-bounded-executor-dispatches.md` cites `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`. Five passages were rewritten in place with no in-text trace of the ruling that authorised it. The ruling names the log-less reader as the one the correction is for, and that reader now has corrected text and no way to learn it was corrected.

**Verification:** `git log --oneline de94102f..HEAD`; `grep -n` over the plan and specification for `minute 19|minute 49|30-minute`, `eight blocks`, `seven blocks`, `045a14f|f38f37d`, `states the example`, `260908-2051`; `grep -c` for both hashes over `agents/orchestrator.md` and `rules/commit-lock.md`; comment-stripped `diff` of `rules-emission-golden.test.ts` and `surface-growth-bound.test.ts` across `abcaa823..HEAD`; `git show --stat 01e0f688` and its diff; the three closed issue records and the `_i_` decision read in full. No file outside this history file was written.

## Coherence — post-repair re-take, 2026-09-08 20:57Z

<!-- RECONCILER-OWNED -->

**This block does not replace the three above it.** The third verdict was taken at `6be2ec5e` and
named one repair, in the plan's own `## Reconciliation Log`. This one is taken after that repair was
made, on the same commit plus the working tree, and it is scoped to the delta: the corrected passages
were not re-verified a second time and the sixteen steps were not re-inventoried.

**Verdict:** coherent

**Edges:**
- Artifact↔Grounding: the one flagged item of the third verdict is repaired and re-read on disk. `260907-1450_*_plan-bounded-executor-dispatches.md` `## Reconciliation Log` carries a third dated entry below the two standing ones, every earlier word intact, which states what the amendment changed and what each of the four false assertions now reads. The load-bearing one is corrected in the direction that matters: the closure clause at plan line 560 is answered **yes** on the values, re-measured for this block rather than carried over, and the log no longer reports it as failing. 0 drift items, 0 open reviewer-filed issues, and no review pass has run in this Circle, so this edge is read from the reconciliation alone and the closure review has not yet had its say.
- Artifact↔Directive: the two commits `de94102f..HEAD` are unchanged from the third verdict and still move toward the stated Directive; nothing since is committed. The working tree adds this repair, the decision record's realisation footer and this block, all of which serve the Directive's closure rather than any other end. One untracked Circle directory in the tree, `260908-2018-prerequisites-confirmed-once-order-computed`, belongs to no commit in the range and to a different Directive; it is a filing made beside this Circle, not work of it, and it is named here so the edge is not read as covering it.
- Grounding↔Directive: consistent over the delta, with one attribution corrected. `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md` is the only decision that moved, and the third verdict compressed how: `6be2ec5e` carries `_o_` to `_a_` with the `Answered:` footer, while the `_a_` to `_i_` rename and the `Implemented: 6be2ec5e` footer are in the working tree and in no commit. The record's content is right and its state is unpushed, which is a matter for the session's commit rather than for this edge. The 3 remaining `_o_` records in this Circle and the 43 active records in the shared store are unmoved since the 18:54Z re-take.

**Rebalance recommendation:** none

### Whether this recurses, and where it stops

The third verdict called its finding "the previous take's fault one level in". A fourth level exists and
is written into the Grounding↔Directive edge above: an attribution in the third block that the tree does
not support. It is a sentence about which commit carries a rename, in a record whose own convention is
that each block names and corrects the one before it, and correcting it took one clause of this block.

Two residuals are left standing on purpose, and neither is worth another pass.

**Neither the plan nor its specification cites the ruling in text.** Five passages were rewritten with
no in-text trace of what authorised it. The plan's new log entry now carries the citation and says in
its own words that the corrected passages do not, and why: a provenance record placed inside a step's
prescriptive text reads as a requirement, and the specification has no reconciliation log to receive it
without a structural write during a verdict pass. This belongs in the Circle's closure note as a named
residual, not in a fifth correction.

**The plan's log and this file will always trail their own subject by one write.** Each repair of a
record's account of itself is a new write that the next verdict can then find something to say about.
The two corrections this session made were both worth making, because each left a reader with a false
statement about the tree. What is left is neither: an absence that is now declared, and an attribution
already corrected in the line above. Stopping here is a judgement about diminishing returns and is
stated as one rather than as a claim that nothing further could be written.

**Verification:** `git status --short`; `git ls-tree --name-only HEAD` over this Circle's decision store
against `ls` of the same directory; `git show --stat 6be2ec5e -- <decision store>` and the record's
tail; comment-stripped comparison of `AGENT_BASELINE`, `RULE_BASELINE`, `RELEASE_CAP` and
`DRIFT_CEILING` across `abcaa823..HEAD`, membership and values both, giving 15 and 8 entries unchanged,
105 354 and 145 144 unchanged; `bin/fusion-citation-sweep --dry-run`, `rewrites=0`;
`npx vitest run lib/__tests__/workbench-citation-lint.test.ts`, 13 passed. Two files were written: this
one and the plan's `## Reconciliation Log`.

## Budget

Every record figure below is derived from the stores at write time, never accumulated across Turns.
Filed means the filename stamp is at or after this session's start; a marker count means that name
did not exist at `637d0b04`.

| Metric | Count |
|--------|-------|
| Turns | 2 |
| Tasks resolved | 14 (plan steps 4 to 16, plus the Revise Artifact amendment) |
| Tasks skipped/deferred | 0 |
| Issues created | 10 |
| Issues resolved | 3 |
| Decisions answered (`_o_`→`_a_`) | 0 as measured; one was answered and went on to `_i_` in the same session, so it counts below instead |
| Decisions implemented (`_a_`→`_i_`) | 2 |
| Commits | 16 |
| Agent errors | 0 |
| Human gates hit | 5 (the ontocoder task, and four Rebalance rounds including the stop-condition clauses) |

## Per-Turn Log

### Turn 1
- Tasks attempted and completed: S4 to S16, thirteen of thirteen.
- Commits: `56d7a515` through `de94102f`, twelve.
- Coherence: `review-needed` at Phase 3; the Artifact-to-Grounding edge flagged with the Grounding
  at fault, four passages of the plan and specification stating what the tree contradicts.
- Circuit breaker status: OK. Turn budget 12, one Turn used.

### Turn 2
- Created by the Rebalance gate's Revise Artifact choice, after Revise Grounding filed the question
  and the re-taken verdict did not move.
- Tasks: the five-passage amendment, then the reconciliation log's own catch-up.
- Commits: `31b2d82e`, `6be2ec5e`, `20796615`, `e2ad2196`.
- Coherence: four dated verdict blocks in this file. `review-needed`, `review-needed`,
  `review-needed`, then `coherent` with recommendation `none`.

## Review coverage

**Range:** `637d0b04..20796615` — 16 commits
**Covered by:** `260908-2110-coderev-bounded-dispatch-closure.md`, `**Reviewed-range:**`
`637d0b04..20796615`, covers 15.
**Not covered:** `e2ad2196` — the commit that carries the review itself, which no review can open.
**Carried out-of-scope files:** twenty-four entries, `hooks/lib/__tests__/fusion-events.test.ts`
first among them by the reviewer's own judgement, plus the eight carried from
`260908-0852-coderev-message-between-checkouts-closure-pass.md` which were not reached.

## Remaining Work

Six defect records and one decision open in this Circle's store at closure, and none of them blocks
the closure: `260908-2115_*_...` (High, the bounded return's contract against the verification field
two other passages read off it), `260908-2112_*_...`, `260908-2113_*_...`, `260908-2118_*_...`,
`260908-2122_*_...`, `260908-1719_*_...` (the intermittently red suite),
`260908-1828_*_...` (no executor here received the rule through its own Setup),
`260908-0030_*_...` (the citation class, its acceptance test now run and answered not-zero),
`260908-0020_*_...` (the specification's own criteria count), and the open decision
`260908-1836_*_...` on whether the minute-literal gate's context list should cover the prompt's own
prose name for the value.

## Commits

| Hash | Message |
|------|---------|
| `56d7a515` | docs(config): the dispatch bound is documented in both fusion.json files |
| `af558fe0` | feat(rules): bounded-dispatch.md, the obligation the seven agents will carry |
| `04151cee` | feat(rules): the seven bound agents receive bounded-dispatch.md |
| `bb5dbda4` | refactor(agents,rules): the two commit-procedure narratives move off the prompt |
| `5e5b2519` | feat(agents): the orchestrator learns to hand out a stopping time |
| `a734a1c4` | feat(agents): five sites learn what to do with a half-finished return |
| `3684f9b1` | docs(skills): the setup skill names both values the one block resolves |
| `4fe1e1e5` | feat(hooks): bin/fusion-events dispatches reads how long a dispatch ran |
| `8b42e9e6` | test(hooks): the dispatch reading's every branch, and the seven pinned to one set |
| `6b239475` | test(gates): a minute literal cannot return to the two prompts |
| `994fd07e` | chore(workbench): the byte reckoning, and the budget was met |
| `de94102f` | docs: every surface this work changed is described where it is documented |
| `31b2d82e` | chore(workbench): the reconciliation, and the question the four text defects raise |
| `6be2ec5e` | chore(workbench): five passages of the plan and spec now say what the tree confirms |
| `20796615` | chore(workbench): the log catches up with the correction, and the verdict is coherent |
| `e2ad2196` | review(bounded-dispatch): the closure pass, 16 commits, 5 findings |

## Portfolio update

`portfolio.md` was regenerated after the `_t_`→`_c_` transition; the playmaker's log is
`260908-2313-playmaker-direct-dispatch.md` in the shared history store. The portfolio now shows no
active Circle and one anticipated, `260908-2018-prerequisites-confirmed-once-order-computed`, which
a concurrent session in this same checkout created while this one ran. An `## Activation proposal`
was appended to that record recommending a re-sharpen before activation: its Grounding snapshot
states zero anticipated and one active Circle, and the active one closed today, so that clause is
already stale.

## What this session found out about its own machinery

The bounded-dispatch mechanism was exercised on itself. Nine dispatches carried a stopping time,
all of them returned inside it, and none produced a bounded return, so the handoff path this Circle
built is specified and tested but has not once been walked end to end. The reading it also built,
run against this session's own log mid-session, counted three dispatches past twenty minutes out of
sixteen.

Four rounds of the Rebalance gate, and the pattern across them is the session's own finding: each
correction left the account of that correction stale, and the next verdict flagged the account
rather than the thing. Two of those rounds were worth taking, because each left a reader holding a
false statement about the tree. The third was stopped by the reconciler's own judgement that a
further pass would be tidying, and that judgement is what closed the loop rather than a rule.
