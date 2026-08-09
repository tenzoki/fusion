# coder — an absent plugin config layer now produces a diagnostic

**Task:** `I:260809-1101-plugin-layer` (tasklist entry 5)
**Source:** `shared/issues/260809-1101_p_an-absent-plugin-config-layer-yields-an-empty-protected-list-with-no-diagnostic.md`
**Status:** Complete

## What changed

`readLayer` in `hooks/lib/config.ts` returned the shared empty layer for any
configuration file that does not exist, for both layers alike. For the plugin
layer that silently dropped the effective `guard.protectedPaths` to
`DEFAULTS.guard.protectedPaths`, which is the empty list, so the guard protected
nothing while reporting normal operation.

The absent branch now asks which layer it is reading:

- an absent **project** `fusion-guard.json` returns `EMPTY_LAYER` unchanged and
  says nothing, which is the ordinary state of a project that has configured
  nothing and must not be nagged;
- an absent **plugin** `config.json` returns one diagnostic naming the path that
  was searched, plus what the absence costs and what to do about it.

`hooks/guard.ts` already emits one `guard_advisory` per entry of
`config.diagnostics`, without asking which layer produced the entry, so the new
diagnostic reaches the user on every guarded call until the install is fixed.
That is the same loudness the module already chose for a plugin file that exists
but does not parse.

Both docstrings that state the contract were rewritten: the module's
`## Diagnostics rather than silence` section now records the asymmetry and points
at `readLayer`, and `readLayer`'s own docstring argues each half rather than
claiming absence is uniformly harmless.

## Tests

`hooks/lib/__tests__/config.test.ts`, in the `diagnostics — a dropped source is
named, never silent` block. The case `says nothing about an absent PLUGIN file
either, as it never has` pinned the behaviour this task changes and was replaced
by three:

- `reports an ABSENT plugin file, and names the path it searched`
- `reports the absent plugin file exactly once, not once per key it lacks`
- `says nothing about an absent plugin file when the project layer is the absent one`

The third exists so that a future change making **both** layers loud fails here
rather than passing. No new case was written for the `guard_advisory` mapping:
the end-to-end path is already pinned in
`guard-rules-write-integration.test.ts` (`reports the ignored key, once, naming
it`), and the emit loop does not discriminate by layer.

`npm run build && npx vitest run` from `hooks/`: 35 files, 1140 tests, all green.

## Not done here, deliberately

- The issue record was left at `_p_` and untouched, per the dispatch.
- `hooks/config.json` untouched, and `.claude/rules/**` not added to the shipped
  protected list — that is task 8, which edits the same test file next.
- Nothing committed; the working tree carries the change.

## Files

- `hooks/lib/config.ts`
- `hooks/lib/__tests__/config.test.ts`
- `fusion-workbench/tasklist.md` (task 5 status)
