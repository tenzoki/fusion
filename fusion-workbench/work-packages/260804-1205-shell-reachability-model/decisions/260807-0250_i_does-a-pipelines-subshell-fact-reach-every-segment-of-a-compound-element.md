# Does a pipeline's subshell fact reach every segment of a compound element, or only the segment the operator touches?

---
**Domain:** code
**Status:** implemented
**Filed by:** coder
**Cross-references:** `260807-0158-conceptrev-plan-shell-reachability-model.md` (the evaluation that posed the question); `hooks/lib/shell-reach.ts` (the answer, in the module docstring under "A COMPOUND COMMAND CAN ITSELF BE A PIPELINE ELEMENT"); `hooks/lib/__tests__/shell-reach.test.ts` (`describe("a compound command that is itself a pipeline element")`).

---

## Question

The reach layer's pipeline-membership test reads one adjacent operator per segment. A
compound command standing as an element of a pipeline puts the `|` next to neither the
mover nor the write, so `{ cd build; } | grep x && rm out.js` typed its mover `start` —
a carrying edge — and the model followed a directory change into a shell that never took
one. The question is what the subshell fact attaches to. It had to be answered before
plan step 3 wires the layer into the guard, because after that the wrong answer is a
shipped permission change rather than an unconsumed edge.

## Options

1. **The fact reaches every segment of the compound element** — every segment between the
   opener and the terminator types a pipeline row.
   - Pros: one rule, no boundary bookkeeping.
   - Cons: refuted by measurement. `{ cd rules; rm x.md; } | cat` deletes `rules/x.md`
     in bash and in zsh — inside the subshell the directory change is entirely real.
     Typing the interior as "in a pipeline, nothing moves" claims the write landed at the
     root and allows it.
2. **The fact reaches only the segment the `|` touches** — today's flat test, kept.
   - Pros: no change.
   - Cons: right only for an element in HEAD position, where the terminator happens to
     precede the `|`. For one in TAIL position (`echo hi | { cd rules; } && rm x.md`) the
     `|` touches the OPENING segment and the boundary that matters is still the closer.
     And in the multi-line spelling of the head position the touched segment (`}`) runs
     nothing, so the mover keeps its carrying edge either way.
3. **The fact is a property of the ELEMENT and lands at its closing boundary** — the
   segment that closes a compound command which is a pipeline element types a new edge
   `pipe-exit` (carries nothing); every segment inside keeps the edge it would have had if
   the element were not piped.
   - Pros: agrees with all three measurement rows below. Restores HEAD's answer exactly
     at the boundary, so it can only deny where the unfixed layer would have allowed.
   - Cons: needs a span stack — one more piece of state per scope — and needs `for`,
     `case` and `select` recognised as extent openers although their bodies stay
     unmodelled.

## Constraints

Any answer must satisfy all three, each measured in bash AND zsh against a throwaway
project (`hooks/lib/__tests__/helpers/shell-witness.ts`):

1. `{ cd build; } | cat && pwd` prints the project root. The `cd` does not reach past the
   pipeline — and `{ cd build; } | cat && rm rules/x.md` deletes `rules/x.md` in both
   shells, so this is a live protected write and not a modelling nicety.
2. `{ cd rules; rm x.md; } | cat` deletes `rules/x.md` in both shells. Inside the element
   the directory change is real.
3. `{ cd build; } && pwd` prints `<root>/build`. The same `}` must keep carrying when the
   group is not a pipeline element, so the rule cannot be about closing braces.

Constraint 1 as restated by the evaluation also holds: no deny may become an allow without
a shell measurement justifying it.

## Recommendation

Option 3, and it is forced rather than chosen. Option 1 fails constraint 2, option 2 fails
constraint 1 in tail position and in the multi-line head spelling. Constraint 3 is what
makes the rule conditional on the element being piped rather than on the terminator.

---
Answered: 260807-0250_*_does-a-pipelines-subshell-fact-reach-every-segment-of-a-compound-element.md — option 3. Neither option the evaluation offered survives the three
constraints; the measured answer is a third one.
Implemented: working tree (uncommitted at time of writing) — `hooks/lib/shell-reach.ts`
adds the `pipe-exit` edge, `SPAN_OPENERS`, a per-scope span stack and
`spanIsPipelineElement`. Measured effect: over the 93 744-row corpus the reach edges of
60 032 rows move, every one of them `transparent` → `pipe-exit` at a boundary (plus the
knock-on `pipe-member` → `pipe-unproven` on the following element) — the deny direction
only. The classifier does not consume the layer yet, so the full-corpus verdict
differential against HEAD `38c5123` is 0/0/0.

---
Retired: `ba7ccda` (260807-0931_*_plan-guard-misst-statt-orakelt.md) — the reachability layer this record's answer built was deleted the same day it was measured, without ever being consumed. The record's own footer says the classifier did not read the layer yet; `ba7ccda` removed `hooks/lib/shell-reach.ts` (786 lines), its test file, `helpers/reachability-corpus.ts`, `helpers/shell-witness.ts` and `fixtures/mutation-verdicts-head.json`. `pipe-exit`, `SPAN_OPENERS` and `spanIsPipelineElement` exist nowhere at HEAD.
