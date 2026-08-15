# Coder — the before-measurement, and the green baseline it was taken on

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`
**Plan step:** 1 of `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`
**Dispatched by:** orchestrator

---

## What was asked

Take the before-figure for a Circle whose closure criterion is a before-and-after saving, and
confirm HEAD is green before any removal starts. No shipped file is touched by this step. The
identical measurement block is re-run at step 14, so it is copied into this entry rather than
left in the plan alone.

## The baseline suite run

`cd hooks && npm test` — **exit 0**, 49 test files, 1030 tests, all passing.

- Wall clock, the whole command including the `npm run build` (`tsc`) it runs first: **79 s**.
- Vitest's own reported figure: **Duration 76.57 s** (transform 3.48 s, collect 6.98 s,
  tests 370.16 s, prepare 9.32 s). The 370 s of test time against a 77 s duration is the
  parallelism — it is summed across workers and is not a wall-clock number.

### What `fusion-plane.test.ts` actually costs

The Circle record claims **74.5 s of a 99 s suite**. Measured here, on this machine, at this HEAD:

| | claimed | measured |
|---|---|---|
| `fusion-plane.test.ts` | 74.5 s | **75.587 s** (127 tests) |
| whole suite | 99 s | **76.57 s** vitest duration / 79 s wall clock |

The per-file figure holds — 75.6 s against a claimed 74.5 s is run-to-run noise. **The suite total
does not**: 76.57 s here, not 99 s. The consequence sharpens the record's argument rather than
weakening it. At 99 s the Plane file was 75 % of the suite; at 76.57 s it is **98.7 %** of it, and
it is the critical path almost exactly — the second-slowest file, `fusion-paths.test.ts`, runs
32.9 s in parallel and finishes long before it. Deleting `fusion-plane.test.ts` should drop the
suite to roughly the length of its next-slowest file, not shave three quarters off it.

The other two files this plan deletes are small by comparison and are recorded so step 14 can
attribute what it sees: `churn-key-anchor.test.ts` 17.702 s (16 tests), `circle-stash-git-exclusion.test.ts`
3.423 s (8 tests), `churn.test.ts` 0.044 s (46 tests).

The five slowest files at this HEAD, for the same reason:

| file | tests | ms |
|---|---:|---:|
| `lib/__tests__/fusion-plane.test.ts` | 127 | 75 587 |
| `lib/__tests__/fusion-paths.test.ts` | 88 | 32 898 |
| `lib/__tests__/state-drift.test.ts` | 27 | 27 374 |
| `lib/__tests__/staging-drift.test.ts` | 18 | 24 027 |
| `lib/__tests__/review-coverage.test.ts` | 18 | 23 162 |

## The measurement commands

Run from the repository root. Step 14 re-runs this block **verbatim**; a measurement whose command
was reworded is not comparable to the one below.

```bash
for a in coder orchestrator planner shaper playmaker; do
  printf '%-14s %s\n' "$a" "$(./bin/fusion-rules "$a" | xargs wc -c | tail -1 | awk '{print $1}')"
done
cat agents/*.md       | wc -c;  cat agents/*.md       | wc -l
cat skills/*/SKILL.md | wc -c;  cat skills/*/SKILL.md | wc -l
cat rules/*.md        | wc -c
cat docs/*.md README*.md | wc -c
cat hooks/*.ts hooks/lib/*.ts | wc -l
cat hooks/lib/__tests__/*.ts hooks/lib/__tests__/helpers/*.ts | wc -l
cat bin/* | wc -l
ls hooks/lib/__tests__/*.test.ts | wc -l
# Setup read, in bytes and in tokens at 4 bytes per token
S=$(wc -c < agents/orchestrator.md)
R=$(./bin/fusion-rules orchestrator | xargs wc -c | tail -1 | awk '{print $1}')
Q=$([ -f fusion-workbench/tasklist.md ]   && wc -c < fusion-workbench/tasklist.md   || echo 0)
A=$([ -f fusion-workbench/agentstate.yaml ] && wc -c < fusion-workbench/agentstate.yaml || echo 0)
echo "setup_bytes=$((S+R+Q+A)) setup_tokens=$(((S+R+Q+A)/4))"
```

## Before

Every line of output, verbatim and in order:

```
coder          95023
orchestrator   130440
planner        111134
shaper         123083
playmaker      117410
  460292
    4684
  294134
    3632
  154092
  153101
    7934
   25897
    6135
      49
setup_bytes=467129 setup_tokens=116782
```

### The same figures, labelled

The block's middle ten lines are bare `wc` output and carry no label of their own. What each is,
in the block's own order, so step 14 does not have to re-derive the mapping:

| # | what it measures | before |
|---:|---|---:|
| 1 | rules emitted to `coder`, bytes | 95 023 |
| 2 | rules emitted to `orchestrator`, bytes | 130 440 |
| 3 | rules emitted to `planner`, bytes | 111 134 |
| 4 | rules emitted to `shaper`, bytes | 123 083 |
| 5 | rules emitted to `playmaker`, bytes | 117 410 |
| 6 | `agents/*.md`, bytes | 460 292 |
| 7 | `agents/*.md`, lines | 4 684 |
| 8 | `skills/*/SKILL.md`, bytes | 294 134 |
| 9 | `skills/*/SKILL.md`, lines | 3 632 |
| 10 | `rules/*.md`, bytes | 154 092 |
| 11 | `docs/*.md` + `README*.md`, bytes | 153 101 |
| 12 | `hooks/*.ts` + `hooks/lib/*.ts`, lines | 7 934 |
| 13 | `hooks/lib/__tests__/*.ts` + `helpers/*.ts`, lines | 25 897 |
| 14 | `bin/*`, lines | 6 135 |
| 15 | `hooks/lib/__tests__/*.test.ts`, file count | 49 |
| 16 | orchestrator Setup read, bytes | 467 129 |
| 17 | orchestrator Setup read, tokens at 4 B/token | 116 782 |

Two of these deserve a note before anyone reads a delta off them.

**The Setup read (16/17) double-counts by construction.** `S` is `agents/orchestrator.md` in full,
and `R` is the emitted rule set — but `./bin/fusion-rules orchestrator | xargs wc -c` ends in a
`total` line only when it is handed more than one file, which it is, so `R` = 130 440 is the rule
total and `S+R` is prompt-plus-rules. That is the intended sum. What it does **not** account for is
that the orchestrator prompt itself is not among the emitted rule paths, so nothing is counted
twice there; the number is a floor for one Setup, not for a dispatch fan-out.

**Line 15 is 49 test files, and the plan deletes ten of them.** Four in the steps that motivated
this measurement — `fusion-plane.test.ts` (step 2), `churn.test.ts` and `churn-key-anchor.test.ts`
(step 4), `circle-stash-git-exclusion.test.ts` (step 6) — plus the two state-drift tests (step 11)
and the four queue tests (step 12). So the count trends toward **39**, and any figure above it at
step 14 is a test the plan adds, not a deletion that was missed. Read the delta against the plan's
own list rather than against a single expected number.

## Verification

`cd hooks && npm test` — exit 0. The measurement block ran to completion from the repository root
and every line of its output is recorded above.

## Files written

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0729-coder-before-measurement.md` (this entry)

No shipped file was touched. Nothing under `agents/`, `skills/`, `rules/`, `hooks/`, `bin/`,
`docs/` or `templates/` was read for edit or written.
