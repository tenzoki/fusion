# C3 step 9 — reference-resolution baseline re-approved

**Agent:** coder
**Status:** Complete
**Circle:** circles/260824-0530-record-attribution-and-circle-claim

## Task

Re-approve the `BASELINE` constant in `hooks/lib/__tests__/reference-resolution-lint.test.ts`
after step 9's edit to `skills/setup/SKILL.md` moved the counts the gate resolves. Scope was
widened to this one further file because the gate's own failure message requires the
re-approval to travel in the same commit as the edit that moved the counts.

## What was done

- Read the failing gate's received figures: `paths: 1316, anchors: 186, records: 120`.
- Confirmed the delta is attributable to step 9 alone: `git status --porcelain` over the
  scanned surface (`skills agents rules docs templates bin hooks/lib hooks/*.ts install.sh`
  and the root READMEs / `CLAUDE.md`) reports exactly one modified file,
  `skills/setup/SKILL.md`.
- Accounted for every token by reading the diff against the scanner's own regexes
  (`PLUGIN_PATH_BODY`, `ROOT_VAR_RE`, counting per occurrence with no dedup):
  paths +6, anchors +3, records unmoved.
- Wrote a one-line accounting note above the constant, in the form the step-6/7/8 entries use,
  and moved the constant to the received figures.

## Accounting

| class | old | new | tokens |
|---|---|---|---|
| paths | 1310 | 1316 | `bin/fusion-identity` ×3 (prose mention + two `$FUSION_PLUGIN_ROOT`-rooted spellings on the bash line), `rules/fusion-workbench-conventions.md`, `agents/orchestrator.md`, `rules/circle-records.md` |
| anchors | 183 | 186 | `### Who filed it`, `## Circle head fields`, `### The claim field` |
| records | 120 | 120 | step 9 cites no record |

`fusion-workbench/.checkout-id` and `**Claim:**` register in no class: the first is under no
directory named in `PLUGIN_PATH_BODY`'s alternation, the second is not path-shaped.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts` (+1 line)

`skills/setup/SKILL.md` was not touched again. `hooks/lib/__tests__/fixtures/surface-growth.golden`
was deliberately left stale — the orchestrator regenerates it.

## Verification

`npx vitest run lib/__tests__/reference-resolution-lint.test.ts` from `hooks/` — exit 0,
37 tests passed. The full suite still shows the golden failure, which is expected and not mine.

## Result

done
