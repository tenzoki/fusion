# Step 2 — the project layer's boundary: what it may say, what an absence means, what nonsense costs

**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write` — C5b remediation plan, Step 2
**Plan:** `planning/260804-1633_o_plan-c5b-remediation-and-ship.md` `### Step 2`
**Date:** 260804, 17:05–17:30
**Status:** Complete
**Outcome:** **Built and verified through the harness.** `npx vitest run` green at **1394 passed, 25 files** (+50 cases: 33 unit, 17 integration). Three mutations applied, run and reverted; each broke rows that only a real guard verdict can break. Not committed — the orchestrator commits after validation.

---

## The three sentences the brief asked for first

**A project with no `fusion-guard.json` is still byte-identical.** The predecessor plan's assertion — `JSON.stringify` of the effective configuration against a verbatim transcription of the pre-Step-6 loader over the same shipped `hooks/config.json` — still passes, in both its forms (no project root, and a project root with no file). It needed one change and it is a change in the assertion's *subject*, not in its answer: `protectedPathsSource` joins `diagnostics` as a second load-report field, so the test helper `effective()` strips both. The settings themselves compare identical byte for byte. The diff that made the case fail before the helper was widened showed exactly one added field and nothing else, which is the evidence that the widening did not paper over a real change.

**A declared empty list still means empty.** Asserted at both layers: as a unit case (`guard.protectedPaths` comes back as `[PROJECT_CONFIG_FILENAME]` — the floor and nothing else, with `protectedPathsSource: "project"`), and as an integration row where a real guard subprocess allows `Edit agents/coder.md` and `Edit rules/x.md` while still denying `Edit fusion-guard.json`. This is the half a union could never express and the half the leaf walk could most easily have swallowed, so it carries its own falsifier rather than riding on the omission cases.

**The ignored `guard.enabled` key produces its diagnostic.** One `guard_advisory` per guarded call, whose `detail` names `guard.enabled` and says `cannot be set by a project`. Asserted through the guard, not off the loader's return value, and asserted for `true` as well as `false` — a project that writes down what it believes to be the status quo has still written a key that does not apply to it, and hearing so is how it learns the file is read at all.

---

## What was built

### `hooks/lib/config.ts`

**The merge is one walk over three layers, per leaf.** The five whole-object `??` lines became four small pickers (`pickGuard`, `pickEscalation`, `pickChurn`, `pickCrossFile`) plus one line for `decisions`, which is a top-level array and therefore already a leaf. `??` and not `||`, because a leaf may legitimately be `false`, `0` or `[]`. The same walk closes the four latent instances in `260804-1633` — `escalation`, `churn`, `crossFile`, `decisions` — with no per-key rule, which is what the answer to `260804-1630` was chosen for.

**`guard.enabled` is removed from the project layer inside the validator**, not skipped at the merge. That placement is a decision the plan left open and it is described under *What the plan did not anticipate* below. The merge line then reads `plugin.raw.guard?.enabled ?? DEFAULTS.guard.enabled` and cannot be handed a project value, because there is none to hand.

**`validateLayer` gives every leaf the loader reads a declared type**, in a table (`CONTAINER_LEAF_RULES`, `TOP_LEVEL_LEAF_RULES`). A leaf whose value fails its check is dropped and named; the walk then finds it absent and inherits. The table is the rule and is meant to be read as one: a leaf added to `GuardSettings` without a row here is unchecked, which is the state every leaf was in before. Both layers run through it.

Three things it deliberately does not do, each because breaking one would break something else this Circle already settled:

- It accepts unknown keys. The seeded template is mostly six underscore-prefixed documentation keys, and rejecting them would make the file fusion itself ships a broken one and the seeding in `7f3d789` a no-op.
- It does not diagnose `null`, which has always meant "nothing configured" here. `null` is absent, not wrong — at the top level, at the container level and at the leaf.
- It does not clamp. A value that cannot be used is dropped, never repaired, so there is one behaviour to explain rather than two.

**`GuardConfig` gained `protectedPathsSource: "project" | "plugin" | "default"`**, the provenance obligation the plan named. `GuardSettings` was split out of `GuardConfig` so "the settings" stays a nameable subset and the byte-identity question stays answerable. It records the layer that declared the list *before* the floor appended to it, which has its own case: read off the effective list, the floor entry — declared by no layer — would give the wrong answer for exactly one path.

### `hooks/lib/paths.ts`

The `matchesAny` docstring's "no per-project config loader exists yet" is gone, with `findRelevantDecisions` now stated as reachable and the open question pointed at `decisions/260804-1632`. The tracker's noise filter is separately restated as still unreachable, because it reads a hardcoded constant and the deleted sentence covered both callers at once. Item 1 of `260804-1432` closes; item 2 is `260804-1632` and stays open.

---

## Verification

`npx vitest run`, never `npm test` — the latter rebuilds `hooks/dist/`, which Step 8 owns. `hooks/dist/` is untouched by this session; `git diff --stat hooks/` names four files and no build output.

**1394 passed, 25 files.** 50 cases added: 33 in `config.test.ts` (27 → 60), 17 in `guard-rules-write-integration.test.ts` (101 → 118).

Every falsifier the plan's Step 2 lists is now a case, and each fails in the stated direction:

| Falsifier | Where it is now checked |
|---|---|
| `{"guard":{"enabled":true}}` still allows `Edit agents/coder.md` | integration, three partial-object rows |
| `{"guard":{"enabled":false}}` stands any surface down, or stands nothing down and says nothing | integration, four rows: write tools, shell, git branch policy, plugin repo, active halt, plus the advisory |
| `{"guard":{"protectedPaths":"rules/**"}}` emits `guard_allow` with no diagnostic | integration, wrong-type row 4 |
| `{"guard":{"protectedPaths":123}}` reaches the fail-open branch | integration, wrong-type row 1 (and the harness throws on `[guard] Error:`) |
| `{"escalation":{"blocksBeforeHalt":0}}` halts on the first block | integration, escalation row: `haltActive` false after one block and after two, true after three |
| `{"guard":{"protectedPaths":[]}}` inherits the plugin's nine patterns | integration + unit, both directions |

**Anti-vacuity, by mutation.** Three mutations, each applied to a working copy, run, and reverted against a checksummed pristine copy (`shasum` before and after, identical). Every mutation broke rows that require a guard *verdict*, not a loader return value:

1. **The leaf walk reverted to the whole-object merge** (`(project.raw.guard ?? plugin.raw.guard)?.[key]`, which is exactly the shipped rule): 3 integration rows fail, at `expect(first.decision).toBe("block")` receiving `undefined`. This is the mutation the plan requires.
2. **The `guard.enabled` exception removed** (the validator's drop disabled and the merge line pointed back at `pickGuard`): 4 integration rows fail — write surfaces, the git branch policy, the plugin-repo variant, and the active halt.
3. **Validation removed** (`readLayer` returns the raw cast): 5 integration rows fail — all four wrong-type rows and the escalation row.

**Nothing was written into the repository that was not restored.** The three mutations touched `hooks/lib/config.ts` only, and the file's checksum after the last revert equals the checksum taken before the first mutation.

---

## What the plan did not anticipate

The predecessor plan was wrong in three ways that only showed up during implementation. This one was wrong in four, none fatal.

**1. The provenance field cannot be an ordinary field of the returned configuration.** The plan frames the choice as "either the returned configuration carries the provenance of that one leaf, or Step 4 re-reads a file the loader already read", and both readings are available. What it does not say is that the predecessor plan's Step 6 left behind an assertion comparing `JSON.stringify` of everything except `diagnostics` against a frozen transcription — so a new top-level field fails that case, and a field nested under `guard` fails it too. Provenance had to be classed with `diagnostics` as a *load report* rather than a setting, which is honest (it describes the load, not the verdict) but is a shape the plan does not describe, and it forced the `GuardSettings` / `GuardConfig` split.

**2. Two rules can claim the same key, and the plan does not say which wins.** A project writing `{"guard":{"enabled":"false"}}` has written both a forbidden key and a wrong type. Two diagnostics would be noise, and the type diagnostic is the actively harmful one of the pair: "must be a boolean" tells a project owner that fixing the type would make the key work, which is the opposite of true. Resolved by giving the `enabled` exception precedence inside the validator — the project layer's `enabled` is dropped whatever its type, with the "cannot be set by a project" reason, exactly once. That is the only reading consistent with `260804-1631`'s "a project that declares it gets **one** diagnostic naming the key", but the plan leaves it to the executor and a different executor could reasonably have emitted both.

**3. "The five `??` lines at `:277-282` become a per-leaf walk over the same three sources" understates the shape of the change.** There were two stages, not one: the whole-object choice at `:277-282` and a per-leaf `?? DEFAULTS` normalisation at `:294-330` that was already a leaf walk against two of the three layers. The change collapses the two stages into one three-layer walk and deletes the first. It is not three lines (issue `260804-1601`'s estimate, carried into the plan), because the leaf key sets differ per container and each container needs its own typed picker.

**4. `blocksBeforeHalt: "3"` changes class, and issue `260804-1603` lists it under "the values that behave".** The shipped code coerced it through the `>=` comparison and halted at three. Validated as a positive integer, it is now a dropped key with a diagnostic — which still ends at three, but only because `hooks/config.json` and `DEFAULTS` agree on that leaf, which is precisely the coincidence `260804-1633` says nothing is keeping true. The behaviour is unchanged today and the reason is now a rule rather than a coercion. Recorded here because a reader of `260804-1603` would not expect that row to move.

One thing the plan got exactly right and it is worth saying: **`hooks/guard.ts` genuinely did not need touching.** The short-circuit at `:652` reads `config.guard.enabled`, and under this answer no project value can reach it. Nothing above it moved.

---

## Cost, stated as a rule with an open example set

**A project's file is read leaf by leaf, and a leaf it does not supply usably is a leaf it did not supply.** What that costs a project, in the direction that is not obvious:

- A project that genuinely wants no protection must now write `"protectedPaths": []` rather than omit the key, and nothing announces that at the moment it matters. This is the cost `260804-1630` names in its own `## Options`, accepted with the answer.
- A project that leaves `"enabled": false` in its file meets one `guard_advisory` on **every guarded tool call** until the line is removed. Pinned by its own case (`STATED COST:`) rather than left to be discovered. The advisory cannot be suppressed — it is what `260804-1631` calls the only thing standing between this answer and a silently inert key — and an advisory that repeats forever trains its reader to dismiss advisories, which is the failure Step 5 is separately about.
- A dropped key is named, so the file the project wrote and the configuration the guard runs can be reconciled from the dashboard. The diagnostic names the key path (`guard.protectedPaths`, `escalation.blocksBeforeHalt`) and the file, and says the key was ignored and inherits as if absent.

The examples above are an open set. The rule is the sentence in bold; five enumerations have been falsified in this Circle and a sixth closed list would be a defect the day it shipped.

---

## What this hands to the later steps

**Step 4 has the fact it needs, and one field is enough.** `260803-1314` was answered **option 2** during this session, by the user and not by this step — "a project's declared entry outranks the flag, an inherited one does not" — so Step 4 exists and the provenance field is load-bearing rather than contingent. It answers exactly the question that answer asks: `protectedPathsSource === "project"` means every entry in `guard.protectedPaths` except the floor entry was declared by the project, and any other value means the project declared none and every entry is inherited. So "the project's own explicitly declared protected entries" is derivable from the returned configuration without a second read of the file, which was the point of settling it here.

**Steps 6 and 7 own two sentences whose exact wording now exists in code.** The user-visible strings are `"guard.enabled" cannot be set by a project — a project does not switch off the guard that governs it, and the git branch policy runs even where the write guard stands down. The key was ignored.` and `"<key>" must be <type>, got <what was found>. The key was ignored and inherits as if it were absent.` The template's `_override` note and `README-hooks.md` should describe the same rule in the same words, or a project owner meets two vocabularies for one behaviour.

**Nothing in `templates/fusion-guard.json`, the root copy, `README-hooks.md`, `rules/protected-path-discipline.md`, `CLAUDE.md`, `bin/monitor` or `hooks/dist/` was touched.** Those are Steps 5, 6, 7 and 8.

---

## Records

**Closed by this step, pending the orchestrator's commit:** `260804-1601`, `260804-1602`, `260804-1603`, `260804-1606`, `260804-1633`, and item 1 of `260804-1432`.

**Decision records left as `_a_`.** `260804-1630` and `260804-1631` are realised in code but their `Implemented:` line cites a commit hash, and this step does not commit. The plan says the reconciler walks them at Phase 3 against the commits rather than against the plan, which is the correct owner.

**Filed:** nothing. No defect was found that this step does not close.

## Files changed

- `hooks/lib/config.ts` — the leaf walk, the `guard.enabled` exception, `validateLayer`, the provenance field, `GuardSettings`
- `hooks/lib/paths.ts` — the `matchesAny` reachability paragraph
- `hooks/lib/__tests__/config.test.ts` — 33 cases; the "replaces the guard object WHOLE" case deleted rather than adapted, because the behaviour it pinned is the defect
- `hooks/lib/__tests__/guard-rules-write-integration.test.ts` — 17 cases; the block title corrected from "what a project configuration can currently reach" to "can and cannot reach", now that half of it is a boundary rather than a measurement
