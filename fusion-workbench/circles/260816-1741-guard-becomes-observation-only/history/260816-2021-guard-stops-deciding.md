# guard.ts stops deciding — plan step 2

**Status:** Complete
**Date:** 2026-08-16
**Agent:** coder
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, step 2

## What was implemented

`hooks/guard.ts` went from 483 lines to 223 and now writes the allow verdict `{}` on every
path. The file matches the plan's second control-flow diagram leaf for leaf: parse, dispatch on
tool name, `loadConfig`, the diagnostic loop under `bestEffort`, a bare allow for Bash, and one
`guard_allow` report through `answer` for a write tool.

Deleted, with the line numbers verified against the file rather than taken from the plan:

| Removed | Was at |
|---|---|
| CHECK 1, the halt deny | `:358-392` |
| CHECK 3, the decision-governed deny and its advisory arm | `:394-452` |
| `emitBlockEvent` | `:156-168` |
| `shouldEscalate` | `:114-118` |
| `block` | `:124-126` |
| the fusion-repository stand-down | `:286-320` |
| `normalizeToRelative` and the `collapseSegments` call CHECK 3 read | `:95-97`, `:322-354` |
| the imports from `lib/escalation.js`, `lib/project-relative.js`, `lib/self-detect.js` | `:58-74` |
| the guard half of the `lib/config.js` import (`findRelevantDecisions`, `sensitivityLevel`, the `Sensitivity` type) | `:61-66` |

Three imports remain and all three are used: `loadConfig`, `emitEvent`, and
`answer`/`bestEffort`/`failOpen`.

Two decisions inside the step that the dispatch did not spell out, both taken from the diagram:

- **The `!config.guard.enabled` early allow went too.** It is not a leaf in the specification
  diagram and not in the dispatch's "what stays" list, and the gate outcome retires
  `guard.enabled` with the rest of the guard settings at step 7a. Removing it here means a write
  tool always writes its trace row. The branch that the loader already refuses to let a project
  set is now refused by there being nothing to set.
- **The write path emits `extractFilePath(...) ?? undefined` rather than a normalised path.**
  The normalisation existed so glob patterns could match the path's text, and nothing matches
  any more. The `if (!rawFilePath) { allow(); return; }` early exit went with it: `emitEvent`
  drops an undefined field, so a write payload carrying no path is traced without its `file`
  field rather than dropped, and the diagram keeps its single write leaf.

The file header was rewritten. It now opens by naming the two products (the write trace and the
configuration diagnostic) and states that the hook decides nothing. The account of what was
removed is kept in the past tense across three bullets — the protected-path half (2026-08-12),
the halt and the decision-governed escalation (this step), and the fusion-repository stand-down
(this step) — plus the paragraph on the two retired Bash text classifiers. No workbench-record
citation was written into the new header; see the baseline note below for why that matters.

## The lint baseline

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE.records` moved 95 → 94, with
the reason written beside the existing approval note. The arithmetic, measured rather than
assumed:

- At HEAD the gate was already red twice. `guard.ts:307` cited
  `260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
  under an exact `_o_` marker, and the record now stands at `_a_`, so the citation was a
  stale-marker violation and contributed nothing to the resolved count. Received was 94 against
  a pin of 95.
- Deleting the stand-down deletes the only class-(c) citation `guard.ts` held. Received stayed
  at 94, the violation went, and the dangling-reference case turned green.

So the re-approval records a citation leaving, and 94 is the number the deletion explains. The
alternative — writing the record back into the new header in wildcard form — would have restored
95 and left the pin untouched; it was not taken, because the dispatch asked for the baseline to
be re-approved and a header citing a record whose subject no longer exists in the file is a
weaker account than a dated sentence.

## Verification

- `cd hooks && npm run build` — exit 0. This is the step's gate. Stated honestly: `tsconfig.json`
  sets `strict` but **not** `noUnusedLocals`, so the build could not have failed on an unused
  import. The absence of one was checked by reading the file and by grepping for every deleted
  identifier; the only hits left are in the header's historical account.
- `cd hooks && npx vitest run lib/__tests__/guard-bash-integration.test.ts lib/__tests__/reference-resolution-lint.test.ts` — exit 1.
  `reference-resolution-lint.test.ts` is green (34 passed). `guard-bash-integration.test.ts` is
  **not**, and the plan requires it to be; five of its cases assert a CHECK 3 deny or the
  stand-down. Filed as
  `260816-2021_*_the-plan-requires-guard-bash-integration-to-stay-green-while-five-of-its-cases-assert-a-deny.md`.
  The two properties the plan's Testing Strategy actually names for that file are green: the
  Bash zero-side-effect case and the write-tool `guard_allow` case both pass.
- `cd hooks && npm test` — 7 test files failing, 31 cases. Baseline before the change was 1 file
  and 2 cases (`reference-resolution-lint.test.ts`, both now green). The list is in the report
  to the orchestrator; six of the seven are step 9's and step 10's, and the seventh is the
  filed defect above.

`monitor-warnings-panel.test.ts` failed once under the parallel `npx vitest run` and passed in
the project runner and in isolation. It spawns servers and binds ports; treated as flaky, not as
a consequence of this step.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/guard.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/dist/guard.js`, `.../dist/guard.d.ts` (build output,
  committed by this repository's convention)
