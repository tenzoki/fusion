# Step 6 — the C5b configuration loader

**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write` — plan Step 6, first work on the Directive's second half
**Date:** 260804, 14:05–14:40
**Status:** Complete
**Outcome:** **Built and verified through the harness.** `npm test` green at **1341 passed, 25 files** (baseline 1299, 24 files). A project with no `fusion-guard.json` is byte-identical to before, asserted against a transcribed pre-Step-6 loader rather than eyeballed. Two issues filed, no decision moved.

---

## The three sentences the prompt asked for first

**A project without a configuration file is byte-identical to today.** Measured two ways: a unit case comparing `JSON.stringify` of the effective config against a verbatim transcription of the pre-Step-6 loader run over the same shipped `hooks/config.json`, and a direct probe of the default resolution in this repository. The comparison fails under mutation, so it is a measurement and not a vacuous pass.

**Of the three decisions, Step 6 answers one and makes a second live without answering it.** `260802-1912` (does the floor apply before the file exists) is realised in code exactly as the user answered it. `260803-1314` (may a project protect a path inside its own rule directory against the flag) is **not** answered — but Step 6 turns it from hypothetical into shipped default behaviour, which is a change in its status even though no line of it was decided. `260803-1402` (should the classifier inspect a read operand) is untouched and unaffected.

**Every acceptance criterion was checked through the harness against a throwaway project root, not in this repository.** Nothing in this repository was edited to see what the guard would do, and no `fusion-guard.json` exists at this repository's root. Two cases deliberately run the *same* configuration in both places to show the difference rather than assume it.

---

## What was built

### `hooks/lib/config.ts`

Three seams, in the order they matter.

**Both sources resolve inside `loadConfig`, not at module load.** The old `const CONFIG_PATH = findConfigPath()` at `:34` froze the plugin path at import time; the project side is worse, because it is read from `process.cwd()` and a module-level read would freeze the working directory. `loadConfig(sources?: ConfigSources)` replaces `loadConfig(configPath?: string)`; the old positional parameter is dropped rather than kept, because no caller passed it. This is also what made the module unit-testable at all — it had no test of any kind before today.

**The merge is per top-level key.** A project's `guard` object replaces the plugin's whole; only then does the existing per-leaf `?? DEFAULTS` normalisation run. A union would have been the safe-looking choice and is the wrong one: it can only grow a list, and narrowing is half of what a project-level configuration was asked for.

**The floor appends `fusion-guard.json` to the effective list when the file exists on disk**, whether or not the file lists itself, idempotently, on a fresh array so nothing anyone else holds is mutated in place.

Plus `diagnostics: string[]` on `GuardConfig`, and a memo slot keyed on the resolved source pair rather than on nothing.

### `hooks/guard.ts`

One loop after `loadConfig()`, emitting one `guard_advisory` per diagnostic, above the `enabled` check. The comment states the cost rather than leaving it to be discovered: a project with a broken `fusion-guard.json` gets one advisory per guarded tool call including Bash, which is a deliberate departure from the Bash allow path's zero-side-effect property, bounded by the user fixing the file and pinned on both sides by tests.

### `hooks/tracker.ts`

A comment, and nothing else. `loadConfig()` at the call site needed no change; the point worth writing down is *why* the tracker ignores `diagnostics` — it is PostToolUse, and every call reaching that line was inspected by the PreToolUse guard on the same tool call with the same two sources, so emitting again would report one broken file twice per call.

---

## Verification

### `npm test`

**1341 passed, 25 files, exit 0.** Baseline before this step: 1299 passed, 24 files. The 42 new cases are 24 in the new `lib/__tests__/config.test.ts` and 18 appended to `guard-rules-write-integration.test.ts`.

### The anti-vacuity check, by mutation

Every mutation below was applied to the shipped source, run, and reverted; the source was diffed against a backup afterwards to prove the revert was clean.

| Mutation | Cases that failed |
|---|---|
| floor never appends | 4 unit, 4 integration |
| floor applied unconditionally (ignores existence) | 5 unit — **including both byte-identity cases** |
| merge made leaf-level (`{...plugin, ...project}`) | 1 unit — the whole-object replacement case |
| `protectedPaths` merged as a union | 3 unit |
| project layer ignored entirely | 10 unit, 3 integration |
| `diagnostics` always empty | 5 unit |
| cache keyed on nothing (the old defect, restored) | 2 unit |
| `guard.ts` drops the diagnostic emit | 2 integration |

The row that matters most is the second: it is the one that proves the byte-identity assertion can fail, and it fails on exactly the two cases written to catch it.

### The plan's ten verification cases

Six unit cases and four integration cases were named in Step 6. All ten exist, all pass. The suites carry more than that — 24 unit and 18 integration — because several of the plan's cases split once written (the floor needed a case for *un*parseable-but-present, which the plan does not mention at all; see below).

### What the harness did NOT need

Step 6's dependency on Step 1 turned out to be already fully paid. `makeProject`'s `files` and `escalation` options, the `projectConfig()` helper and the `FUSION_ALLOW_RULES_WRITE` strip were all delivered in `768242c` exactly as the plan specified them. The harness was extended by **nothing**; one local helper (`withConfiguredProject`) wraps `withProject` inside the test file and stays there.

---

## The decisions

### `260802-1912` — the self-protection floor. **Answered by this step's code.**

The record's option 1 is what `hooks/lib/config.ts` implements: `floorApplies = projectConfigPath !== null && existsSync(projectConfigPath)`. Both halves are asserted through the guard:

- the floor is **not** in force before the file exists, so `Write fusion-guard.json` and `cp … fusion-guard.json` are allowed — which is what lets Step 8's seeding work at all;
- once it exists, `Edit`, `rm`, `mv` and `> fusion-guard.json` all deny, with or without `FUSION_ALLOW_RULES_WRITE`, and whether or not the file lists itself or empties its own list.

The record's argument that the absent state is not reachable again through a guarded surface is the one I was most inclined to distrust, so it is the one with the most cases behind it. It holds.

**The marker is not mine to move.** Evidence for whoever moves it: `hooks/lib/config.ts` (the floor, and the module docstring citing the record by path), and `hooks/lib/__tests__/guard-rules-write-integration.test.ts` `describe("the self-protection floor, through the guard")` — six cases.

### `260803-1314` — may a project protect a path inside its own rule directory? **Not answered, and its status changed anyway.**

I did not decide it in code, as instructed. `RULE_DIR_PATTERNS` is untouched and the exemption still never consults the project's list.

The honest thing to say about that is uncomfortable and worth saying plainly: **not deciding ships option 1's behaviour.** Before Step 6 the question was hypothetical because no project could write a `protectedPaths` list at all. Now a project can, and the first project to add `rules/immutable/**` to its own list will find the flag exempts it. That is the record's own first consequence, no longer measured "not yet against Step 6's code, which does not exist at the time of filing" but against code that now exists.

So rather than leave it latent I **measured** it, in a case labelled `MEASURES:` and explicitly marked as not an endorsement, citing the record. The case asserts today's behaviour and will fail the day the decision lands — which is the point: the behaviour then changes deliberately instead of silently.

I did **not** file a new decision. The question already has a record, that record already names Step 6 as the place it would become measurable, and a second record would fragment it. What it has gained is a live example and a test that will break when it is answered.

### `260803-1402` — should the classifier inspect a read operand? **Untouched, unaffected, still genuinely open.**

Out of scope by the prompt and out of reach by construction: Step 6 changes what the protected list contains, not which operands the classifier reads. Nothing in the record is falsified or made moot by this step. It is not affected by the project configuration either — a project narrowing its list changes which paths a planted alias would be worth planting for, and nothing about whether the plant is seen.

---

## Where the plan was wrong or silent

The plan was written before three of this Circle's Turns. Four things, in descending order of how much they would have cost someone following it literally.

**1. The `ConfigSources` sketch contains a trap, and following it literally would have made the whole unit suite lie.** The plan gives `projectRoot?: string | null` with "default: `findWorkbenchRoot(process.cwd())`". Implemented the obvious way — `sources?.projectRoot ?? findWorkbenchRoot()` — an explicit `null` is indistinguishable from an omission and becomes a walk up from the working directory. In *this* repository that walk succeeds and finds the plugin root, so every unit case that passed `projectRoot: null` would have silently acquired a project layer, and the byte-identity case would have been measuring something else entirely. The implementation uses a presence check (`injectedRoot !== undefined`) and carries a comment saying why. This is the same class of trap the harness's `realpathSync` assertion exists to prevent, one layer down.

**2. The plan does not say what the floor does when the project file exists but does not parse.** Both readings are defensible on its text. I chose the file's *existence* as the condition, not its parseability, because the alternative means a project that breaks its own configuration thereby unprotects it — a one-character route to the state the floor exists to prevent. Asserted in `config.test.ts` ("applies even when the file is unparseable, because the file still exists"). If the reviewer disagrees this is a one-line change and a one-case change.

**3. `diagnostics` is described as carrying "one entry".** It carries up to two — one per layer. A file that exists and does not parse is reported whichever layer it is in, stated as one rule rather than two special cases. An *absent* file produces no diagnostic in either layer, which preserves the silence the plugin layer has always kept for a missing `config.json`; diagnosing that would have meant an advisory on every tool call of a broken install, a change this step was not asked to make.

**4. `hooks/tracker.ts` is in the Files list but needs no code change.** `loadConfig()` with no argument keeps working. What it needed was the comment explaining why it ignores diagnostics, which is worth having but is not what the step's wording implies.

Two things the plan got exactly right, worth recording because this Circle's citation record has been poor: every line number Step 6 depends on in `hooks/lib/config.ts` (`:34`, `:108`, `:109-111`) was correct at HEAD, and Q1's claim that `workbench-root.ts` has no local dependency and introduces no cycle is true — 28 lines, `node:fs` and `node:path` only.

---

## Two issues filed

**`260804-1427_o_` — the accepted floor residual reaches the guard's own state directory.** Medium. Decision `260802-1912` bounds its residual as "an agent may create a `fusion-guard.json` that narrows `protectedPaths`". The narrowing also drops `fusion-workbench/.guard-state/**`, where `consecutiveBlocks` and `haltActive` live, so the reach is the escalation machinery and not only the file list. Measured through the real guard in four tool calls and asserted in the suite. The bound that *does* hold is also measured and recorded in the same issue: a halted guard blocks the narrowing write itself, on both surfaces, so an agent cannot narrow its way out of a halt it is already in. Filed rather than fixed because widening the floor from one path to two is a choice about what a project may configure, and the spec authorises exactly one.

**`260804-1432_o_` — `lib/paths.ts` says two case-sensitive matches are unreachable "until the per-project loader lands".** Low. Step 6 is that loader, so the sentence is now false: a project can populate `guard.categoryPaths` and `decisions`, both matched by the case-sensitive `matchesAny` in `findRelevantDecisions`. Two separable things are owed — the sentence, and the decision the docstring itself asked for. `hooks/lib/paths.ts` is outside this step's scope, and the second is a decision rather than a line.

---

## Housekeeping

`hooks/dist/` tracked files were rebuilt by `npm test` and **restored to HEAD** afterwards; `git status --porcelain hooks/dist` shows only the four untracked files that were already present when this session started. Plan Step 10 owns the real rebuild.

No commit made — the orchestrator commits after validation. No decision marker moved. No `fusion-guard.json` created anywhere outside a harness fixture.
