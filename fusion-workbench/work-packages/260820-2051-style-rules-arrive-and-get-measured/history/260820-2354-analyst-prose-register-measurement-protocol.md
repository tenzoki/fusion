# Analyst session: the measurement protocol and the pre-repair window

**Date:** 2026-08-20 23:54
**Agent:** analyst
**Circle:** `260820-2051-style-rules-arrive-and-get-measured`
**Task:** plan step 2, register the protocol and capture the pre-repair window before any repair lands
**HEAD at start:** `fac97f4`
**Status:** Complete

## What was produced

`260820-2354-prose-register-measurement-protocol.md`,
4114 prose words, 0 prose em-dashes.

Nothing else was written. No code, rule, spec, plan or decision record was touched, and no commit was
made.

## What was done

`bin/fusion-prose-metric` was verified before being relied on: against the six always-on files it
reproduces the spec's table in the em-dash column, and constructed cases confirm each of the four
exclusions, the zero row and both error exits. One property was found and recorded, that a standalone
em-dash counts as a word token, which depresses the rates of the worst files and is conservative for
the threshold.

All 554 history files under `shared/history/` and `circles/*/history/` were measured. The pre-repair
window is the five most recent usable files outside this Circle, frozen by path, at 54 em-dashes over
5219 prose words, 10.3 per 1000, lowest per-file rate 5.0. The threshold is a post-repair window total
below 5.0.

The corpus at the boundary was recorded for later dose attribution: 171 em-dashes over 13 018 prose
words for the always-on set, 296 over 21 821 with `CLAUDE.md`, which is 40.3 per cent of the prose a
coder holds.

## What the source records got wrong

Three under-specifications, resolved in the document's section 15 and reported to the user.

1. The exclusion of this Circle's history files was one-sided. Applied only to the post-repair window it
   puts three files at 0.0 per 1000 into the pre-repair window and makes the threshold unmeetable,
   forcing the branch that licenses a gate. The exclusion is now symmetric.
2. Five usable files is a floor and not a window size, and over all 549 pre-boundary files the minimum
   is 0.0. Both windows are fixed at exactly five.
3. The threshold named the comparison value and not the post-repair statistic compared against it. The
   total row the counting command prints was chosen, and the choice is an open question at the decision
   record.

Two stale numbers were corrected against the program: `rules/design-diagrams.md` at 25.9 rather than
25.2, and `chat-voice-de.yaml` at 617 prose words rather than 882.

## Verification

`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` green, 10 tests.
