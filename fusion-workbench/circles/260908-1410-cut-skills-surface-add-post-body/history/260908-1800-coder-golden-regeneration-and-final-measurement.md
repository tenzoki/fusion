# coder — the golden regeneration, the four measurements, and a gate that had been red for three commits

**Status:** Complete
**Date:** 2026-09-08
**Circle:** 260908-1410-cut-skills-surface-add-post-body
**Plan:** `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`, steps 16 and 17
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was implemented

**Step 16, the golden, regenerated once.** `cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts` rewrote `hooks/lib/__tests__/fixtures/surface-growth.golden` and failed on the one assertion that exists to fail, `was not run with the update flag left switched on`; the other 11 tests in the file passed, the four bounds among them. The diff touches the `[skills bytes]` block and nothing else: nine existing rows move, `post/SKILL.md 6137` is added, and the block total goes 259 495 to 256 658. The `[agents bytes]` and `[hook-tests lines]` blocks are byte-identical, which is the check that this Circle changed neither surface. Re-run without the flag: 12 passed.

**No baseline moved, and this was verified rather than asserted.** `git diff 94a262b0 -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts` is empty, so `SKILL_BASELINE`, `AGENT_BASELINE`, `TEST_LINE_BASELINE` and `RULE_BASELINE` all stand where they stood at the Circle's head commit.

**Step 17, the four measurements**, each taken with its own bound's collector rather than with one shared command.

| Surface | Total | Floor | Head-room | Budget | Free |
|---|---|---|---|---|---|
| `skills/*/SKILL.md` | 256 658 | 240 614 | 20 000 | 260 614 | **3 956** |
| `agents/*.md` | 414 334 | 399 843 | 18 000 | 417 843 | 3 509 |
| hook tests, lines | 22 014 | 20 766 | 2 500 | 23 266 | 1 252 |
| always-on rule core | 73 317 | 65 498 | 12 000 | 77 498 | 4 181 |

The rule core is the measured intersection of the emissions of all 15 agents, taken from a neutral working directory the way `rules-emission-golden.test.ts` takes it: `agent-setup.md` 4 181, `critical-stance.md` 10 374, `fusion-workbench-conventions.md` 58 762.

**The reconciliation is exact.** From 259 495: the cut phase's nine rows −8 161, the cleanup stanza −1 050, the new body +6 137, the help topic +221 and its selector line +16 sum to −2 837, and 259 495 − 2 837 = 256 658, the measured total. Nothing was adjusted to make it agree. Against the ledger's prediction the cut phase came in 283 bytes light (−8 161 against −8 444), which is inside the 300-byte tolerance step 7 declares and was reported there.

**`bin/fusion-paths post` exits 0** and emits `WORKBENCH` and `OUT_FORUM=shared/forum`, which is the one verification step 17 names that the suite does not perform.

## What the check found

The first full `npm test` reported `1 failed | 924 passed`: `citation-sweep.test.ts > --dry-run over this repository's workbench reports rewrites=0`, with `files=3 rewrites=7`. Seven record citations spelled a literal state marker where the storeless grammar requires the wildcard — five in the plan's own tail, one in each of the two later history logs. This is **not** one of the three harness files that fail under load.

It was not caused by step 16. `git show b0705cc4` of the plan already carries the five, so the gate had been red since the commit that filed the plan and stayed red through `22d6f839` and `02533218`. The seven tokens were corrected in place; `bin/fusion-citation-sweep --dry-run` then reported `files=0 rewrites=0`.

The blind spot that let three commits ship over a red release gate is filed as `260908-1800_*_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md` in this Circle's issue store. In short: this plan's step 16 correctly defers the golden regeneration to the end, which makes a red suite the expected state of every intermediate commit, and therefore makes a second unrelated cause of red carry no signal.

## Files changed

- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated, `[skills bytes]` block only
- `.../planning/260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md` — five citations corrected, steps 16 and 17 marked done
- `.../history/260908-1733-coder-cleanup-stanza-and-roster.md` — one citation corrected
- `.../history/260908-1750-coder-help-topic-release-process-and-docs.md` — one citation corrected
- `.../issues/260908-1800_*_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md` — new

## Verification

`cd hooks && npm test` — exit 0, 53 files, 925 tests, 0 failed. Run twice after the correction, the second time with the new issue record in the tree so the citation gates read it.
