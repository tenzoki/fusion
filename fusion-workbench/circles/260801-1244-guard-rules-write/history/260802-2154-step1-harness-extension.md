# Step 1 — Extend the integration harness

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260802-1856_*_plan-guard-rules-write.md` `### Step 1`

## What was implemented

Two files, exactly the two the step names.

`hooks/lib/__tests__/helpers/guard-harness.ts`:

- `SEED_FILES` gained `rules/retired/.keep` and `.claude/rules/local.md`.
- `makeProject(opts)` now takes an exported `ProjectOptions` (`plugin`, `files`,
  `escalation`). `files` merges over `SEED_FILES`, so a case can add or replace any
  path; `escalation` merges over an empty snapshot and is written to
  `fusion-workbench/.guard-state/escalation.json` before the guard runs.
- `withProject(fn, opts?)` and `withPluginProject(fn, opts?)` forward the options.
  The second parameter is optional and is typed `Omit<ProjectOptions, "plugin">`, so
  no existing call site changes and neither helper can be handed a `plugin` flag that
  contradicts the helper it was passed to.
- New exported `childEnv(overrides)` builds the child environment from a
  `STRIPPED_ENV_VARS` list that now carries `FUSION_ALLOW_RULES_WRITE` alongside the
  two branch variables. `runGuard` calls it instead of building the environment
  inline. The extraction is what makes the strip assertable; the behaviour is
  unchanged for the two variables that were already stripped.
- New `projectConfig(value)` — object stringified, string written verbatim.

`hooks/lib/__tests__/guard-rules-write-integration.test.ts` (new): one `describe`,
four cases, harness capabilities only. No exemption behaviour is asserted, because
`FUSION_ALLOW_RULES_WRITE` is read by nothing at this commit.

## Deviation from the plan, and why

The plan says `runGuard` strips the variable. It does, but through the extracted
`childEnv` rather than inline. Inline, the strip is unobservable from a test: the
guard emits only a verdict, and at this commit no verdict depends on the variable. A
case asserting merely that the variable is absent from `process.env` would pass on
any machine that never exported it, which is the worthless test the step warns
against. `childEnv` is the object `runGuard` hands to `spawnSync`, so asserting on it
asserts on the real thing, and there is still one definition of the strip list.

## Evidence the strip actually strips

The case sets `FUSION_ALLOW_RULES_WRITE=1` in the parent, then spawns the same child
twice: once with `env: process.env` (control, must print `1`) and once with
`env: childEnv()` (must print `undefined`). The control is what makes the negative
assertion non-vacuous.

Falsified by hand: removing `"FUSION_ALLOW_RULES_WRITE"` from `STRIPPED_ENV_VARS`
turns the case red with `expected '1' to be 'undefined'` at
`guard-rules-write-integration.test.ts:169`. Restored, green.

## Verification

- `cd hooks && npm test` — 780 → 784 passed, 17 → 18 files. `npm test` runs `tsc`
  first, so the type check is included.
- `cd hooks && npx vitest run lib/__tests__/guard-bash-integration.test.ts` — 25
  passed, predecessor suite untouched.
- `git status --porcelain` outside `fusion-workbench/`: `hooks/lib/__tests__/helpers/guard-harness.ts`
  modified, `hooks/lib/__tests__/guard-rules-write-integration.test.ts` added. The
  other paths listed there belong to the parallel Step 2 task; the two
  `hooks/dist/lib/rules-write-exemption.*` files are `tsc` output emitted by this
  step's `npm test` run over that task's new module, not hand-edited here.
