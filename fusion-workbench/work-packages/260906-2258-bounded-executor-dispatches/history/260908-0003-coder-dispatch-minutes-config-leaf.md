# Step 2 of the bounded-dispatch plan: `orchestrator.dispatchMinutes` enters the configuration loader

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Step 2 of `260907-1450_*_plan-bounded-executor-dispatches.md`, and only that step: add the
`orchestrator.dispatchMinutes` leaf to `hooks/lib/config.ts`, in four edits, each beside its
existing `maxTurns` sibling, with the measurement standing verbatim beside the default.

## What was done

One file, `hooks/lib/config.ts`, four edits, no fifth:

1. `interface GuardSettings`, the `orchestrator` object: `dispatchMinutes: number;` with a
   docstring naming it the requested stopping time in minutes the orchestrator hands to a bound
   agent's dispatch, read by `bin/fusion-turn-budget` at Setup and by no hook.
2. `const DEFAULTS`, `orchestrator`: `dispatchMinutes: 20,`, carrying both sentences of C1's
   fourth criterion verbatim, plus the two attributions the step requires around them: the log
   the first sentence reads (`fusion-workbench/orchestrator-events.jsonl`, on the date named in
   the sentence) and the report the second comes from
   (`260907-2012-break-even-arithmetic-for-the-dispatch-split.md`).
3. `const CONTAINER_LEAF_RULES`, `orchestrator`: `dispatchMinutes: { explain: explainPositiveInteger },`.
   The existing validator, reused; no new one written.
4. `loadConfig`'s returned `value`, `orchestrator`: `dispatchMinutes: pickOrchestrator("dispatchMinutes"),`.
   `pickOrchestrator` needed no change.

No container added, no second validator, no restatement of the default anywhere else,
`RETIRED_TOP_LEVEL_KEYS` untouched. `hooks/dist/lib/config.js` and `config.d.ts` moved with the
build, as `committed-dist.test.ts` requires.

## What was verified

`cd hooks && npm run build && npm test` exited **1**, on a failure this step did not cause and
did not touch. `config.test.ts` is green with no edit to it (49 tests), so the leaf sits inside
`PROJECT_SET_KEYS`' cut as the step required. The one failing case is
`citation-sweep.test.ts`, over the committed analysis file
`260907-0710-planability-of-the-bounded-dispatch-spec.md`, which carries two bare-record
citations. That defect is already filed and open as
`260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`;
no second record was written. The file is committed in `b1e49fe0`, is unmodified in this
working tree, and is read by a gate that reads no file under `hooks/`.

The step's acceptance criterion was checked against the compiled loader rather than inferred
from the source. Six declarations, each read through `loadConfig` with an injected project root:
`35` resolves 35 with no diagnostic; `0`, `-1`, `2.5` and `"20"` each resolve 20 with exactly one
diagnostic naming the key; an empty file resolves 20 with none.

The prescribed comment was diffed against the plan's own block quote, extracted from the plan
file rather than retyped: the diff is empty.

## What was not done

Nothing outside Step 2. The module docstring's `## The settings` section still names two
settings; the step prescribed four edits and named the docstring in none of them, and Step 4
is where the setting is documented for a project.
