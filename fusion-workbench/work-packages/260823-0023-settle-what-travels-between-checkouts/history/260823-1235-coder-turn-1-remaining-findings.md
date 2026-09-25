# Clear the remaining nine findings of the Turn 1 review

**Agent:** coder
**Date:** 2026-08-23
**Circle:** 260823-0023-settle-what-travels-between-checkouts
**Status:** Complete
**Task:** Fix the eight text-correctness findings left after the two blockers, annotate the ninth and leave it open for C4

## What changed

Eight records closed (`_o_` -> `_c_`, `mv`, no `git mv`), one annotated and left `_o_`. Each closure
note carries its own accounting; this file records the pass.

1. **The citation pin's audit trail** — `hooks/lib/__tests__/reference-resolution-lint.test.ts`.
   One retrospective block above the constant covers both unaccounted moves, `git:c9eba48`
   (`paths 1286 -> 1287`, `anchors 176 -> 177`) and `git:1400402` (`paths 1291 -> 1292`,
   `anchors 179 -> 180`), each recovered from its own commit and diff. The `git:e7454e3` entry's
   closing qualification, which named the discrepancy and said it was not repaired, now points at the
   block that repairs it. The chain runs unbroken from `paths 1284` to the constant.
2. **`.gitignore`** — the `fusion-workbench` comment rewritten in the four-class vocabulary; the
   guard-log sentence corrected in the same block.
3. **`rules/workbench-tracking.md`** — the partition fixed, not the claim. `.guard-state/` is class L
   in full, its event log included; the live log and its rolled copies sit under two different layout
   entries, so no entry is split across two classes and the tiling holds without an exception.
4. **`skills/setup/SKILL.md` `## Done`** — the enumeration now ends with Step 0i.
5. **`rules/fusion-workbench-conventions.md:66`** — `:67` -> `:65` and `:60` -> `:58`, plus five
   drifted `README-agents.md` citations (and a sixth, `:103` -> `:97`, unfiled and on the same line).
6. **Step 0h** — `set` and `unset` get their own messages, and `rules/workbench-tracking.md`'s third
   branch enumerates all three values.
7. **The staging-drift example** — `hooks/staging-drift.ts` and `bin/fusion-staging-drift` now print
   a Circle-record row the classifier can produce; `hooks/dist/` rebuilt.
8. **Step 0i** — `head -1` removed, the printed branch split, `MULTIPLE-ACTIVE` reported and not
   offered.
9. **Not repaired**: the second positional event-log reader. Annotated with what was confirmed at
   HEAD and with the warning C4 needs about its own record's proposed direction.

## Two judgements worth naming

**Step 0i under `MULTIPLE-ACTIVE`: report, do not offer.** The alternative was a choice among the
records found. Which of several active Circles to run in this checkout is a portfolio judgement, and
`/fusion:next` owns it; a menu resolves the anomaly as silently as `head -1` did, only with a
keystroke attached. It also fits: a full offer needs the branch, the question and the writing path,
which does not fit in the 372 bytes `skills/` has left.

**The "stopped needing its exclusions" clause lost its historical half rather than regaining a
supporting sentence in the skill.** Restoring it would have spent `skills/` head-room to reinstate
text `57eaf85` had just cut. The clause now claims only what its corrected citation supports.

## Verification

`npm test` from `hooks/` — 41 files, 724 tests, exit 0.

Two goldens regenerated, no baseline moved: `rules-emission.golden` (`fusion-workbench-conventions.md`
57 335 -> 57 302) and `surface-growth.golden` (`setup/SKILL.md` 48 144 -> 49 075,
`reference-resolution-lint.test.ts` 1 076 -> 1 097).

Head-room, all four surfaces, before -> after:

- always-on rules: 3 288 -> 3 321 free of 12 000 (95 285 -> 95 252 bytes)
- `agents/`: 14 787 free of 18 000, untouched (403 056 bytes)
- `skills/`: 1 303 -> 372 free of 20 000 (239 136 -> 240 067 bytes)
- hook-test lines: 219 -> 198 free of 2 500 (20 156 -> 20 177 lines)

`rules/workbench-tracking.md` stands on no bounded surface — `bin/fusion-rules` emits it to no agent
— so items 3 and 6 cost none of the four budgets, contrary to the dispatch's assumption that they
touch always-on rules. Only item 5 does, and it frees 33 bytes.

`reference-resolution-lint` `BASELINE`: `paths 1293 -> 1294`, anchors and records unmoved, accounted
inline. One further repair was needed after the closures: the reviewer's `Also seen:` line in
`260818-1637_*_...` cited a record with a hard `_o_` marker that this pass renamed, so
the workbench citation gate went red on a file nobody had opened. It now carries the `_*_` wildcard
form.

Not committed — the orchestrator commits.
