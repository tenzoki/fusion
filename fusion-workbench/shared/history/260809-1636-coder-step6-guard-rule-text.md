# Step 6 — the three specification obligations, and the five closures

**Agent:** coder
**Date:** 2026-08-09
**Status:** Complete
**Plan:** `shared/planning/260809-1229_*_plan-five-severe-guard-defects.md`, Step 6 (the last)
**Commits:** none — this step was left uncommitted for the orchestrator

---

## What was done

Steps 1 to 5 had landed (`509e4c6`, `9716ee5`, `62f5490`, `d8745f0`) and the
code was finished. What was missing was that the two guard rule files described
what the guard now does. Both had been corrected earlier the same day
(`10cbf24`) to speak honestly about the defects that were then still open, so
their starting state was itself stale in four places.

### `rules/protected-path-discipline.md`

- The opening paragraph said a moved fingerprint is written back. It now says a
  moved fingerprint raises the halt and is reported, and that what became of the
  path — written back, or left standing — is part of what the agent is told.
- `## The route to the file does not matter` no longer concedes a measured open
  gap. It states what the measurement compares (what the path *is*: absent, a
  link pointing *there*, or *these* bytes, asked of the path itself and never of
  what it points at), why that needs no catalogue of phrasings, and cites
  `260809-1104` / `260809-1231` as closed. The old overstatement is not
  reinstated: a following paragraph says this is a claim about the question, not
  a promise about the machinery, that every gap this rule ever had to admit was
  found at the fingerprint/filesystem seam, and that finding another is a defect
  to file rather than a route to take.
- New section `## What is written back, and what is only reported` — the
  narrowing from `shared/decisions/260809-1527_*_should-the-revert-narrow-….md`.
  `Bash` keeps the full write-back and nothing there was narrowed; the four
  write tools write back the payload's path and leave a *different* changed
  protected path standing. Both branches raise the same halt and neither is
  silent.
- The two prices became `## What the measurement costs` with a third: the window
  is the whole tool call and is not exclusively the agent's, with the measured
  example from `260809-1107` (a human's editor save written back over, session
  halted, no agent write in the sequence). The preserved copy is named, with its
  location and its retention bound, so an agent hands the user a path instead of
  reconstructing content from memory.
- `## What to do instead` point 2 gained a clause: the narrowing is not a
  re-route, because a write tool's payload path is exactly the path that does
  get written back.

### `rules/git-branch-discipline.md`

- The deny list now says the flags deny whatever follows them, a trailing `--`
  included.
- The allow-list entry that presented `--` as the primary, unambiguous
  discriminator is qualified: it settles the ambiguous form only, and evidence
  that HEAD moves is unconditional (`260809-1105`, closed).
- The measured-passages paragraph in `## Why` lists one open defect
  (`260809-1110`, the case-sensitive command word) instead of three. The two
  that closed are mentioned as closed rather than enumerated as ways through.
- New section `## One deny you will not have expected: the unknown-global-option
  rule` — the cost of the resumed walk, stated as a rule with an **open** example
  set (`git <unrecognised-global-option> <non-subcommand>
  <switch|checkout|worktree> …`, of which `git --no-pager grep switch` is an
  example), explicitly not a count, since
  `260809-1548_*_an-unknown-global-option-carrying-its-own-value-….md` will
  remove some of the current cases. The bound is stated from the other side
  (`git grep switch` untouched), and a deny of this shape is named as
  fail-closed behaviour to report rather than to re-spell.

The third obligation's second half — the "do not rephrase" item that rested on a
guarantee only step 2 made true — had already been rewritten in `10cbf24` and
needed no further edit.

Two exact-marker citations in `hooks/lib/git-branch-guard.ts` (`260809-1105_o_`,
`260809-1106_o_`) were rewritten to the `_*_` wildcard form, because the
reference-resolution lint scans that file and the closures below move both
markers.

## Verification

- The golden fixture was regenerated (`UPDATE_RULES_GOLDEN=1`, which fails by
  design) and re-run clean. Only the two rule files and the per-agent totals
  moved: `git-branch-discipline.md` 7 315 → 8 846, `protected-path-discipline.md`
  7 777 → 10 413, every agent's total +4 167. No role crossed
  `floor + GROWTH_BUDGET`, so the cleanup advisory stayed silent, and the release
  cap and drift ceiling gates passed.
- Full suite, exit code read directly rather than through a pipe: 33 files,
  1 078 tests, 0 failures, exit 0 — before and after the renames. Unchanged
  counts are expected: this step is text.

## Closed

`260809-1104`, `260809-1105`, `260809-1106`, `260809-1107`, `260809-1108`, each
with a `Resolved:` line naming its commit and its pinning tests, marker `_o_` →
`_c_`. `260809-1231` was closed too: it was outside the five, but step 1 carried
it, and its four acceptance criteria are met by the parent-chain refusal and the
test that drives it.

Left open on purpose: `260809-1109`, `260809-1110`, `260809-1111`, `260809-1548`
— none is part of this plan.
