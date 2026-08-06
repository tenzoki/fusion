# Planner session — the shell reachability model

**Date:** 2026-08-06
**Agent:** planner (dispatched)
**Circle:** `circles/260804-1205-shell-reachability-model`
**Status:** Complete
**Output:** `circles/260804-1205-shell-reachability-model/planning/260806-2353_o_plan-shell-reachability-model.md`

## What was read

The Circle record, decision `260804-0947` (option 2, its five constraints and its recommendation), issue `260804-0839` (four shapes, anti-vacuity pins, two reconciliations and the Step 3 disposition), the `### The boundary, by coverage` section of review `260804-0845`, and the two absorbed defects (`260803-1352`, `260806-0022`).

Code read in full or in the relevant range: `hooks/lib/shell-parse.ts` (885 lines), `hooks/lib/bash-mutation-guard.ts` (module docstring, the joiner table at `:2229-2313`, the segment walk at `:3168-3297`), `hooks/lib/command-word.ts` `GRAMMAR_PREFIXES`, `hooks/lib/__tests__/bash-mutation-guard.test.ts:3420-3818`, the git insulation pins in `hooks/lib/__tests__/git-branch-guard.test.ts:727-760`, `hooks/lib/__tests__/shell-parse.test.ts` (the joiner and equivalence assertions), `helpers/guard-harness.ts`, and `rules/protected-path-discipline.md:120-270` plus its residual paragraph at `:330-348`.

## What the plan decides

**The design.** The joiner is replaced by a grammar-derived reachability edge; the guard's existing one-table, one-reader, safe-list machinery is re-keyed onto it. `JOINER_FACTS` becomes `REACH_FACTS` with the same two fields and the same absent-row default. No new mechanism is introduced.

**One shape was considered and rejected.** Making a pipeline element a scope alongside `(…)` and `$(…)` — the framing decision `260804-0947` option 2 gestures at — restores the outer directory on exit, and `echo hi | cd build && rm out.js` would then allow where it denies today, because bash subshells the element while zsh runs the last one in the calling shell. The edge vocabulary expresses the same subshell fact with machinery already in the module, and the pessimism across the two shells is preserved.

**Two invariants bound the blast radius**, and both are checkable rather than asserted: the parser layer is additive (`joiner` and the segmentation are untouched, so blank mode stays byte-identical), and an edge the layer cannot type falls back to today's flat answer, so only positively recognised shapes can move a verdict.

**Three edge rows carry the change**, and each was stress-tested against the pinned cases before being written down: `cond-true` is the relief, `cond-false` is what keeps `until` denying, `transparent` is what makes a brace group work without a scope while `{ cd build; ls; } && rm out.js` still denies. A fourth, `pipe-member`, is the one answer that changes rather than being added, and it tightens as well as relaxes — the pipeline **head** must stop moving the calling shell, or `cd build | grep x && rm out.js` newly allows.

## One correction to a constraint, raised for the gate

Constraint 1 as the Circle record states it ("no command may newly allow") contradicts the Directive, which exists to make 84 commands newly allow. The plan restates it in the form that is both true and testable: every deny-to-allow transition must be individually justified by a shell measurement showing the write lands where the model now says it does, and an unjustified transition is a regression. Step 5 proves it in that form.

## Steps and routing

Eleven steps, all routed to `coder` — no structured-data file is touched, so `ontocoder` owns nothing here. The measurement instrument is step 1 rather than a late verification, because a corpus harvested from the test suite measures reproduction and two such enumerations were falsified in the parent Circle within a day.

Two human gates: the measured cost after step 5, and the release after step 10. Step 10 carries a conditional gate — if the recommended resolution for the setup/migrate scope gap does not hold, the coder files a decision record rather than choosing.

## Not filed

No new issue and no new decision record. The three open questions the plan carries are recorded in its `## Open Questions` section: two are predictions the measurement will settle, and the third is the setup/migrate resolution, which the source issue already states with both options and a criterion. Filing a duplicate record beside it would add a second home for one question.
