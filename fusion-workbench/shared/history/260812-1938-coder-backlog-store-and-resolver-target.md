# Coder session — backlog store, resolver target argument, and the one permitted second resolution

**Date:** 2026-08-12 19:38
**Agent:** coder
**Status:** Complete
**Plan:** `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`, steps 1, 2 and 3
**Decisions realised (not yet marked):** `shared/decisions/260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`,
`shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md`,
`shared/decisions/260812-1720_*_when-exactly-does-the-anticipated-circle-come-into-existence.md`

## What was done

**Step 1 — the backlog store is defined.** `rules/fusion-workbench-conventions.md` gains
`shared/backlog/` in the layout tree, a fourth member of the unconditionally-shared group
(the group sentence now reads "plus four of its own" and gives the reason: a backlog entry
precedes every Directive by construction, so it cannot originate in a Circle), a
`Backlog entry` row in `## Filename Patterns` writing to `$OUT_BACKLOG` with pattern
`YYMMDD-HHMM_S_<topic>.md`, and a new `## Backlog entries` section.

The section sits immediately after `## Issues vs Decisions — when to use which`, which is
where an agent asks "what kind of thing is this?" — the one place the bound *no agent files
a backlog entry* has to be legible. It states the four markers as read for this kind, fixes
the minimum content at a title and a paragraph with the 12 KB hand-written text file as the
recorded evidence for why, and carries the two bounds the plan required: no agent files
entries, and the backlog is not the work queue (option 4 explicitly left open, answered in
neither direction).

**Step 2 — `bin/fusion-paths <name> [<circle-dir>]`.** An optional second argument names an
existing Circle directory, which becomes the **Circle in scope**: it replaces the active
Circle as the `OUT_*` base (`SCOPE`, new, replacing `CIRCLE` at the two use sites) and as
the Circle half of `scan_value`. Three refusals are deliberate and each is tested:
`.active-circle` is not consulted for the substitution and not written, though it is still
read and validated so an orphaned pointer exits 3 with or without a target; the emitted
`CIRCLE` key still names the *active* Circle and is still absent when none is active,
because a target Circle is in scope and not active; and a target naming no existing
directory exits **1**, with the same exit covering a path separator or dot segment (the
value is interpolated into a path, so the shape check is a safety guard).

Exit 1 rather than 3 or 4 is the plan's own reasoning and the exit-code table's: the
argument came from the caller, 3 would send the user to fix an intact pointer, and 4 would
claim a fusion bug when the caller may be a person mistyping `/fusion:direct`.

Ten tests added to `hooks/lib/__tests__/fusion-paths.test.ts` (68 → 78), covering: target
with no Circle active; target with a *different* Circle active, asserting every `SCAN_*`
carries exactly two stores and names neither the active Circle nor a third; `CIRCLE`
absent for a target; the shared-only kinds unmoved; missing target exits 1; escape attempts
exit 1; orphaned pointer still exits 3 under a target; a third argument exits 1; and
passing the *active* Circle as the target produces byte-identical output for four
consumers. That last one is the strongest available form of "the argument is additive" —
"byte-identical to today" cannot be asserted against a build that no longer exists, and the
remaining 68 tests are themselves the no-target regression, since none of them passes a
second argument.

**Step 3 — the documentation.** In `rules/fusion-workbench-conventions.md` `## Path
Resolution`: the signature line, a paragraph defining the Circle in scope and what does
*not* move with it, the exit-1 case in the table row plus one clause on whose fault it is,
both invariants restated in terms of the Circle in scope (invariant 1 would otherwise be
false under a target), and the one permitted second resolution under *Where the call
belongs* — a consumer that **creates** a Circle re-resolves immediately after creating it,
with the reason written beside the rule: the exception is conditional on a fact rather than
on judgement, and without the reason the next audit reads a consumer's two calls as drift
and removes one.

`rules/workbench-path-resolution.md` (emitted to no agent, so free of context cost) takes
the authoring half: a new `## The second argument: the Circle in scope` section carrying
the three refusals in full, the `CIRCLE` row note, and the key table's `A → B` legend
restated. Its stale `bin/fusion-paths:245-248` citation was corrected to `264-267`, which
the edits moved.

## The context cost, measured

`rules/fusion-workbench-conventions.md` is emitted to all sixteen agents on every dispatch,
so every byte added to it is paid sixteen times a session. Measured through the emission
golden:

| | bytes |
|---|---|
| before | 46 124 |
| after | 49 990 |
| **delta** | **+3 866** |

Step 1 accounts for 2 165 of it and step 3 for 1 701. `rules/workbench-path-resolution.md`
grew too and costs nothing, being emitted to no agent — the split of step 3's material
between the two files was made along that line deliberately, with the operative facts in
the always-on file and the reasoning in the authoring one.

For scale: `fa2f00b` earlier the same day removed 10 420 bytes from this corpus, and that
removal was the point of the day's work. This addition gives back 37 per cent of it. The
tightest honest text was written and then trimmed once more (−265 bytes, by folding the
bad-target reasoning into the existing exit-code paragraph and dropping two explanatory
sentences that the authoring file already carries in full). What remains that could still
have been a citation is roughly 300 bytes: the four-marker reading in `## Backlog entries`
restates two markers (`_o_`, `_d_`) that the general vocabulary two sections below already
covers identically. It was kept because the plan asked for the four markers as read for
this kind, and because `_p_` and `_c_` genuinely differ for a backlog entry.

## Verification

`cd hooks && npm test` — exit 0, 48 files, 995 tests.

The emission golden was regenerated with
`UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts` (which
rewrites the fixture and fails on purpose) and the diff reviewed: one line per agent,
`fusion-workbench-conventions.md 46124 → 49990` and each total by the same +3 866. No other
file moved. `RULE_BASELINE` was left alone, per the fixture header — it is re-cut after a
cleanup, not after a change.

Three full runs were made. Runs 1 and 3 were green at exit 0; run 2 exited 1 on
`Error: Worker exited unexpectedly` from tinypool with **no failing assertion** (993 of 995
tests passed, two never ran, 47 of 48 files reported). That is the known pre-existing
parallel-load flake recorded in
`shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`
and `shared/issues/260811-1409_*_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md`,
not a regression from this work.

## What the plan got wrong

One thing, and it is small. Step 2's change list says "Update the arg-count guard, which
currently rejects more than one argument", and step 3 says to extend the signature and the
exit-code table — but neither step mentions **invariant 1**, which reads "With no active
Circle, every `OUT_*` points into `shared/`". Under a target with no Circle active that
sentence is simply false, so it was restated in terms of the Circle in scope alongside
invariant 2, which step 3 does name. Fixing only the one the plan named would have shipped
a rule contradicting the resolver.

Two smaller notes, both handled rather than defects in the plan. The plan does not say
whether the emitted `CIRCLE` key follows the target; "nothing else changes" was read
literally, so it does not, and the reason is now written down in both rule files —
following the target would make an anticipated Circle look active, which is the same
collapse of `_a_` into `_t_` that writing `.active-circle` at anticipation would have
caused. And the header comment's symmetry claim about `bin/fusion-rules` ("one argument")
became inaccurate and now reads "a required name argument", in the script and in the
conventions both.

## Files changed

- `rules/fusion-workbench-conventions.md`
- `rules/workbench-path-resolution.md`
- `bin/fusion-paths`
- `hooks/lib/__tests__/fusion-paths.test.ts`
- `hooks/lib/__tests__/fixtures/rules-emission.golden`
- `fusion-workbench/shared/planning/260812-1720_o_circle-first-placement-and-the-backlog-store.md` (steps 1–3 marked `[DONE]`)

Not committed — the orchestrator commits. Step 4 not started.
