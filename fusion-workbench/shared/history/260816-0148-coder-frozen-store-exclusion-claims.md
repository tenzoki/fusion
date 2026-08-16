# coder — the frozen-store exclusion claim and the tracked-workbench scope

**Status:** Complete
**Date:** 2026-08-16
**Files:** `rules/fusion-workbench-conventions.md`, `agents/playmaker.md`, `hooks/lib/__tests__/fixtures/rules-emission.golden`

## Task

Three filed defects about one paragraph and its copies:
`shared/issues/260816-0058` (the conventions count four consumers where three remain),
`shared/issues/260816-0135` (the same falsified claim at `agents/playmaker.md:61`),
`shared/issues/260816-0136` (the tracked-workbench split's declared scope reaches two
legacy stores that neither of its groups classifies).

## What was measured first

At `3a0408a` + working tree:

- `skills/setup/SKILL.md:67` — the bracket-marker `find` carries **no** `-not -path` flag.
  It anchors at `shared/` (any depth) and `circles/` (from depth 2). The three frozen
  stores are outside it by the tree bound, not by exception.
- `skills/log-activity/SKILL.md:82` — excludes `archive/`, `stashes/`, `stilwerk/`,
  `.migration-v2-backup/` by path. Still true.
- `skills/archive/SKILL.md:96` — names `stashes/` (not `.migration-v2-backup/`; that gap
  is `260816-0025`, a separate record).
- `agents/playmaker.md:61` — names `archive/`, `.migration-v2-backup/`, `stashes/`.

So: three consumers exclude `stashes/` by path, and "all but the archive skill exclude
`.migration-v2-backup/` too" still holds over those three.

## What changed

**`rules/fusion-workbench-conventions.md:64`** — the count is three, the citation list
drops `skills/setup/SKILL.md:67` from the exclusion enumeration and re-uses it to cite the
**tree bound** that replaced setup's flags. The wording trap both records name is obeyed
literally: *"`/fusion:setup` **stopped needing** its exclusions rather than losing them"*,
followed by why the bound is the stronger guarantee (a fourth frozen store would need no
fourth entry). The standing instruction survives, still citing `skills/setup/SKILL.md:60`.

**`rules/fusion-workbench-conventions.md:74`** — the split's declared scope now reads
*"every root entry outside the artifact and legacy stores"* with the parenthetical
`(circles/, shared/, archive/, stilwerk/ and the two above, all simply tracked)`. The
deciding question — whether a tracked workbench has an opinion about a frozen store — was
answered by **classifying**, not by silence: a frozen store follows `archive/` and is
simply tracked, which puts it out of the split for the same reason the artifact
directories are out of it. Scope and membership now match against the layout tree *and*
against the sentence, which was the discrepancy `260816-0136` measured.

**`agents/playmaker.md:61`** — the parenthetical now separates the two consumers instead of
claiming both carry the same `find` exclusions.

## Byte budget

The conventions file is one of the five always-on rules, paid by every agent on every
dispatch, so the pass was held to net-removing. Three intermediate drafts were measured and
discarded at +272, +158 and +18 bytes before the landed one.

| File | Before | After | Delta |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md` | 55 113 | 55 104 | **−9** |
| `agents/playmaker.md` | 38 622 | 38 712 | +90 |

The −9 came from cuts made *by* the correction, not from unrelated trimming: the lead's
"and shipped consumers still exclude them" is no longer true of all of them and went; the
provenance clause and the closing cost sentence were compressed where the new sentences
already carried the meaning.

The reference-resolution lint pinned this: dropping `skills/setup/SKILL.md:67` moved
`paths` 1122 → 1121 and failed the gate. Rather than re-approve a BASELINE in a test file
outside the permitted file set, the citation was restored where it is *accurate* — naming
the `find` that carries the tree bound. Count back at 1122, gate green, no test file
touched beyond the mandated golden.

## Verification

`cd hooks && npm test` — exit 1, three failures, none from this pass:

1. `surface-growth-bound.test.ts` — the `agents/` golden. It carries this pass's
   playmaker +90 **and** an `orchestrator.md` +12 from another in-flight task. Left
   deliberately: `surface-growth.golden` is the orchestrator's at Turn end. The **bound**
   assertions all pass (11/12 green); only the golden-match test fails, so `agents/` is
   still inside its 18 000 bytes of head-room.
2. `monitor-warnings-panel.test.ts` — `bin/monitor` is modified in the working tree by
   another task (the `localhost` / `127.0.0.1` dual-stack change); its test expects
   `127.0.0.1` at ~:905. Not this pass's file.
3. `fusion-commit-lock.test.ts` — flaky reap-timing test. Passed on the first full run and
   on a targeted re-run (10/10); failed once on the second full run.

Targeted green: `rules-emission-golden.test.ts` 15/15 after regeneration,
`reference-resolution-lint.test.ts` 34/34, `path-literal-lint.test.ts` 21/21,
`derivable-enumerations-lint.test.ts` 20/20.

`hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated per the file header
(`UPDATE_RULES_GOLDEN=1`, then a clean run). Its diff is exactly the −9 on
`fusion-workbench-conventions.md` propagated to all sixteen agent totals, nothing else.

## Records

- `260816-0058` → `_c_`, Resolved appended.
- `260816-0135` → `_c_`, Resolved appended.
- `260816-0136` → `_p_`, **part 1 only**. Its part 2 (`.gitignore:67` — drop `tasklist.md`,
  add `.fusion-setup`) is outside the permitted file set and is still open.

## Left open

- `.gitignore:67`'s stale comment (`260816-0136` part 2).
- `260816-0025` — the archive skill's never-archive list omits `.migration-v2-backup/`.
  The same measurement applies; its table needs the same correction.
