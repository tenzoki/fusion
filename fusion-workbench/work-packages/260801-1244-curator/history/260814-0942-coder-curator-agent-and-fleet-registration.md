# Coder session — the curator agent, and the seventeenth registration across the fleet

**Date:** 2026-08-14 09:42
**Agent:** coder
**Status:** Complete
**Circle:** 260801-1244-curator
**Plan:** `260814-0845_*_plan-curator.md`, steps 1 and 2 (one task — the suite is red between them by construction)
**Verification:** `cd hooks && npm test` — exit 0, 49 files, 1023 tests

---

## What landed

**Step 1 — `agents/curator.md`.** One prompt carrying the whole procedure, per the plan's answer to spec question 1: the skill is a thin dispatch-and-gate surface, so a procedure living in the skill body would be missing on the direct-dispatch path C7 requires. Frontmatter is `name` and `description` only, so the curator inherits tools from the parent session and the three invocation shapes differ only in who holds `AskUserQuestion`. Setup steps 1 and 2 are the shared three-command contract, taken verbatim from `agents/reconciler.md`.

Body order follows the plan literally: remit and the eight exclusions of C1; the three evidence tiers, the never-permitted rule and the derive-over-correct preference of C2, with the eight evidence sources enumerated; the six surface pairs and the unresolvable-contradiction procedure of C3; the two-pass structure, ledger schema, gate rendering, blast-radius stop, preserve list and the three wrong-prune mitigations of C6; `## Tool Discipline` in the dual-mode form; the dispatch-parameter block; `## Scope`.

No store path is named as a literal. Write targets are `$OUT_HISTORY`, `$OUT_DECISION` and `$OUT_ISSUE`; reads are `$SCAN_CIRCLES`, `$SCAN_DECISIONS`, `$SCAN_HISTORY`, `$SCAN_REVIEWS`, `$SCAN_ANALYSES`, `$SCAN_ISSUES` and `$WORKBENCH/archive`. `bin/fusion-paths curator` derives exactly that set and exits 0.

**Step 2 — the fleet registration.** `curator` was added to the `PATTERNS=""` arm and the `IS_PROSE_AGENT=1` arm of `bin/fusion-rules`, and to no other arm. Its emission is the five always-on files plus both voice profiles, so its role key is `(core only)`, which `ROLES` already carries, and the universal-core intersection is unchanged.

## The golden fixture diff, read rather than assumed

The regeneration produced exactly three classes of movement, all of them caused by edits in this task:

1. **One new `[curator]` block**, carrying the five core files and nothing else. That is the check the direction constraint exists for: had the curator landed in a pattern arm it should not be in, the block would carry a sixth file and a new role key would have failed the role-coverage assertion.
2. **`fusion-workbench-conventions.md` 51 920 → 52 027**, in every block, from the three edits to that always-on file.
3. **`workbench-stash-and-lock.md` 12 957 → 12 952**, in the orchestrator block alone, from one count removal.

No agent gained or lost a rule file. `RULE_BASELINE` was deliberately not touched: adding the curator changes the emission, and the baseline moves once, at arming, in plan step 5.

## The thirty-two agent-count claims

Handled per `260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md`, answered option 2.

**The five the enumeration lint re-derives were corrected to seventeen:** "specialized agents" in `CLAUDE.md` and `README.md`, "The 17 agent prompts" and "the other 16 inherit" in `CLAUDE.md`, "of the 17 prompts" in `README-agents.md`.

**In the unasserted occurrences the figure was removed** rather than refreshed, wherever the sentence did not need it. "Text all sixteen agents apply" became "text every agent applies", "loading it into all sixteen" became "loading it into every agent", "the nine long-form-prose agents" became "the long-form-prose agents". Twelve of the seventeen occurrences in `hooks/lib/__tests__/rules-emission-golden.test.ts` were rewritten this way.

**Five occurrences in that file were left exactly as they stand**, all inside the dated cut-log entries: lines 247, 299, 308, 316 and 334, in the 2026-08-05 and 2026-08-12 blocks. They are measurements of what past fleets weighed, not claims about today, and the decision's hard exclusion covers them. Line 308 in particular reads like a synonym ("text all sixteen agents apply") but sits inside the 2026-08-05 entry describing the state at that cut, so it stays.

## Four claims the plan's file list did not name, corrected anyway

Each was falsified by this change and each is a Tier 1 claim of exactly the kind the curator exists to catch. Leaving them would have shipped the curator's own commit carrying the defect the curator is for.

- `docs/philosophy.md` — "**16 narrow agents**" plus a by-name roster missing the curator. Figure removed, `curator` added to the list.
- `rules/workbench-stash-and-lock.md` — "The other fifteen agents reach it through the pointer lines" → "Every other agent".
- `bin/fusion-rules` — three header comments: "The nine agents below produce long-form narrative output", "The other thirteen reach the file through the pointer", and the two enumerated lists (conventions-only set, prose set) that now name the curator.
- `rules/rule-file-provenance.md` and `rules/fusion-workbench-conventions.md` `## Rule-file provenance` — both stated that **no** agent's routine work is writing normative rule text, which was the stated reason the file is emitted to no agent. The curator falsifies the premise. Rather than change the emission (the plan forbids a second pattern arm, and it would create a new role key), both sentences now say that the curator is the exception and reaches the definition by citing it at Setup. `agents/curator.md` Setup step 5 makes that true rather than asserted.

## One lint caught a forward reference, correctly

The first full run failed on `derivable-enumerations-lint.test.ts` → "no shipped doc cites a phantom skill": the `## Dispatch parameters` rows I wrote for the curator named `/fusion:curate` as the passer, and that skill is plan step 3. The `Passed by` cells now name the roles that exist today — the user on a direct dispatch, and whoever held the gate on the apply dispatch. Step 3 owns adding the skill and amending those cells.

`agents/curator.md` still names `/fusion:curate` in `## Tool Discipline`, because the plan assigns the three-invocation-shape section to step 1 and that lint does not scan agent prompts. It resolves when step 3 lands.

## What was deliberately not done

- **`RELEASE_CAP`, `DRIFT_CEILING` and `RULE_BASELINE` are untouched.** The budget report now fires for every role, which is correct and expected: arming is step 5.
- **The orchestrator's `tools:` allowlist was not extended.** No plan step names `agents/orchestrator.md`, and the curator joins `consultant` and `investigator` as an agent the orchestrator does not dispatch. Whether it should is a plan-level question, not a coder decision — flagged in the report rather than answered here.
- **`skills/curate/` was not created.** Plan step 3.
- **Nothing was committed.** The orchestrator commits.

## Verification

`cd hooks && npm test` — **exit 0**, 49 test files, 1023 tests. Baseline before the work was 49 files / 1022 tests, so the run carries exactly the one test the curator adds to the parameterised suites.

Two supporting checks, neither an acceptance criterion:

- `claude plugin validate .` — passed with the one pre-existing `CLAUDE.md` warning this repo always carries. Confirms the new frontmatter parses.
- `claude --plugin-dir . --agent fusion:curator -p "reply SMOKE-OK and nothing else"` — replied `SMOKE-OK`. The agent resolves under the install mechanism.

**One flake, recorded because its exit code was read.** An intermediate full run exited 1 with `Error: Worker exited unexpectedly` from tinypool, 1017 of 1023 tests having run and **zero assertions having failed** — a vitest worker crash under load, not a test result. The immediately following run was clean. Recorded rather than dropped, because a run whose exit code is read is a run that gets reported.
