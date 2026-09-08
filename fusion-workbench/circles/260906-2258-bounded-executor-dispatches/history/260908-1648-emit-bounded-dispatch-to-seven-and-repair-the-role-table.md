# Emitted `rules/bounded-dispatch.md` to the seven bound agents and repaired the role table behind it

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Steps 6 and 7 of `260907-1450_*_plan-bounded-executor-dispatches.md`, dispatched as one unit of work
because step 7 exists only to repair what step 6 breaks and nothing else in the plan would have found it.

## What was done

**Step 6 — `bin/fusion-rules` and `README-agents.md`.** A new `IS_BOUND_AGENT` case arm beside
`IS_REVIEWER_AGENT`, naming coder, ontocoder, bugfixer, reconciler, coderev, ontorev and curator, with a
comment carrying the criterion the seven were sorted by and citing
`260907-0820_*_spec-bounded-executor-dispatches.md` for the sort itself. An indented
`emit_if_exists "$PLUGIN_RULES_DIR/bounded-dispatch.md"` in a new `1g.` block, indented because the
enumeration lint splits always-on from conditional emissions on exactly that and an unindented line would
be charged to the hard bound. One bullet in the header's filename-pattern convention block, in the shape
the `review-contract.md` bullet uses. One clause appended to `README-agents.md`'s `**Conditional:**`
bullet, on that same line, with all seven names backticked, because the lint requires the file name and
the whole derived set on one line and a commit carrying only the script would fail the suite.

**Step 7 — the role table and the golden.** Three `ROLES` entries deleted, each of which matched no agent
after step 6: `(core only)`, `review-contract.md`, `decision-record-examples.md`. `user-facing-output.md`
kept, because consultant is not bound and still matches it. Four entries added, keyed by the sorted
`" + "` join the test builds: `bounded-dispatch.md` (coder, ontocoder, bugfixer, and it says in prose
that it replaces the `(core only)` entry that was the floor the other roles were read against),
`bounded-dispatch.md + decision-record-examples.md` (reconciler), `bounded-dispatch.md +
review-contract.md` (coderev, ontorev), `bounded-dispatch.md + user-facing-output.md` (curator). None
needed an `overRelease`: the new file has no `RULE_BASELINE` entry, so it contributes 0 to a role's floor.
The golden was regenerated with `UPDATE_RULES_GOLDEN=1` and the diff read block by block.

**Three things changed that the plan did not name, each caused by the two steps and each reported.**
The `user-facing-output.md` entry's inline comment said `consultant, curator`; curator left that role, so
the comment now says `consultant`. The long doc comment describing the orchestrator's role sat above the
`review-contract.md` entry rather than above the orchestrator's own, and deleting that entry would have
left it attached to `user-facing-output.md`; the two one-line entries were moved above it so it is
adjacent to the entry it describes. The `ROLES` preamble asserted `Six roles` over a map that already
held ten and listed floors under role keys the 2026-08-27 gates had re-cut; the count was replaced by a
statement that the map is the only authority for which roles exist, and the floor list is now labelled as
the historical record it is.

**One fifth file, outside the dispatch's list.** `hooks/lib/__tests__/fixtures/surface-growth.golden`.
Step 7 edits a hook test file by construction, the `hook-tests` surface golden records every test file's
line count, and `rules-emission-golden.test.ts` went 1 154 -> 1 178 lines. Regenerating that fixture is
what its own failure message directs, and the line bound was not reached: the surface stands at 22 038
lines against `TEST_LINE_BASELINE` 20 766 plus 2 500 of head-room. No baseline was edited.

**One comment reworded to keep the reference baseline still.** The `1g.` block first cited
`rules/orchestrator-rebalance.md` as the precedent for reading a rule on demand. That is a path
reference, and it moved `reference-resolution-lint`'s pinned `paths` count from 1 721 to 1 722. Rather
than re-approve a pinned count for a comment's sake the sentence now names the Rebalance gate's rule
without spelling its path, and the lint is green with its baseline untouched.

## What was verified

| Command | Exit |
|---|---|
| `bin/fusion-rules <agent> \| grep bounded-dispatch`, each of the seven bound agents | 0 for all seven, path returned |
| `bin/fusion-rules <agent> \| grep -c bounded-dispatch`, each of the eight exempt agents | prints 0 for all eight |
| `bin/fusion-rules <agent>`, all fifteen agents | 0 for all fifteen |
| `cd hooks && npm test -- derivable-enumerations` | 0 |
| `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts` | 1, the deliberate failure, 1 failed of 12 |
| `cd hooks && npm test -- rules-emission` | 0 |
| `cd hooks && npm test` | 0, 924 tests in 53 files |

The golden diff was measured rather than eyeballed: a script parsed both versions into per-agent blocks
and compared them. Seven blocks changed — bugfixer, coder, coderev, curator, ontocoder, ontorev,
reconciler — each gaining `bounded-dispatch.md 9162` and its new total, with no block added or removed
and no other block touched.

## What was filed

`260908-1648_*_plan-step-7-asks-for-eight-changed-golden-blocks-where-seven-bound-agents-exist.md`: the
plan's step 7 asks for eight changed blocks "and no eighth" where seven bound agents exist, contradicting
its own acceptance criterion two bullets later. The dispatch prompt had already corrected the figure, so
the wrong number never governed the work.
