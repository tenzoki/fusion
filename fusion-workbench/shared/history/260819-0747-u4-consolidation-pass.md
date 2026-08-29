# U4 — consolidation pass after three concurrent tasks

**Status:** Complete
**Agent:** coder
**Started:** 260819-0745
**Base commit:** `5ec26b2`

## What this task did

Four items, on a working tree carrying the uncommitted output of tasks U1, U2 and U3.

### 1. The unknown root variable in `skills/archive/SKILL.md`

`skills/archive/SKILL.md:39-40` introduced a root variable named `SRC`. `ROOT_VARS` in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` does not classify that name, so the
gate reported the citation behind it as a violation rather than resolving it — a real gate
failure, and the dangling-reference test was red.

Renamed the variable to `FUSION_SRC`, the name already declared in `ROOT_VARS` and already
used for exactly this value in `skills/setup/SKILL.md`. `SRC` was **not** added to
`ROOT_VARS`: a second name for one thing is the defect, not the fix. Three occurrences on
two lines. The surrounding block reads unchanged — the guarded assignment, its
`$FUSION_PLUGIN_ROOT` fallback and the "if neither root yields the file" sentence below it
all name roots rather than the variable, so none of them needed rewording.

### 2. The second fault in the `.gitignore` comment block

Per `260816-1051_*_the-gitignore-block-still-calls-both-consequences-lifecycle-skill-consequences-and-one-lost-its-consumer.md`.
`.gitignore:65` attributed both consequences of the record-versus-live-state split to the
lifecycle skills, while `rules/workbench-tracking.md:18` says the second lost its skill
consumer when the two stash skills were removed on 2026-08-15 and is kept because it governs
any command that sweeps the tree.

Took the record's second fix direction: name where each consequence applies rather than
dropping the attribution. No ignore pattern moved; comment text only. The block is now twelve
lines rather than eleven.

### 3. Re-approval of the `reference-resolution-lint` baseline

`{ paths: 1152, anchors: 149, records: 102 }` → `{ paths: 1156, anchors: 149, records: 102 }`,
with one re-approval note covering all three tasks, written in the register of the four blocks
already above the constant.

Measured per file by copying each changed file in turn into a detached worktree at `5ec26b2`
and rerunning the gate. Control at HEAD reproduced the committed baseline exactly.

| Task | File | paths / anchors / records |
|---|---|---|
| U1 | `skills/archive/SKILL.md` | +3 / 0 / 0 |
| U1 | `CLAUDE.md` | 0 / 0 / 0 |
| U1 | `README-agents.md` | 0 / 0 / 0 |
| U1 | `.gitignore` | 0 / 0 / 0 (not a `surface()` file) |
| U2 | `agents/planner.md` | 0 / 0 / 0 |
| U2 | `agents/orchestrator.md` | 0 / 0 / 0 |
| U2 | `hooks/lib/staging-drift.ts` | 0 / 0 / 0 |
| U3 | `rules/fusion-workbench-conventions.md` | +1 / 0 / 0 |
| U3 | `rules/workbench-tracking.md` | 0 / 0 / 0 |

The eight figures sum to +4 against a whole-tree +4, exactly and with no interaction, because
no changed file's added text cites another's.

U1's figure is +3, not the +2 measured mid-flight, and the difference is item 1. Verified
directly rather than inferred: the pre-rename file measured 1154 with one dangling-reference
violation at `skills/archive/SKILL.md:40`; the post-rename file measures 1155 with none.

### 4. Both goldens regenerated

`lib/__tests__/fixtures/surface-growth.golden`:

- `agents` — `orchestrator.md` 149722 → 150309, `planner.md` 19369 → 19548, total 413774 →
  414540. U2's prediction held on all three figures exactly.
- `skills` — `archive/SKILL.md` 24104 → 24854, total 229469 → 230219. Of the +750, item 1's
  rename is +21 and U1's own edits are +729.
- `hook-tests` — `reference-resolution-lint.test.ts` 1091 → 1117 lines, total 18444 → 18470.
  That is item 3's re-approval note.

`lib/__tests__/fixtures/rules-emission.golden`: `fusion-workbench-conventions.md` 55276 →
55213 across all fifteen agents, a **shrink** of 63 bytes from U3's edit, so every per-agent
total falls by 63. `rules/workbench-tracking.md` is emitted to no agent and appears nowhere in
this golden.

No baseline moved and no bound was over. All eleven bound assertions passed before either
regeneration, so nothing was regenerated past a red bound.

## Verification

`cd hooks && npx vitest run` — exit 0. 36 test files, 672 tests, all passing. First
settled-tree run of the Turn.

`npm run build` afterwards left `hooks/dist/` byte-identical, so the compiled output already
matched the sources.

## Left standing, named not fixed

A detached measurement worktree from an earlier task in this Turn is still registered at
`/private/tmp/claude-502/-Users-k1-Projects-productive-fusion/dc1791e8-.../scratchpad/wt`
(detached at `3a0408a`). It is another session's, nothing is red because of it, and removing
it was not this task's scope.
