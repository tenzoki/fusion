# Reconciliation — the checkout registry Circle, session 260904-1050

**Date:** 2026-09-05 05:57
**Status:** Complete
**Domain:** code
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Verified against:** HEAD `326440dc`, session range `cda72f71..HEAD` (18 commits, `git rev-list --count`)

## What was reviewed

| Store | Read | Updated |
|---|---|---|
| Plans (Circle + shared) | 1 live plan | 1 — marker `_o_` → `_p_`, `## Reconciliation Log` appended |
| Issues (Circle + shared) | 1 Circle `_o_`, 5 shared stamped 260904/260905 | 0 — every open marker verified correct and left standing |
| Decisions (Circle + shared) | 3 Circle `_o_`, 5 shared `_o_`, 30 shared `_a_`, 4 shared `_i_` filed this session | 3 — stale commit hash corrected, each with its own reconciliation note |
| Reviews (Circle + shared) | **none exist for this range** | 0 |
| History | 25 entries stamped 260904/260905, plus the orchestrator session file | 1 — `## Coherence` appended to `260904-1050-orchestrator-session.md` |

## Key findings

**1. A commit hash that names no object, in three records written today.** The `Implemented:` lines added at plan step 14 cite `4ff9d2e0` inside their bodies. `git cat-file -t 4ff9d2e0` fails. The work those sentences describe — `/fusion:setup` Step 0i, and the four sites where the hex resolves to an alias for display — landed at `e9c14bdf`, confirmed by `git show --stat e9c14bdf` listing `skills/setup/SKILL.md`, `skills/next/SKILL.md`, `bin/monitor` and `hooks/hooks.json`. `4ff9d2e0` is the pre-amend hash: `e9c14bdf` also carries `260904-2211-bugfixer-two-stale-pins-and-the-dropped-entry-roll.md`, a repair folded into the commit after the decision records had already been annotated against it.

Corrected in all three records. Step 14's acceptance reads "each `Implemented:` line names a commit that exists"; it held for the leading hash of every line and failed for a hash inside three of them, which is the reading a marker scan does not reach.

**2. Step 7's plan text still contradicts what was built, and step 13 verified against it anyway.** `260904-2140_*_step-7-states-two-branches-for-the-monitor-header-that-contradict-each-other.md` is `_o_` and its marker is right, but its acceptance is a correction to the plan's step-7 text ("so step 13's verification pass reads a specification that matches what was built"). Step 13 ran at `9b488aac` with that text uncorrected. The built three-branch behaviour is the correct one and the record argues for it from the Directive's no-migration constraint; what is unrepaired is the specification. Not corrected here: a plan description is outside a reconciliation pass. This is the one item that keeps the Artifact↔Grounding edge flagged.

**3. The session history file has no Turn 2 section.** Its headings run Turn 1 (the analysis), Turn 1 (the worker-field gate), Turn 3 (the exit-1 halt gate), Turn 3 (the tail). `bin/fusion-events turns` reports `turns=3 scope=checkout`, and the Circle record's `## Turn log` carries all three, Turn 2 included (steps 4 to 8, `d5a27230`..`e9c14bdf`). The gap is in the orchestrator's own file, whose only section this pass may write is `## Coherence`. Reported, not repaired.

**4. A stopping clause and step 14 were never reconciled with each other.** `## Where this Circle stops` requires that both scoped decisions carry `_a_` or `_d_`; step 14 instructs `_a_`→`_i_` where the answer required code. Both now carry `_i_`. The clause's substance holds — both answers are the user's, given at their gates and recorded in `260904-1050-orchestrator-session.md` — and its letter does not. Nothing in the work is wrong; two sentences of the same plan disagree.

**5. The `_i_` departure at step 14 is sound, and its reasoning is better than conformance would have been.** `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md` carries `_i_` where the step's default would leave `_a_`, with a `**Marker note.**` giving the reason: an answer of "never written" did shape code. Verified rather than accepted — `grep -i worker bin/fusion-checkout-name` returns nothing, the usage line at `:16` and `:211` reads `register [--alias A] [--person P]`, and `hooks/lib/__tests__/fusion-checkout-name.test.ts:94` asserts a written entry contains no `worker`. Realisation by absence is verifiable, so `_i_` is the marker that describes it. A reader meeting `_a_` would look for work still owed, and none is.

**6. A record filed today carries the retired placeholder footer.** `260904-1651_*_may-a-project-declare-that-it-does-not-want-a-checkout-registry.md` closes with the `Answered:/Implemented:/Deferred:/Superseded by:` stub. `rules/fusion-workbench-conventions.md` `## Decision Record Template` says "No footer: a record gains its annotation line at the transition", and the sentence permitting a stub to stand covers records written before the removal, not a new one. Left as it stands rather than edited; noted so it is not read as the current form.

**7. Nothing in the parallel consultation contradicts what this Circle built.** `260905-0529-consumer-findings-citation-form-and-decision-authority.md` R1 names a contradiction in `rules/fusion-workbench-conventions.md`, which this Circle edited three times. The Circle's hunks are at lines 46-49 (the layout tree), 80-83 and 443-452 (`### Who filed it`), measured with `git diff -U0 cda72f71..HEAD`. R1's two sentences are `:243` and `:274`, untouched by this Circle and by every commit in its range. Nor does the Circle's own practice follow the sentence R1 wants deleted: step 14's `Answered:` lines use the storeless basename plus a heading anchor, which is the binding form at `:243` and the form 13 of this project's 33 `_a_` records use. `bin/fusion-citation-check` reports `verdict=clean` over the whole tree, and all 16 `store-prefixed` hits are `not-edited`.

R4 does bear on this pass rather than on the Circle: it names `agents/reconciler.md:132` as one half of an unsettled question about whether a dispatched agent may perform `_o_`→`_a_` at all. No such transition was performed here, and none was warranted — no answer exists on disk for any of the three open Circle decisions.

## Verification re-run at this commit

- `cd hooks && npm test` — **green**: 48 files, 825 tests, exit 0. The `citation-sweep.test.ts` failure recorded at step 13 was inherited from before `cda72f71` and closed at `dc2116f4`.
- `bin/fusion-citation-check` — `verdict=clean`, `files=2379 tokens=22322 resolved=17294 store-prefixed=16`, every one of the 16 `not-edited`.
- `bin/fusion-staging-drift` — `verdict=clean`, one `in-flight` row (`orchestrator-events.jsonl`).
- `git diff v10.20.0..HEAD` over `growth-bound.ts`, `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` — empty. No head-room baseline moved. The `reference-resolution-lint` `BASELINE` is an inventory pin, not a head-room baseline, and its move is documented with shares measured by single-file revert.
- Version surfaces: `plugin.json:3`, `install.sh:27` and `README.md:26` all read `10.21.0`. The marketplace clone at `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins` reads `10.20.0` with a clean tree, and no `v10.21.0` tag exists. Three of four agree; the fourth is outstanding because the release was prepared and not pushed, which is what the closure precondition intends.

## Review coverage

`bin/fusion-review-coverage --since v10.20.0` reported `commits=16 uncovered=16`. Independently confirmed here from the other side: **no review file exists for this range at all**, in the Circle's store or the shared one. Every claim about this Circle's 18 commits rests on the executors' self-reports, on the test suite, and on this pass.

That is advisory and not a fault. `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` settled that a Circle may close over an uncovered range, with the gap named and the user deciding, and the release precondition requires only that the number is visible before the tag. It does not flag any edge. What it does is set the confidence the Artifact↔Grounding edge carries, and it belongs in front of the user at the closure gate rather than in a verdict.

## New issues filed

None. Every discrepancy this pass found is either corrected in place (finding 1), already filed and correctly open (finding 2), or a documentation tension inside a live plan and its Circle record that the next session's step 15 and closure gate will meet anyway (findings 3, 4, 6).

## Not committed

The three corrected decision records, the plan rename and this file are on disk and uncommitted. A reconciliation pass writes tracking files; the commit belongs to whoever runs the cleanup pipeline, under `bin/fusion-commit-lock`.
