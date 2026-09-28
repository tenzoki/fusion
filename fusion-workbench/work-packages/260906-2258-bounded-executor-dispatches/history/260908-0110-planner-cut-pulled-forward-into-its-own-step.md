# Planner: the named cut becomes Step 8, and the plan is renumbered to sixteen steps

**Date:** 2026-09-08
**Agent:** planner
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Circle:** `260906-2258-bounded-executor-dispatches`
**Artifact:** `260907-1450_*_plan-bounded-executor-dispatches.md`
**Source:** `260908-0025_*_the-agents-budget-is-281-bytes-short-after-another-sessions-growth-so-what-gives.md`, answered option 1

## What was asked

Not a new plan. A structural change to the existing one, out of an answered decision. The user ruled option 1 on 2026-09-08, which was the record's own recommendation: take the cut the old Step 14 named as a fallback and make it a step of its own, ahead of the steps that spend bytes. The two "why this is a rule and not a preference" narratives move from `agents/orchestrator.md` Step 3b steps 3 and 4 into `rules/commit-lock.md`, with a pointer left at each site.

## What was done

**The cut is Step 8** and the plan has sixteen steps. It carries the file, both narratives found by their opening text rather than by line number, the receiving section written out as a Markdown skeleton, both pointer lines verbatim, the golden regeneration, an ordering note against Step 7, five verification commands and an acceptance criterion. Its executor is `coder`.

**Everything from the old Step 8 upward moved by one**, and every dependency, cross-reference and graph node moved with it. Step 9 gains a dependency on Step 8 and a sentence saying it is not reorderable. Both Mermaid diagrams were redrawn.

**The byte reckoning was recomputed with the cut as income.** Step 15 keeps the measurement, loses the fallback, and now states in as many words that its stopping condition is real: one relief remains, writing the ten edits tighter against caps that are already caps, and past that no identified cut leaves a reader whole. The old Step 14's fallback paragraph was replaced rather than trimmed.

**Provenance is recorded at four places** so a later reader does not have to wonder why a Circle about dispatch bounds moves two paragraphs about the commit lock: the revision header, the Approach section, Step 8's own "why this step exists", and the risk table.

## Two findings the work turned up

**A budget in the plan disagreed with itself by 140 bytes.** Step 10 (old Step 9) stated a step budget of 2 050 while its nine itemised changes sum to 2 190. The 2 050 is items 1 through 8; item 9, the error-handling table row at 140 bytes, arrived with the fourth planability check's third recommendation and the step total was never brought along. An executor measuring that step with `wc -c` against 2 050 would have failed its own verification while writing exactly what the plan asked for. Corrected to 2 190. This also identifies the "stray 3 650" an earlier revision recorded as "never the sum of anything in the table": it was the sum of the two step-level budgets, and it was wrong because one of those two was.

**The landing site absorbs the move without a second gate**, checked four ways before the step was written rather than left to the executor to discover. `rules/commit-lock.md` weighs 7 004 against a `RULE_BASELINE` entry of 9 250, so it is 2 246 bytes under its own baseline and stays under it. It is a conditional emission and is outside the universal core the hard bound measures. `RELEASE_CAP` compares a floor, which is a constant map, so growth cannot trip it. The orchestrator's whole rule load is 123 964 against a `DRIFT_CEILING` of 145 144.

## The measurement, taken twice

A second session is writing in this checkout, so the `agents/` head-room was measured at the start of this run and again at the end. **Both readings are 414 334 bytes**, giving 14 491 over the `AGENT_BASELINE` sum of 399 843 and **3 509 bytes of head-room** against `AGENT_HEAD_ROOM` of 18 000. The second session's uncommitted change to `agents/playmaker.md` was already in the tree at the first reading and did not move during the run, so the figure the plan is written to is the figure that stood when it was finished.

The cut removes 1 032 bytes (578 and 454) and writes about 295 back, netting about 737. Head-room after Step 8 is about 4 246 against 3 790 budgeted, leaving about 456 of margin and no reserve.

## Gates run

`workbench-citation-lint.test.ts` and `plan-stopping-section-lint.test.ts` both green, so every citation added resolves and `## Where this Circle stops` survived the renumbering intact. `bin/fusion-prose-metric` reads 6 em-dashes over 13 989 prose words, 0.4 per 1000 against a permitted 13.

## What was not touched

The gate at Step 1 and its execution note, the 20 minutes, the seven bound agents, the executors of every existing step, and the substance of `## Where this Circle stops`. No code, data or ontology file was modified: this run wrote the plan and this entry, and nothing else.
