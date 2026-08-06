# Session: planner — repair pass on the shell reachability plan

**Date:** 2026-08-07 01:30
**Agent:** planner
**Circle:** `circles/260804-1205-shell-reachability-model`
**Status:** Complete

## Directive

Repair the approved plan `planning/260806-2353_o_plan-shell-reachability-model.md` in place against the
diagram evaluation `reviews/260807-0002-conceptrev-plan-shell-reachability-model.md` (verdict tangled,
diagram 2 only). Three findings to resolve; step numbering and step 1 (landed as `3dc5014`) not to be
disturbed.

## What was done

Revised sections in place. No wholesale rewrite, no renumbering, no dependency-graph change.

1. **Finding 2, the load-bearing one — the multi-line spelling denied.** Evaluated the review's suggested
   mirror lookback and did not adopt it: it makes `transparent` a second inherited table row, which
   contradicts the two-literal-fields property the suite pins, and it handles one grammar word rather than a
   run of them. Took instead a **candidate/pending rule** — a segment's leading grammar words imply at most
   one candidate edge for the following command position; a segment with a command word consumes its
   candidate, else the pending edge, else the raw operator; a segment with no command word types
   `transparent` and hands its candidate on. Both spellings then travel one path. No inheritance survives at
   lookup time.
2. **Finding 1 — the decision procedure was not total.** Diagram 2 redrawn in two phases (candidate, then
   consumption, then the pipeline substitution) with a `nothing recognised` catch-all and both exits of every
   diamond drawn. Caption replaced with a statement of why it is total and disjoint.
3. **Finding 3 — the closing-word vocabulary.** Verified against the source: `GRAMMAR_PREFIXES`
   (`command-word.ts:58-70`) holds the opening words only and its docstring (`:44-52`) names the terminators
   as a deliberate exclusion; `findCommandWord` (`:183-191`) skips every member. Settled as a second,
   separately purposed exported set `GRAMMAR_TERMINATORS`, with disjointness pinned. Corrected the plan's
   Current State claim that the vocabulary was already enumerated once.

Two consequences the findings forced out, both verified rather than inferred:

- **A module cycle.** `command-word.ts:35` imports `shell-parse.ts`, so the plan's instruction to read
  `GRAMMAR_PREFIXES` from inside the parser would have closed a cycle. The layer moves to its own module
  `hooks/lib/shell-reach.ts`, which makes invariant 1 structural (the parser is not edited at all) and gives
  S6 a module name to forbid.
- **The corpus lacks the shape the change is about.** `reachability-corpus.ts:461-486` renders the four
  compound wrappers single-line only; the multi-line spelling is in none of the 24,304 rows. S2 gains a
  spelling dimension and a baseline regeneration, required before S3 lands.

Folded in the three facts the coder measured in S1: the zsh/bash disagreement on `echo hi | cd build && rm
out.js` now backs the rejected-alternative argument with evidence; `chdir`'s exit 127 under bash and
`until popd`'s non-termination become two of S5's three witness reading rules; the seventh wrapper
`pipe-head` is credited in the risk table.

All three Mermaid blocks re-validated by rendering (`@mermaid-js/mermaid-cli`, all three OK).

## Artifacts

- Revised: `circles/260804-1205-shell-reachability-model/planning/260806-2353_o_plan-shell-reachability-model.md`

## Open

- `fusion-workbench/tasklist.md` entries `P:S2`, `P:S4`, `P:S5`, `P:S6` restate the pre-repair step detail
  verbatim and are now stale. A taskplanner refresh is needed before S2 is dispatched. The IDs and the
  dependency graph are unchanged.
- No issue filed and no decision recorded: the three findings were plan defects repaired in the plan, not
  defects in code or open questions for the user.
