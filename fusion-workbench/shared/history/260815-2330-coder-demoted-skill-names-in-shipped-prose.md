# Demoted skill names rewritten to the pipeline form, and one citation repointed

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-15 23:30
**Source record:** `260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`

## Part A — the sweep

`archive`, `curate` and `log-activity` are steps of the `/fusion:cleanup` pipeline, not
commands. Ten instances across six files still wrote them as commands. Each was rewritten
to name the step and, where a user needs a way in, the `--only` selector the selector's
error path actually accepts — `--only archive`, `--only claude-md`, `--only log-activity`.
`--only curate` is not one of them and was not written anywhere.

| File | Instances |
|---|---|
| `agents/orchestrator.md` | 1 — the curator's "ordinary surface", done first because it contradicted `README-agents.md:246` |
| `agents/curator.md` | 4 — frontmatter description, the not-yours list, the not-yours table, and the dispatch line at `:246` that the source record's table did not carry |
| `agents/playmaker.md` | 2 — the frozen-store line's archive target, and the `log-activity` Step 3 cross-reference in the same line |
| `skills/cadence/SKILL.md` | 2 |
| `docs/philosophy.md` | 1 |
| `README.md` | 2 — the surfaces sentence and the "run it first" instruction |

Two rows of the source record's table were already discharged by `e8052e7` (the curator's
approved pass over `rules/fusion-workbench-conventions.md`) and were not touched.

## Part B — the citation repoint

`agents/orchestrator.md:293` cited the defect record
`260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md` as the
tracker for whether the Circle record's `**Status:**` head field should exist at all. That
defect closed earlier in this session (`282ef42` gave the field an owner at both
transitions), and the open question is now its own decision record. The citation points at
`260815-2312_*_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md`,
in wildcard marker form. The surrounding sentence is unchanged: maintenance is the cheap
half, the question is open.

## Growth

`agents/` +209 bytes, `skills/` +54. Both surfaces stay inside their own head-room
(18 000 and 20 000 bytes); the bound assertions pass.

## Residual — two instances outside the permitted file set

The dispatch bounded the edit to six files. Two further instances stand, in files this task
was not permitted to touch and which other tasks were editing concurrently:

- `skills/setup/SKILL.md:60` — "`/fusion:archive` moves it there", and "The precedent for
  the exclusion set is `/fusion:log-activity` Step 3"
- `skills/cleanup/SKILL.md:243` — "only the first is a reason to run `/fusion:curate`"

The source record keeps its `_o_` marker for that reason. `CLAUDE.md:21` and
`README-agents.md:239-246` also carry the three names, deliberately: the first is required
by `derivable-enumerations-lint` to name every skill directory, and both already present
them as pipeline steps.

## Verification

`cd hooks && npm test` in a detached worktree carrying only this patch — exit 1, one
failing test: `surface-growth-bound.test.ts > matches the checked-in golden, surface by
surface`. That golden is a per-file byte inventory that goes stale on any edit to a bounded
surface; it was not regenerated. Every other test passes, including both head-room bounds.
