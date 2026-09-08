# Documented `orchestrator.dispatchMinutes` in both `fusion.json` files

**Status:** Complete
**Filed by:** ontocoder, Kai Stalmann <ks@qantr.com>

Task S4 of `260907-1450_p_plan-bounded-executor-dispatches.md`, section `### 4. Document the
setting in the two fusion.json files`.

## What was asked

Add a top-level `"_dispatchBound"` documentation key to `templates/fusion.json` and to this
repository's own `fusion.json`, byte-identical in both, and amend `"_what"` in both so the
sentence naming what the file configures covers three settings rather than two. Do not
declare the leaf itself in this repository's `orchestrator` object, and do not restate the
shipped default of 20 minutes.

## What was done

Both files, at the project root:

- `_what`: the sentence now names three settings and three notes (`_turnBudget`,
  `_dispatchBound`, `_citations`).
- `_dispatchBound`, new, inserted between `_turnBudget` and `_citations` with the same
  surrounding blank lines in both files. It states the shape
  (`"orchestrator": {"dispatchMinutes": 35}`, an example value chosen so the file carries no
  second copy of the default), the wall-clock meaning, the per-leaf merge from `_override`,
  the single read by `bin/fusion-turn-budget` at the orchestrator's Setup and by no hook, the
  single definition site for fusion's own default (`DEFAULTS` in `hooks/lib/config.ts`, the
  number itself deliberately not written here), the drop-name-inherit behaviour of a value
  that is not a whole number of 1 or more, and that the bound is requested and never
  enforced, which is why the only off state is a value no dispatch reaches and why no second
  switch exists.
- `_turnBudget`, one clause: its opening said the Turn budget was one of *two* things this
  file configures and named `_citations` as "the other". The new key falsified that sentence
  directly, so the clause now names three and points at both siblings. This ripple was not in
  the task's change list; it is reported to the dispatcher as a change made beyond it.

`fusion.json`'s `orchestrator` object still reads `{ "maxTurns": 12 }` — no `dispatchMinutes`
declaration, so this project takes the shipped default.

## Verification

- `cd hooks && npm test -- config` — exit 0 (56 tests, `config.test.ts` and
  `guard-project-config-integration.test.ts`). The drift check comparing every byte of the two
  files outside the `orchestrator` and `citations` entries is green, so the new key and both
  amendments are byte-identical across the pair.
- `python3 -c "import json;[json.load(open(p)) for p in ['fusion.json','templates/fusion.json']]"`
  — exit 0.
- Additional spot check: `_dispatchBound`, `_what` and `_turnBudget` compare equal between the
  two parsed files; the repository copy's key order is `orchestrator`, `citations`, `_what`,
  `_override`, `_turnBudget`, `_dispatchBound`, `_citations`, `_retired`, `_gitTracked`, and
  the template's is the same list without the first two.

## Side effects

- `_gitTracked` still says the file "decides how many Turns the orchestrator may run against
  your project" as its reason for living in version control. That is now one of three things
  it decides rather than the only one. The sentence is incomplete, not false, and it was left
  alone: the task named two changes and the `_turnBudget` clause above was the only one this
  edit made untrue.
- No consumer beyond `config.test.ts` reads either file's documentation keys, so nothing else
  needed updating.
