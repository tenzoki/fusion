# Step 7a — the configuration loader is reduced to one leaf, and step 5's second half

**Date:** 2026-08-16
**Agent:** coder
**Status:** Complete
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 7a and the second half of step 5
**Predecessor commits:** `05d848b` (step 1), `2f624ca` (step 2), `9c79202` (steps 3 and 6), `ec3b6ad` (step 4), `3c2e1c6` (step 5, first half)

## What the step asked for

Reduce `hooks/lib/config.ts` to one live leaf, `orchestrator.maxTurns`. Rename the
project-root configuration file to `fusion.json`. Generalise retirement from one scope to two
in one table family. Rewrite `hooks/turn-budget.ts`'s docstring, which explained at length why
a non-guard setting lived in the guard's configuration file. Then, and only once
`findRelevantDecisions` was gone, reduce `hooks/lib/paths.ts` to `foldCase`.

The step's user gate was discharged at the plan gate on 2026-08-16: the loader keeps two merge
layers and no `guard.enabled` (`260816-1915`, option 1), Setup makes no migration offer
(`260816-1916`, option 1), and the new file is `fusion.json`.

## What landed

| File | Before | After |
|---|---|---|
| `hooks/lib/config.ts` | 742 lines | 502 |
| `hooks/lib/paths.ts` | 161 lines | 55 |
| `hooks/turn-budget.ts` | 91 lines | 100 |

281 insertions, 618 deletions across the three. No JSON file was touched; no test file was
touched; `bin/fusion-turn-budget` was not touched.

### The loader

Cut: the `guard`, `decisions` and `escalation` settings out of `GuardSettings`, `RawConfig`,
`DEFAULTS`, `CONTAINER_LEAF_RULES` and the merge; `Sensitivity`, `Decision`, `ConfigLayer`,
`sensitivityLevel`, `findRelevantDecisions`; the sensitivity validators (`SENSITIVITIES`,
`isSensitivity`, `isRecordOf`, `isStringArray`, `isBoolean`, `isDecisionArray`); the plugin
layer, and with it `findConfigPath`, `ConfigSources.pluginConfigPath`, `readLayer`'s and
`validateLayer`'s `kind` parameter, the missing-plugin-file diagnostic and the `guard.enabled`
project-layer refusal. `TOP_LEVEL_LEAF_RULES` folded away with `decisions`, its only member.

`orchestrator.maxTurns` is left as the one live leaf, with `DEFAULTS` as its single definition
site. The per-leaf walk is kept as the shape rather than collapsed into a single `??`, so the
next setting to land inherits the rule instead of re-deriving it.

`PROJECT_CONFIG_FILENAME` is `fusion.json`.

### Retirement, at two scopes

`RETIRED_CONTAINER_LEAVES` had exactly one member, `guard.protectedPaths`, and that leaf now
sits inside a retired container, so the container's own diagnostic names it. The table folded
away. Two tables replace it, in the same family and the same "named once per guarded call until
the line comes out" contract:

- `RETIRED_PROJECT_FILES` — a whole file at the project root, probed with `existsSync` and
  never parsed. One member: `fusion-guard.json`.
- `RETIRED_TOP_LEVEL_KEYS` — a top-level key inside the file that *is* read, which is what a
  project sees if it copies its old file across rather than starting from the template. Three
  members: `guard`, `decisions`, `escalation`.

A retired top-level key is checked before anything else about the key, so a retired container
is not walked into: its leaves are retired with it, and one advisory naming the container beats
one per leaf inside a key that no longer means anything.

The diagnostic prefix moved from `Guard configuration` to `fusion configuration`, because after
this step there is no guard configuration. Measured before changing it: no test file outside
`config.test.ts`, `guard-project-config-integration.test.ts` and `turn-budget-lint.test.ts`
asserts on that string, and `bin/monitor` does not read it.

### The retired-file diagnostic, which is the whole of the migration

The user chose it over a Setup step (`260816-1916`, option 1), so it carries the loss alone.
Emitted verbatim, from this repository's own root:

```
fusion configuration: /Users/k1/Projects/productive/fusion/fusion-guard.json is no longer
read — fusion removed the guard settings this file configured. The one setting it carried that
was never the guard's, "orchestrator.maxTurns", now lives in fusion.json at the project root.
If this file sets a Turn budget, copy {"orchestrator": {"maxTurns": <n>}} into fusion.json
first: a budget left here is not read, and the orchestrator falls back to fusion's built-in
default without saying so. Then delete this file to stop this advisory.
```

It names the key, names the destination and says to copy before deleting, which is what the
plan's risk table and both decision records require of it. A project that carried a budget of
12 and does nothing is the failure this text exists to prevent.

### `hooks/turn-budget.ts`

No logic change. Two docstring claims were false after this step and one was already false:

- "the project's `fusion-guard.json`, then the plugin's `hooks/config.json`, then the built-in
  `DEFAULTS`" — now `fusion.json`, then `DEFAULTS`.
- the paragraph explaining why a non-guard setting lives in the guard's configuration file —
  retired with its subject; the budget is now the one setting the file carries.
- "the orchestrator carries the answer in `agentstate.yaml` where `progress.max_turns` already
  had a home" — false since 2026-08-15, when that file's counters went. Corrected to past
  tense while the file was open. Measured rather than assumed: `agents/orchestrator.md:138`
  states plainly that `agentstate.yaml` carries no `max_turns` field, and
  `turn-budget-lint.test.ts:242` asserts it. No step in this plan owns this file except 7a, so
  leaving it would have left it standing.

### `hooks/lib/paths.ts`, step 5's second half

Reduced to `foldCase`. `globToRegex`, `matchesPattern`, `matchesAny` and `collapseSegments` are
deleted, along with the `node:path` import.

The header is rewritten. It explained a trailing-separator asymmetry between a deny-side and a
grant-side matched set; both sides are gone, so the explanation is recorded as history rather
than restated as a live property. It also carried a deferred question (whether the surviving
`categoryPaths` match should fold case, `260804-1632_d_*`); that question's subject was deleted
with the match, and the header now says so, because step 13's decision walk will want it.

## The measurement that gated the deletion

The dispatch asked for grep before deleting each of the four, on the ground that two of this
plan's dependency claims have already been wrong in exactly this way. Both greps were run, over
`hooks/**/*.ts` excluding `dist/` and `node_modules/`.

Before the loader was rewritten, `matchesAny` had two hits outside `paths.ts` and its own test:
`lib/config.ts:155` (import) and `:736` (inside `findRelevantDecisions`). `globToRegex`,
`matchesPattern` and `collapseSegments` had none.

After the loader was rewritten and before `paths.ts` was touched, all four had **zero** hits
outside `lib/paths.ts` itself and `lib/__tests__/paths.test.ts`. `foldCase` kept
`tracker.ts:101`, `:306`, `:307`. That is the state issue `260816-2108` said the reduction had
to wait for, and it is the state that was measured rather than assumed before the four were
cut.

## Verification

| Command | Exit |
|---|---|
| `cd hooks && npm run build` | 0 |
| `./bin/fusion-turn-budget` (repository root) | 0 |
| `cd hooks && npm test` (before the change) | 1 — 11 files / 45 cases red |
| `cd hooks && npm test` (after) | 1 — 13 files / 117 cases red |

`bin/fusion-turn-budget` from the repository root prints `max_turns=5` on stdout and the
retired-file diagnostic on stderr. The `5` is correct and expected between 7a and 7b: this
repository's budget of 12 is still in `fusion-guard.json`, which is no longer read, and
`fusion.json` does not exist until step 7b writes it. The plan's own verification line for 7a
says `max_turns=12` **after step 7b**.

Three further behaviours were measured against a throwaway project root rather than inferred,
because the retired-key half has no other reader until step 9 re-points the tests:

- a `fusion.json` carrying `guard`, `decisions`, `escalation` and `orchestrator.maxTurns: 12`
  emits one advisory per retired container and resolves `max_turns=12`;
- the same file with `maxTurns: 0` drops the leaf, names it, and inherits `max_turns=5`;
- with `fusion-guard.json` also present, the retired-file advisory is emitted first, ahead of
  the per-key ones. That order is deliberate and commented: a file that is not read at all is
  the most upstream thing a reader can be wrong about.

Nothing was committed.

## Test-surface delta, and every red case attributed

| | Before | After |
|---|---|---|
| Red files | 11 | 13 |
| Red cases | 45 | 117 |

Newly red files, both named in the dispatch and both step 9's:

| File | Red cases | Why |
|---|---|---|
| `lib/__tests__/config.test.ts` | 53 | its subject is the three-layer merge, the guard settings and the plugin layer |
| `lib/__tests__/paths.test.ts` | 14 | its `globToRegex`, `matchesPattern`, `matchesAny` and `collapseSegments` groups lost their subject; the `foldCase` group is green |

Five cases moved inside files that were already red, and each was identified by name rather
than by count — the two files were run at the pre-change sources and again after, and the case
lists diffed:

| Case | Cause |
|---|---|
| `a retired key reaches the user > names guard.protectedPaths and says what to do, without denying anything` | the leaf-scoped table folded away; the key is now announced through its retired container |
| `a retired key reaches the user > repeats it on every guarded call, write tool and Bash alike` | same |
| `what a project configuration can and cannot reach > reports the ignored key, once, naming it — decision 260804-1631` | `guard.enabled`'s project-layer refusal retired with the container |
| `an unparseable project configuration > leaves an innocuous Bash call in a VALID-config project writing nothing` | the harness seeds `fusion-guard.json`, now a retired file, so one advisory is emitted where the case expects none |
| `the Edit write path still denies a governed path > allows an unguarded file_path, and records the allow` | same harness cause |

53 + 14 + 5 = 72, and 45 + 72 = 117. **Nothing red is unattributed**, and every one of the
seven is step 9's, whose edit list already names `config.test.ts`,
`guard-project-config-integration.test.ts`, `guard-bash-integration.test.ts` (added by the plan
amendment, defect `260816-2021`), `helpers/guard-harness.ts` and — through the same amendment's
reading of `260816-2108` — `paths.test.ts`.

**One harness consequence step 9 should know about, because it is not in any of those
records.** `helpers/guard-harness.ts` seeds `fusion-guard.json` into throwaway project roots
through its `files` option and `projectConfig`. That filename is now a *retired file*, so every
harness project carrying one emits an extra `guard_advisory` per guarded call, whatever else
the case is testing. Two of the five moved cases above are that and nothing else. Step 9's
harness reduction has to rename the seeded file to `fusion.json`, not merely drop the governed
fixtures.

### Two files the dispatch expected to move and which did not

- `lib/__tests__/turn-budget-lint.test.ts` is **still green**. It reads `hooks/lib/config.ts`
  only to count `maxTurns: <n>` assignments, which is still exactly one, and its other two
  configuration cases read `hooks/config.json`, `templates/fusion-guard.json` and the
  repository-root `fusion-guard.json` — all three of which still exist until step 7b. It will
  move at 7b, not here.
- `lib/__tests__/derivable-enumerations-lint.test.ts` is red at exactly the same one case as
  before (`the hooks/lib file table in README-hooks.md > lists exactly the lib/*.ts files that
  exist`), which step 5's first half caused and step 11 fixes. `lib/paths.ts` still exists, so
  the reduction added nothing to it.

## Not done, deliberately

- No JSON file was touched. `templates/fusion-guard.json`, the repository-root
  `fusion-guard.json`, `hooks/config.json` and `hooks/config.example.json` are step 7b's, which
  routes to `ontocoder`. **Between 7a and 7b the loader looks for a file that does not exist**,
  which is the expected intermediate state.
- `bin/fusion-turn-budget`'s header still documents `fusion-guard.json` as the project file.
  Filed as `260816-2124`, step 11's.
- No test file was touched, and no decision record was transitioned — step 13 holds that walk.
- Nothing committed.
