# Turn 2 review fixes — flag grammar and the stash sub-subcommands

**Agent:** coder · **Date:** 2026-08-01 · **Status:** Complete

Closes the two issues from the `e31c0f3..HEAD` review
(`reviews/260801-1958-coderev-turn-2-fixes.md`), both regressions of Turn 2.

## What changed

`hooks/lib/bash-mutation-guard.ts`

1. **`shortFlagLetters` takes a two-class `ShortFlagGrammar` per tool** instead of one flat
   set of "value letters". Greedy letters end the run (their value is the rest of the
   token); optional-value letters consume only their own restricted charset and the run
   continues. A leading digit run is now a value rather than the end of the token, which
   also closes the pre-existing `perl -0pi` gap.
2. **`VerbSpec.subcommands` — a second dispatch hop**, used by `git stash`. Only `push`
   (and the bare `git stash -- <paths>` form it stands for) names pathspecs. An
   unresolvable sub-subcommand is fail-closed; a literal unknown word is not.

`hooks/lib/__tests__/bash-mutation-guard.test.ts` — the discriminating pair as its own
case, the mandatory/optional split in both directions, the leading-digit forms, the
measured stash forms, the run-time-sub-subcommand block, and 13 new corpus entries.

`rules/protected-path-discipline.md`, `README-hooks.md` — the "three git rows mutate only
under a flag" claim was false for `stash` (and had been counting three while naming two);
new section on clustered short flags.

## Method — the thing the previous fix skipped

Every letter classification and every stash form was **run** before it was coded: perl
5.34.1, BSD sed, GNU sed 4.x, git 2.53.0. The regression existed because the earlier fix
was verified against the flags it was written for and not against the family it changed,
so inference was not used anywhere it could be measured instead.

This overturned part of the filed issue: `C`, `D` and `x` are greedy, not optional, so
`perl -Ci` / `-Di` / `-xi` edit nothing and their old denies were false positives. They
are deliberately not restored. `V` was right but for an unstated reason.

A 2,686-command differential grid against the pre-fix build classifies every verdict
change. It surfaced two things the issues did not name: `perl -alib` / `-plib` / `-nlib`
are real in-place rewrites (backup suffix `b`) that allowed in every prior build and now
deny; and the obvious form of the stash fix opens a `git stash $X rules/x.md` bypass,
which is why the unresolvable sub-subcommand is fail-closed.

## Verification

- `npm test` — **753 passed, 16 files** (from 730).
- `npx tsc --noEmit` — clean.
- git suite **99/99**; must-never-deny corpus **119 entries, all allow**;
  `KNOWN_FALSE_POSITIVES` 11/11.
- Load-bearing corpus entries fell 29 → 27 when the stash row stopped reading phantom
  writes, then restored to **32** by adding real ones rather than lowering the floor (27).
- `hooks/dist/` — the two existing `bash-mutation-guard` artefacts rebuilt. **No new dist
  file.**

## Not done, deliberately

Version not bumped, plan file untouched, nothing committed — per the task. `260801-1904`
(Low, three deletable behaviours) is untouched and still open.

## Artifacts

- `issues/260801-1955_c_…` — High, resolved
- `issues/260801-1956_c_…` — Medium, resolved
- `issues/260801-1903_c_…` — correction appended to its false closing note
