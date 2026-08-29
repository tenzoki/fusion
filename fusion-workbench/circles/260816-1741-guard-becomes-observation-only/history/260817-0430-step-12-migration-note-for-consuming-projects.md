# Step 12 — the migration note for consuming projects

**Agent:** coder
**Date:** 2026-08-17
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md` step 12
**Status:** Complete

## What was asked

Write the per-release migration note for consuming projects, on the precedent of the v9
note, and point at it from the two places the v9 note is pointed at. Turn the v9 note's
prose forward-reference into a resolvable path now that the file it names exists.

## What landed

**`docs/upgrading-to-v10.md`** (new, 6 871 bytes). Structure and register follow
`docs/upgrading-to-v9.md`: an intro that says what kind of release this is and what the
upgrade itself costs, a `## What left` table of removal against measurement, a
`## What to do in your project` list of numbered checks, `## What needs no action`, and
`## Where to read more`.

Four things the note carries, in the order the dispatch asked for them:

1. **What left**, one row per removal: the decision-governed check, the consecutive-block
   counter and the halt, the clearing script, the fusion-repository stand-down, the three
   modules and the four `hooks/lib/paths.ts` exports that lost their last caller, the
   plugin's own configuration layer, and the project-root configuration file itself. A
   `**What stays**` paragraph after the table names the PreToolUse hook, its registration on
   the four write tools and on Bash, and the `guard_allow` row that keeps the monitor's
   write trace.
2. **The configuration move leads the checks**, because a project that skips it loses a
   Turn budget it chose. The note gives the JSON to copy, says the old file is not read,
   says plainly that a budget left behind falls back to fusion's built-in default *without
   saying so*, and says to copy nothing else because `guard`, `decisions` and `escalation`
   are retired keys the loader names.
3. **The leftover halt flag** is check 2. It states that the flag blocks nothing and no code
   reads it, that `/fusion:setup` offers to delete it, gives the `rm -f` for a project that
   would rather not run Setup, and says in the plan's own words that a project which never
   runs Setup again keeps an inert flag in a file nothing reads, accepted deliberately. No
   route to the deleted clearing script appears anywhere in the note.
4. **`## What needs no action` is release-scoped throughout.** This is the section that went
   stale in the v9 note, so every line is written as a statement about what v10 did to
   something rather than about what is currently true, and the section opens by saying so.

**Pointers.** `README.md` `## Install` gains a v10 paragraph above the v9 one, and the v9
paragraph now says the v10 note applies as well. `skills/help/SKILL.md`'s update topic gains
a "Coming from a v9 install" line above the v8 one, and the v8 line points at both notes.

**`docs/upgrading-to-v9.md`**, one phrase: the words "read fusion's v10 upgrade note as
well" became "read `docs/upgrading-to-v10.md` as well" — a repo-relative backticked path in
the house style of both notes, which is the spelling the citation lint resolves.

## The citation lint

The note names the modules this Circle deleted **without a directory prefix** —
`clear-halt.ts`, `escalation.ts`, `project-relative.ts`, `config.json` — which is the
spelling `README-hooks.md` already uses for `clear-halt.ts`. A bare filename does not match
the class-(a) token shape, so a citation of something removed stays out of the gate rather
than needing an `EXAMPLE_PATHS` entry. Every path in the note that *is* class-(a) shaped
resolves: `hooks/lib/paths.ts`, `README-hooks.md`, `templates/fusion.json`,
`docs/upgrading-to-v9.md`.

The gate's pinned `paths` count moved 1103 -> 1112 and was re-approved in the same change,
with a comment naming all nine additions. Nine is exactly the number of new resolving
citations: four inside the note, two each from `README.md` and `skills/help/SKILL.md`, one
from the v9 note.

## Verification

`cd hooks && npm test` — exit 1, and the exit code is the red set this step inherited rather
than anything this step added.

| | Files | Cases |
|---|---|---|
| Entering the step | 2 | 3 |
| Leaving the step | 2 | 3 |

The three are `reference-resolution-lint` (1 case, four dangling citations, all in
`CLAUDE.md`, step 16's) and `surface-growth-bound` (2 cases, step 10's). The lint's four
dangling citations were compared line by line before and after: same four, same files, same
lines. No fifth was added.

Head-room checked before editing a bounded surface: `skills/` stood 8 796 bytes into its
20 000, so the help-skill addition had room. `docs/` is not a bounded surface.

## Files changed

- `docs/upgrading-to-v10.md` (new)
- `README.md`
- `skills/help/SKILL.md`
- `docs/upgrading-to-v9.md`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` (baseline re-approval)
- `260816-1915_*_the-compliance-guard-becomes-observation-only.md` (step 12 -> `[DONE]`)

Nothing was committed. No version was bumped — step 14 writes `10.0.0`, which is the version
this note names.
