# No test pins the legacy refusal of /fusion:wp, /fusion:discuss and /fusion:archive

---
Since FJ03d step 7 (`fj03d` `5bffedff`), `/fusion:wp`, `/fusion:discuss` and `/fusion:archive` stop when the workbench is legacy and point at `/fusion:migrate`. The stop is prose after each gate block, and no test checks it. `codec/src/__tests__/install.test.ts` runs each skill's gate block, but only on a `json-control` workbench, where it asserts the state line. The three checkers' refusals are pinned in hooks tests (`legacyLine`, step 8). A later edit could drop the skills' refusal sentence and every suite would stay green.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md (steps 7 and 10)

Evidence: `shippedBlocks("wp", "## Step 0 —")`, `("discuss", "## Step 1 —")` and `("archive", "## Step 1 —")` in `install.test.ts` run on the JSON project only. No hooks test reads the refusal sentence in `skills/wp/SKILL.md` `## Step 0 — Resolve the store`, `skills/discuss/SKILL.md` `## Step 1 — Roots and paths` or `skills/archive/SKILL.md` `## Step 1 — Resolve paths, read the tracking rule`.

Options, none chosen:

1. Add a text check that each of the three gates names `"state":"legacy"` and `/fusion:migrate`. Step 10's consumer audit asks for a test like this.
2. Run each gate block on a legacy copy and assert that the state line is `"state":"legacy"`. This pins the block's output, but not the instruction to stop.
3. Accept the gap: the prose is the enforcement, and step 10 names it as a finding.

Acceptance: a ruling. With option 1 or 2, a test that fails when the refusal sentence or the state line goes away. Executor: `code-implementer`.
