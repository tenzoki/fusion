# Planner session: the implementation plan for four constraints on deep change

**Status:** Complete
**Agent:** planner
**Circle:** `circles/260819-1645-four-constraints-on-deep-change`
**Repository HEAD:** `b91c01c`
**Executors offered:** coder, ontocoder, analyst

## What was produced

- The plan, at `circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_o_four-constraints-on-deep-change.md`. Ten steps, all routed to `coder`, with steps 9 and 10 behind an explicit user gate naming two decision records.
- One new decision record, at `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-2016_o_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`.
- One `Also seen:` line appended to the open corpus decision `260819-1645`, recording that "the open decisions" has two readings and that only the wider one reproduces the Grounding's figures.

Nothing was implemented and nothing was committed.

## What was measured, and how

Every figure below was taken in this run rather than carried over from the Grounding snapshot.

**Constraint 1 is green at the moment it would be armed.** `git archive HEAD hooks` into a temporary directory, `node_modules/.bin/tsc --outDir`, then a file-set and byte comparison against the extracted `hooks/dist`: identical in all 36 files. A second compile of the same tree is byte-identical to the first, so the emit is reproducible for this compiler. One compile costs 3.5 seconds. `hooks/package-lock.json` records `typescript` at `5.9.3` and that is what is installed, while `hooks/package.json` declares the caret range `^5.6.0`. No file in `hooks/dist` emits an `import(` type or references `node:`, so `@types/node` does not reach the emit as the sources stand.

**Constraint 2's gap is unchanged.** One hit for `NotebookEdit`, `MultiEdit` and `notebook_path` across the test tree, at `hooks-wiring.test.ts:70`, still the matcher-list assertion. `runGuard` is exported beside `runWrite`, so the `notebook_path` payload has an entry point.

**Constraint 3's placement.** `agents/orchestrator.md:983` sits in the `## Error Handling` table and governs the orchestrator's own revert. The dispatch obligations are the four-item list under Step 3a item 4. The plan adds a bullet there and does not touch line 983, and it says why.

**Constraint 4's corpus, measured under both readings of "the open decisions".**

| Corpus reading | Files | Tokens | Resolved | Dangling | Undecidable | Exempt |
|---|---|---|---|---|---|---|
| decisions `_o_` only | 169 | 1 556 | 719 | 203 | 590 | 44 |
| decisions `_o_` and `_a_` | 189 | 1 754 | 783 | 242 | 685 | 44 |

The Grounding's 1 711 tokens and 245 dangling reproduce under the second reading. The three-token difference is this session's own records entering the tree, so the count moved with no citation touched.

**The gate reaches fewer tokens than the repair scope names.** `scanRecordCitations` filters on `GATE_KINDS`, which excludes the `stamp-name` class. Over the wider corpus it returns 209 violations across 81 files, against `partition()`'s 242. The 33-token gap is the new decision record. The 209 split into 98 stale markers, 49 wrong-store paths and 62 that resolve to nothing, which is what makes the repair three steps rather than one.

**Head-room.** `agents/*.md` leaves 3 309 bytes of 18 000, `skills/*/SKILL.md` leaves 9 716 of 20 000, the hook test surface leaves 1 877 lines of 2 500. `rules/circle-records.md` is a conditional emission at `bin/fusion-rules:432` and `rules/` is outside the three bounded surfaces, so step 4 costs no budget.

**The archive filter, against the code.** `skills/archive/SKILL.md` checks `CLAUDE.md` alone, by `grep -F` on the basename and the workbench-relative path, stated at `:112`, executed at `:185-187` and restated at `:282`. The plan is written against that and not against the wider description the defect record carried before its `Revised by:` line.

## What was deliberately not done

The open corpus decision was not answered and no option was assumed. The plan runs the citation repair over the wider of the two corpus readings so that it satisfies either answer, and puts the arming of the gate behind a gate that names both open decisions. The three options' consequences for the plan are set out in `## Open Questions`.

No executor was dispatched.
