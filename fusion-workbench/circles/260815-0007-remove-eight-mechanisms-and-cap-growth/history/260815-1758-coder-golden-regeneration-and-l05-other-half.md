# The golden regeneration and L05's other half

**Agent:** coder
**Status:** Complete
**Turn:** post-gate-G1 repair (not a numbered plan step)
**Anchor:** HEAD was `5f2171e` at dispatch; nothing committed by this run.

Two jobs left by the curator's gate-G1 apply pass, plus a third red the same pass introduced that
neither job named. The suite was red at dispatch and is green at `39` files / `739` tests, exit `0`.

## 1. The stale golden fixture

`hooks/lib/__tests__/fixtures/rules-emission.golden` pinned
`fusion-workbench-conventions.md` at `52 378` bytes. The curator's apply pass took it to `53 399`,
`+1 021`.

Regenerated with the documented two-run procedure: `UPDATE_RULES_GOLDEN=1` rewrites the fixture and
fails on purpose, then a clean run passes.

**The diff was checked against the doctrine rather than accepted.** `30` lines changed out of the
fixture's `15` agent blocks: the `15` `fusion-workbench-conventions.md` lines and the `15` totals,
each total moved by exactly `+1 021`. No other file's size moved, no agent block was added or
dropped, and no role's file list changed. That is the whole diff.

`RULE_BASELINE` was **not** re-cut. A curator pass is neither of the two re-baselining events, and
the fixture's own header says a regeneration records growth rather than absolving it. The three
figures the dispatch asked me to confirm rather than take, all measured with `wc -c` over the five
always-on core files:

| | figure | how |
|---|---|---|
| corpus today | `87 918` | `wc -c` over the five core files: `3 499 + 53 399 + 4 291 + 16 788 + 9 941` |
| baseline | `86 573` | `RULE_BASELINE` core entries summed: `3 513 + 52 027 + 4 291 + 16 784 + 9 958` |
| above baseline | `1 345` | `87 918 − 86 573` |
| head-room unspent | `10 655` | `12 000 − 1 345` |
| hard gate | `98 573` | `86 573 + 12 000` |

All three of the curator's figures hold. Worth naming for the next reader: **four** core files stand
off their baseline, not the one this session moved — `agent-setup.md` is `14` bytes *below* it,
`critical-stance.md` `17` below, `user-facing-output.md` `4` above. Those three predate the curator
pass and were already carried in the previous golden; only `fusion-workbench-conventions.md` moved
today. The corpus is `10 655` bytes from the gate, which is not close.

## 2. `README-agents.md:79` — L05's other half

Record `260815-1706_*_readme-agents-closing-paragraph-contradicts-its-own-table-row-about-the-executor-derivation.md`.

The closing paragraph of `## Dispatch parameters` said the orchestrator derives the executor set
*from* the detected domain. Step 9 (`0894d0d`) deleted that derivation, and the paragraph's own
table row twelve lines above already said so. Replaced the false clause with the wording ledger
entry L05 landed at `CLAUDE.md:58`, so the two documents now agree with each other and with the row.

Two judgement calls, both deliberate:

- **The paragraph's last sentence was left standing.** It says whether the planner *should* take a
  domain parameter is an open design question filed as a decision record. That is still true:
  `260813-1820_*_should-the-planner-accept-a-domain-parameter-that-three-documented-surfaces-already-promise.md`
  is open. It is a different question from the one `260815-0029` answered.
- **The record's citation of the table row is off by four.** It cites `README-agents.md:66`; the
  `planner` / `**Executors:**` row is at `:62`. The quoted text is correct and nothing was decided
  on the number, so the record was closed with the correction noted in its `Resolved:` line rather
  than its body being rewritten.

## 3. Not in either job: the curator pass broke the reference lint

`reference-resolution-lint.test.ts` failed on `CLAUDE.md:42`, which now names `bin/fusion-state-drift`
as a helper that was removed on 2026-08-15. The lint reads it as a plugin path that does not resolve.

Confirmed curator-introduced rather than pre-existing: stashing `CLAUDE.md` alone and re-running the
lint passes at `32/32`; restoring it fails.

Fixed at the lint, not at `CLAUDE.md`. The list has the precedent one line up —
`"bin/fu": "removed v3.20.0; CLAUDE.md names it as history, deliberately"` — and this is the same
shape: a deleted binary the layout table names on purpose so the removal stays legible. Editing
`CLAUDE.md` instead would have undone an approved ledger entry, and `CLAUDE.md` is not this agent's
surface. Both `EXAMPLE_PATHS` guard tests still hold for the new entry: nothing at that path exists
in the tree, and `CLAUDE.md:42` cites it, so it is not dead weight.

**The judgement to name:** this was a third job, done because the dispatch requires a green suite and
the alternative was to hand back a red one. If the intent was for the historical mention itself to go
from `CLAUDE.md`, that is a curator edit and this entry should be reverted with it.

## Verification

```
cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts      # red at dispatch: 1 failed | 14 passed
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run …golden.test.ts            # deliberate fail, fixture rewritten
cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts      # 15 passed
cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts  # 32 passed
cd hooks && npm test                                                        # exit 0 — 39 files, 739 tests
```

Nothing was committed. No `git rm` and no `git mv`: the closed record was untracked, so its marker
rename is a plain `mv`.
