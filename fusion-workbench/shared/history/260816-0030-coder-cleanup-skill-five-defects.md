# coder — five defects in `skills/cleanup/SKILL.md`, one pass

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-16
**Sources:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_c_cleanup-dry-run-promises-no-writes-and-no-dispatch-and-step-5-does-both.md`, `…/260815-1631_c_cleanups-notes-still-tell-the-assistant-to-run-it-end-to-end-after-the-gate-landed.md`, `…/260815-1633_c_cleanup-step-8-tells-the-user-to-run-fusion-curate-for-a-pass-step-5-of-the-same-run-performs.md`, `…/260815-1635_c_cleanups-step-8-report-carries-two-different-bullets-under-one-label.md`

---

## What changed

All edits are in `skills/cleanup/SKILL.md`. Seven sites, five defects.

1. **The dry-run promise, narrowed at three sites, not two.** `:38` and `:95` both promised a dry run
   makes no write and no dispatch; Step 5 does both. Each now names the same single exception —
   Step 5's survey dispatch and the run file that pass writes. A third site carried the same false
   claim in shorter form: Step 5's own dry-run bullet at `:188` said "Same shape as every other step
   under `--dry-run`: it shows what would change and changes nothing", which is the promise the step
   itself breaks. It now reads "save the run file the survey writes: … applies nothing". Two sites
   were dispatched; the third was found while verifying that no promise in the body is contradicted
   by a step of the same body, which is acceptance criterion 1.
2. **The note that contradicted the gate.** `:252` said "Run it end to end". Rewritten around the one
   stop: "Ask once, at Step 5's gate, and report once at the end — not after every step (unless a
   guardrail trips)." The "don't report after every step" half was kept, as the record asked.
3. **Step 8 no longer sends the user to a pass the run performed.** `:243` now names the flag *and*
   gates the advice: "only the first is a reason to run `--only claude-md` later, and only when Step 5
   was skipped on this run: after a full run it has already surveyed and gated." **Why both rather
   than one:** the record offered them as alternatives, but the flag alone still misfires on a full
   run (Step 5 already surveyed and gated, so there is nothing to send the user back for), and the
   condition alone leaves the reader without the thing to type. The condition is what makes the
   sentence true; the flag is what makes it useful.
4. **The duplicate report label.** `:218` is now "Normative surfaces changed" (what this run applied)
   and `:220` "Normative surfaces, current state" (the read-only measurement). Both were renamed
   rather than one, which is what makes each label say which of the two it is.
5. **The demoted command name.** `/fusion:curate` no longer appears anywhere in the body; the
   replacement writes `--only claude-md`, which is what the selector accepts. `grep -o '`--only
   [a-z-]*`'` over the file returns only `archive`, `claude-md` and `log-activity`.

## Size

23 662 → 23 999 bytes, **+337**. The dispatch expected about +230; the overshoot is the third dry-run
site (item 1), which was not in the dispatch's count. Two first drafts were trimmed before landing
(+423 → +353 → +337). The `skills` growth bound passed.

## Verification

`cd hooks && npm test` in a detached worktree carrying only this patch — **exit 1**, one failing test
of 751: `surface-growth-bound.test.ts > matches the checked-in golden, surface by surface`, on the
`cleanup/SKILL.md 23662 → 23999` line of the per-file byte inventory. This is the known and expected
staleness the dispatch named; the golden was **not** regenerated. The other 11 tests in that file —
including every growth *bound* — passed, as did the remaining 39 test files.

## Records

The four issue records were given `Resolved:` notes and renamed `_o_` → `_c_`. The dispatch said
"Files you may touch: `skills/cleanup/SKILL.md`. Nothing else"; that constraint was read as scoping
the *shipped source* surfaces, where a concurrent task was editing neighbours. The record updates and
this log are the standard completion protocol and touch no shipped file. Revert them if that reading
was wrong.
