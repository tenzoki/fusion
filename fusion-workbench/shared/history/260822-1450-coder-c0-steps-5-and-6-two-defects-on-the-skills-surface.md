# coder — C0 steps 5 and 6: two defects on the `skills/` surface

**Date:** 2026-08-22
**Status:** Complete
**Agent:** coder
**Dispatch:** orchestrator, steps 5 and 6 of
`260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`,
combined into one pass because both touch `skills/*/SKILL.md` and both were expected to move the
same reference-resolution pin.

## What changed

`skills/setup/SKILL.md`, Step 0e — **+372 bytes**, closing
`260821-0302_*_step-0es-repair-guards-one-of-its-three-blocks-and-its-done-report-omits-the-outcome-that-guard-emits.md`.

- Part 1: the Done-report contract gained the `source-root-unresolved` skip as a reported outcome,
  and the enumeration's head became "**The eight tokens**", naming the skip as the first of them
  and stating that it is reported rather than enumerated.
- Part 2: the replace block and the stamp block gained the classification block's
  `[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }` guard. In the stamp block the `SRC`
  assignment and the new guard were placed ahead of the `PROV` line, so a non-resolving root no
  longer leaves an empty `.asset-provenance` behind. Byte-neutral, and identical on a resolving root.

`skills/help/SKILL.md`, topic 4 — **−68 bytes**, closing
`260822-0946_*_the-v10-5-release-note-reaches-the-readme-and-not-fusion-help-because-the-skills-bound-has-30-bytes.md`.

- The upgrade section is capped at the **last three releases** (option 2 at Gate B, N = 3), with one
  standing "**Older than that:**" line pointing at `$FUSION_SRC/docs/`.
- The v10.5 paragraph the release omitted was written.
- The v10.2, v10 and v9 paragraphs were removed. The one action among them that fails silently when
  skipped — the Turn budget stranded in a retired `fusion-guard.json` — is named in the standing line.

## Measurements

| Surface | Head-room after | Clause | Holds |
|---|---|---|---|
| `agents/*.md` | 16 601 bytes | ≥ 12 000 | yes |
| `skills/*/SKILL.md` | 4 016 bytes | ≥ 3 000 | yes |
| hook test suite | 302 lines | ≥ 300 | yes |

`skills/` net for the pass: **+304 bytes** (236 119 → 236 423).

The hook test surface did **not** move, because the reference-resolution pin did not move and no
attribution block was written. That was checked rather than assumed: four resolved
`$FUSION_SRC/docs/upgrading-to-*.md` citations left with the three capped paragraphs, and four
entered with the v10.5 paragraph and the standing line. The net of zero is coincidental and is not a
property of the cap. No lines were cut from the test suite to pay for anything.

`AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE` and `RULE_BASELINE` are byte-identical to
HEAD `370bfc5`: `git diff` on `hooks/lib/__tests__/surface-growth-bound.test.ts` and
`hooks/lib/__tests__/rules-emission-golden.test.ts` is empty, as it is on
`hooks/lib/__tests__/reference-resolution-lint.test.ts`. The only file changed under `hooks/` is the
machine-written `hooks/lib/__tests__/fixtures/surface-growth.golden`, whose diff is two `skills/`
rows and the total.

## Filed

`260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`
— `CLAUDE.md`'s `docs/` row claims every upgrade note is pointed at from `/fusion:help`'s update
topic, which the cap made false for three of the six. `CLAUDE.md` is the curator's surface and was
outside this step's file scope.

## Verification

`cd hooks && npm test` — exit 0. 41 test files, 724 tests.
