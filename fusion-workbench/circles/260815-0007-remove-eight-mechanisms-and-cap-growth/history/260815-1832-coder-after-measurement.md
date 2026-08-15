# Coder — the after-measurement, and the three figures it had to reconcile

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`
**Plan step:** 14 of `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`
**Dispatched by:** orchestrator
**HEAD:** `0609945`, working tree clean

---

## What was asked

Re-run step 1's measurement block byte for byte, record every output line under `## After`
beside the before figures, and produce the three comparisons the Circle's closure criterion
names — bytes per dispatch, Setup tokens, line counts — with a delta column. Where a figure
moved for a reason other than this Circle's removals, say so. No shipped file is touched.

## The suite

`cd hooks && npm test` — **exit 0**, 40 test files, 751 tests, all passing. Run twice.

| | before (step 1, `d78dfb7`) | after, run 1 | after, run 2 |
|---|---:|---:|---:|
| vitest `Duration` | 76.57 s | **59.52 s** | **61.24 s** |
| wall clock, incl. build | 79 s | 63.95 s | 66.17 s |
| test files | 49 | 40 | 40 |
| tests | 1030 | 751 | 751 |

**The comparison is not like for like, and the direction of the error is knowable.** Step 3b
capped a run at half the machine's cores; this machine has 16, so the after runs used 8 workers
where the before run used all of them. On an unloaded machine that costs the suite wall time it
would not otherwise pay. Both after runs were taken on an otherwise idle machine, so the ~60 s
is a clean reading of the capped configuration — but it is **not** the number the same tree
would produce uncapped, and it is not comparable to 76.57 s as a pure measure of what the
deletions saved.

**Step 1's prediction failed, and the cap is why.** Step 1 reasoned that deleting
`fusion-plane.test.ts` (75.587 s of a 76.57 s suite) should drop the suite to roughly the length
of its next-slowest file, `fusion-paths.test.ts` at 32.898 s. It did not: the suite is ~60 s,
because `fusion-paths.test.ts` itself now runs **59.671 s**, up from 32.898 s, while *losing*
seven tests (88 → 81). Nothing was added to that file's work; it simply has half the workers.
The same shows in every surviving heavy file. So the honest saving on suite time is about
**16 s of vitest duration**, and the commit message on `d0ddabb` ("the suite drops to a third of
its length") does not survive this measurement.

The five slowest files at HEAD, for the same attribution service step 1's table performed:

| file | tests | ms | step 1 |
|---|---:|---:|---:|
| `lib/__tests__/fusion-paths.test.ts` | 81 | 59 671 | 32 898 (88 tests) |
| `lib/__tests__/staging-drift.test.ts` | 18 | 42 631 | 24 027 |
| `lib/__tests__/review-coverage.test.ts` | 18 | 41 286 | 23 162 |
| `lib/__tests__/guard-state-shape.test.ts` | 9 | 27 507 | — |
| `lib/__tests__/record-counts-measurement.test.ts` | 30 | 25 996 | — |

## The measurement commands

Step 1's block, re-run verbatim from the repository root. Not one character was changed. The
block is reproduced in step 1's history entry (`260815-0729-coder-before-measurement.md`,
`## The measurement commands`) and is not copied a third time here.

## After

Every line of output, verbatim and in order:

```
coder          95271
orchestrator   123022
planner        110543
shaper         122193
playmaker      117359
  399843
    4150
  220439
    2463
  146677
  129567
    6277
   19453
    3414
      40
setup_bytes=266829 setup_tokens=66707
```

## Before and after, with deltas

The row labels are step 1's, in the block's own order.

| # | what it measures | before | after | delta |
|---:|---|---:|---:|---:|
| 1 | rules emitted to `coder`, bytes | 95 023 | 95 271 | **+248** |
| 2 | rules emitted to `orchestrator`, bytes | 130 440 | 123 022 | −7 418 |
| 3 | rules emitted to `planner`, bytes | 111 134 | 110 543 | −591 |
| 4 | rules emitted to `shaper`, bytes | 123 083 | 122 193 | −890 |
| 5 | rules emitted to `playmaker`, bytes | 117 410 | 117 359 | −51 |
| 6 | `agents/*.md`, bytes | 460 292 | 399 843 | −60 449 |
| 7 | `agents/*.md`, lines | 4 684 | 4 150 | −534 |
| 8 | `skills/*/SKILL.md`, bytes | 294 134 | 220 439 | −73 695 |
| 9 | `skills/*/SKILL.md`, lines | 3 632 | 2 463 | −1 169 |
| 10 | `rules/*.md`, bytes | 154 092 | 146 677 | −7 415 |
| 11 | `docs/*.md` + `README*.md`, bytes | 153 101 | 129 567 | −23 534 |
| 12 | `hooks/*.ts` + `hooks/lib/*.ts`, lines | 7 934 | 6 277 | −1 657 apparent, **−1 337 real** |
| 13 | `hooks/lib/__tests__/*.ts` + `helpers/*.ts`, lines | 25 897 | 19 453 | −6 444 |
| 14 | `bin/*`, lines | 6 135 | 3 414 | −2 721 |
| 15 | `hooks/lib/__tests__/*.test.ts`, file count | 49 | 40 | −10 deleted, +1 added |
| 16 | orchestrator Setup read, bytes | 467 129 | 266 829 | −200 300 |
| 17 | orchestrator Setup read, tokens at 4 B/token | 116 782 | 66 707 | −50 075 |

**The before column is not taken on trust.** Rows 12, 13 and 14 were recomputed from
`d78dfb7` out of git and reproduce step 1's figures exactly (7 934, 25 897, 6 135), and row 2
was reproduced by checking out `d78dfb7` into a scratch worktree and running `./bin/fusion-rules
orchestrator | xargs wc -c` there: 130 440, to the byte. The measurement is comparable.

## The six figures that need a reason

### Row 1: the always-on floor went UP by 248 bytes

This is the sharpest thing the measurement shows, and it should not be buried under the totals.
Six of the fifteen agents — `bugfixer`, `coder`, `coderev`, `ontocoder`, `ontorev` and
`reconciler` — draw only the always-on set, and that set is **larger** after this Circle than
before it. The whole of it, by file:

| file | before | after | delta |
|---|---:|---:|---:|
| `rules/agent-setup.md` | 3 513 | 3 499 | −14 |
| `rules/fusion-workbench-conventions.md` | 53 124 | 53 399 | **+275** |
| `rules/decision-record-examples.md` | 4 291 | 4 291 | 0 |
| `rules/user-facing-output.md` | 16 784 | 16 788 | +4 |
| `rules/critical-stance.md` | 9 958 | 9 941 | −17 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 7 353 | 7 353 | 0 |
| **total** | **95 023** | **95 271** | **+248** |

The eight removals deleted text from `fusion-workbench-conventions.md` and the curator's pass at
`e8052e7` put more back than they took out; `e8052e7`'s own commit subject says as much ("the
pass adds text rather than removing it"). Net, the file grew 275 bytes. **So the Circle's
rule-byte saving is not a saving in the always-on floor.** It is entirely in the conditional
emissions, and it reaches exactly the four agents that draw one.

### Row 2: where the orchestrator's −7 418 actually comes from

| component | before | after | delta |
|---|---:|---:|---:|
| the always-on six (row 1) | 95 023 | 95 271 | +248 |
| `stilwerk/default-voice-en.yaml` | 10 438 | 10 438 | 0 |
| `rules/circle-records.md` | 11 949 | 11 650 | −299 |
| `rules/workbench-stash-and-lock.md` → `rules/commit-lock.md` | 13 030 | 5 663 | **−7 367** |
| **total** | **130 440** | **123 022** | **−7 418** |

**99 percent of the orchestrator's rule saving is one file being rehomed at step 6**, not the
eight removals. The plan's `## Approach` rule 4 refers to "its 9 250 bytes" for the commit-lock
rule; that number matches neither end of the rename — the file it came from was 13 030 bytes and
the file it became is 5 663.

Rule bytes per dispatch for all fifteen agents at HEAD, since the block measures only five:

| bytes | agents |
|---:|---|
| 95 271 | `bugfixer`, `coder`, `coderev`, `ontocoder`, `ontorev`, `reconciler` |
| 100 105 | `taskplanner` |
| 105 709 | `consultant`, `curator`, `editor` |
| 110 543 | `analyst`, `planner` |
| 117 359 | `playmaker` |
| 122 193 | `shaper` |
| 123 022 | `orchestrator` |

### Row 11: `README-hooks.md` grew

| file | before | after | delta |
|---|---:|---:|---:|
| `docs/plane-setup.md` | 24 755 | deleted | −24 755 |
| `docs/working-model.md` | 19 049 | 18 368 | −681 |
| `docs/philosophy.md` | 7 549 | 7 087 | −462 |
| `README-agents.md` | 47 240 | 45 572 | −1 668 |
| `README.md` | 15 978 | 15 852 | −126 |
| `README-hooks.md` | 38 530 | 42 688 | **+4 158** |
| **total** | **153 101** | **129 567** | **−23 534** |

`README-hooks.md` is the one prose surface this Circle enlarged, at step 3b: the build change
brought new modules that the `hooks/lib` table asserts by set equality, so the rows had to be
written. The −23 534 is a real reduction with a 4 158-byte addition inside it.

### Row 12: the hook-source figure overstates the reduction by exactly 320 lines

`cat hooks/*.ts hooks/lib/*.ts | wc -l` cannot see three files step 3b created, because the glob
does not match `.mjs` and the extension is load-bearing — a TypeScript file the build
deliberately skips is the one pair its orphan prune cannot decide. Verified at HEAD `0609945`:

| file | lines |
|---|---:|
| `hooks/scripts/build.mjs` | 205 |
| `hooks/scripts/run-tests.mjs` | 48 |
| `hooks/vitest.config.mjs` | 67 |
| **total** | **320** |

None of the three existed at `d78dfb7`, and no `.mjs` or `vitest.config.*` did — checked against
the tree at that commit, so all 320 lines are new hook code inside the measured range and none of
it is a rename of something the before figure counted.

**The arithmetic, corrected to HEAD.** The plan carries `7 934 → 6 945`, apparent −989, real −669,
verified at `5d29b6d`. Both of those readings reproduce out of git exactly, and the 320 was
already 320 at that commit, so the plan's arithmetic was right where it was taken. **The tree has
moved since.** At HEAD the reading is 6 277, so:

- **apparent −1 657** (7 934 → 6 277)
- **real −1 337** (7 934 → 6 597, counting the 320 invisible lines)

State both. The command reads a shrink 320 lines larger than the one the Circle produced.
Defect: `issues/260815-1251_o_the-after-measurement-command-cannot-see-the-320-lines-the-build-change-added.md`.

The hook-source delta also contains an addition the row does not show: `hooks/lib/state-file.ts`
is new, arriving at step 11 as the survivor of `hooks/lib/state-drift.ts`. The −1 337 is net of it.

### Row 15: ten deleted, one added, and the set matches the plan's list exactly

Do not read −9 as a removal count. Diffed name by name against `d78dfb7`:

**Deleted (10):** `fusion-plane.test.ts` (step 2); `churn.test.ts`, `churn-key-anchor.test.ts`
(step 4); `circle-stash-git-exclusion.test.ts` (step 6); `state-drift.test.ts`,
`state-drift-detection-lint.test.ts` (step 11); `queue-commit-ownership-lint.test.ts`,
`queue-ground-lint.test.ts`, `queue-ground-producer.test.ts`,
`queue-retirement-empty-key.test.ts` (step 10, commit `dd312eb`).

Step 1's before-entry attributed those four queue tests to step 12. They went at **step 10**,
`dd312eb`, the commit that removed the persisted task list — checked per file with
`git log --diff-filter=DA`. The set of ten is unchanged; only the step attribution was off.

**Added (1):** `surface-growth-bound.test.ts` (step 13).

49 − 10 + 1 = 40. Step 1 said the count should trend toward 39 with anything above it being an
addition; it is 40, and the one above is accounted for.

### Rows 16 and 17: the headline Setup saving is four fifths one runtime file

| component | before | after | delta |
|---|---:|---:|---:|
| `agents/orchestrator.md` (`S`) | 171 186 | 139 859 | −31 327 |
| emitted rules (`R`) | 130 440 | 123 022 | −7 418 |
| `fusion-workbench/tasklist.md` (`Q`) | 162 038 | **absent, 0** | −162 038 |
| `fusion-workbench/agentstate.yaml` (`A`) | 3 465 | 3 948 | +483 |
| **total** | **467 129** | **266 829** | **−200 300** |

**81 percent of the −200 300 is `tasklist.md`, and that figure does not transfer to another
project.** It is a runtime artifact whose size is this repository's own accumulated queue at the
moment step 1 ran — 162 038 bytes, 79 entries. Step 10 removed the persisted queue, so the file
is gone and every project's `Q` is now 0; but the *saving* a consuming project sees is whatever
its own queue had grown to, which may be a tenth of this or none at all. The portable part of the
Setup reduction is the other 19 percent: **−38 262 bytes ≈ −9 565 tokens**, from the orchestrator
prompt and the rules. Quote −200 300 / −50 075 tokens only with the split stated, or the closure
note promises a saving no other project will observe.

## The three contested rule-byte figures, settled

Three numbers for "the orchestrator's rule bytes" were in circulation and the plan asked this step
to settle them. They are all correct and they measure three different things.

**The command that settles it, and the one this step used:**

```
./bin/fusion-rules orchestrator | xargs wc -c | tail -1
```

run from the repository root, which is step 1's command unchanged. **123 022** is the answer at
HEAD `0609945`.

| figure | what it was measuring | why it differs |
|---:|---|---|
| **130 440** | the same command at `d78dfb7` | The before figure. Reproduced exactly from a scratch worktree at that commit. Correct as recorded. |
| **123 022** | the same command at `0609945` | The after figure. |
| **121 972** | the same command, mid-session, before `e8052e7` | Same file set, earlier tree. `e8052e7` (the curator's approved pass) added 1 021 bytes of rule text, and the working tree at that moment sat ~29 bytes below its parent commit. *inference*, from the byte arithmetic — I did not observe that working tree. |
| **104 181** | the **plugin rule text only**, at that same mid-session moment | 121 972 − 104 181 = 17 791 = 7 353 + 10 438, exactly the two `stilwerk/` voice profiles. The executor's figure excluded them; the orchestrator's included them. The two never disagreed — they counted different file sets at one moment. The comparable plugin-rule-text-only figure at HEAD is **105 231**. |

**The reviewer's warning was right, and here is its exact size.** `$FUSION_PLUGIN_ROOT/bin/fusion-rules
orchestrator` returns **117 359**, 5 663 low, and the cause is narrower than "the installed copy is
stale in general". Both scripts emit rule paths **out of the work tree** — the work-tree preference
in `bin/fusion-plugin-cwd` fires for the installed script too, because cwd is this repository — so
every emitted file is the current one. What differs is the *emission list* compiled into the script
itself: the installed copy predates step 6 and does not know `rules/commit-lock.md` exists, so it
emits eight paths where the work tree emits nine. The missing file is 5 663 bytes, which is the
entire discrepancy. Note the trap this sets: 117 359 is also `playmaker`'s correct work-tree figure,
so the stale-install reading for `orchestrator` is numerically indistinguishable from a right
answer for a different agent.

**Measure through `./bin/fusion-rules`.** `$FUSION_PLUGIN_ROOT` is pinned to `/Users/k1/.fusion` for
the whole session and cannot see a helper this Circle changed.

## What the Circle record's claims do not survive

1. **"the suite drops to a third of its length"** (`d0ddabb`). It dropped from 76.57 s to ~60 s,
   about 21 percent, and step 3b's worker cap makes even that not like-for-like. The per-file
   claim about `fusion-plane.test.ts` held; the suite-total claim did not, in the same way step 1
   already found the record's 99 s suite total did not.
2. **"bytes per dispatch" as a single headline number.** For six of the fifteen agents it rose
   by 248 bytes. There is a real saving and it is worth stating, but it belongs to four agents,
   and 99 percent of the largest one is a file rename rather than a removal.
3. **The plan's "9 250 bytes" for the commit-lock rule** matches neither 13 030 (before the
   rehome) nor 5 663 (after).
4. **The out-of-scope note's "164,716 bytes, 41 percent of all agent prose"** for
   `agents/orchestrator.md`. Step 1 measured it at 171 186 of 460 292 (37.2 percent); it is now
   139 859 of 399 843 (**35.0 percent**). The prompt lost 31 327 bytes to this Circle and is still
   more than a third of all agent prose, so item 8 — the embedded shell blocks — remains the
   largest single agent surface and the note's argument for deferring it is unchanged.

## Verification

- `cd hooks && npm test` — **exit 0** (run twice; 40 files, 751 tests, 59.52 s and 61.24 s).
- The step 1 measurement block, verbatim, from the repository root — **exit 0**, every output
  line recorded above.
- `./bin/fusion-rules orchestrator | xargs wc -c` and the same through `$FUSION_PLUGIN_ROOT` —
  exit 0 both, outputs reconciled above.
- Before-figure reproduction: `git ls-tree`/`git show` line counts at `d78dfb7` and `5d29b6d`,
  and a scratch `git worktree` at `d78dfb7` for the rule emission. The scratch worktree was
  removed and `git worktree prune` run.

## Files written

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1832-coder-after-measurement.md` (this entry)

No shipped file was touched. Nothing under `agents/`, `skills/`, `rules/`, `hooks/`, `bin/`,
`docs/` or `templates/` was written. Nothing was committed.
