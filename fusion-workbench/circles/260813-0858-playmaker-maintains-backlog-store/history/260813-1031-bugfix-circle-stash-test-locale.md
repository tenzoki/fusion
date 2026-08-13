# Bugfix: the circle-stash git-exclusion test asserted on a translated git message

**Date:** 2026-08-13 10:31
**Status:** Complete
**Trigger:** Orchestrator test failure

## Error

```
FAIL  lib/__tests__/circle-stash-git-exclusion.test.ts
  > circle-stash Step 7.6 — the workbench never travels in the git stash
  > the unbranched pathspec form is what makes the branch necessary (ignored workbench)

AssertionError: expected 'Die folgenden Pfade werden durch eine…' to match /ignored by one of your \.gitignore files/
```

## Root Cause

`hooks/lib/__tests__/circle-stash-git-exclusion.test.ts:215` matched a literal English
git diagnostic against the output of the `git stash push` spawned at line 202, and that
spawn inherited the developer's environment unchanged. This machine declares
`LANG=de_DE.UTF-8` (measured), and git 2.49.0 is built with gettext, so it emitted the
same refusal in German: `Die folgenden Pfade werden durch eine Ihrer ".gitignore" Dateien
ignoriert`. The test was therefore green on an English-locale machine and red here, on
identical product behaviour.

The defect is in the test, not in the mechanism it measures. Three pieces of evidence:

- The received text is the same refusal for the same reason, and the exit code assertion
  at line 207 (`r.status).not.toBe(0)`) passed.
- The trailing assertion at line 217 about the *shape* of the failure — git creates an
  entry and still leaves the working tree unchanged — passed.
- `skills/circle-stash/SKILL.md` Step 7.6 reads only the push's exit code and the
  stash-stack depth. Its own text says so: "read off the count rather than parsed out of
  stdout, which varies by git version". No product code parses git message text anywhere
  (`grep` over `bin/`, `hooks/lib/*.ts`, `skills/` returns nothing).

## Fix

Forced the C locale on the child environment of the one git invocation whose message text
is asserted, so git emits its English diagnostics regardless of the developer's machine.
The assertion itself is unchanged, and it now means the same thing everywhere.

| File | Change |
|------|--------|
| `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts:212` | `spawnSync` options gain `env: { ...process.env, LC_ALL: "C" }`, with a comment recording the measured German text and why `LC_ALL` is the right variable |

**Why option 1 (force the locale) and not option 2 (assert on locale-independent text).**
The test's stated purpose is to prove that git refuses *for the ignored-path reason*, and
the strongest available evidence for that reason is git's own sentence naming it. Option 2
would have swapped that sentence for a weaker proxy: the `advice.addIgnoredFile` key is an
advice-configuration name that git could stop printing without changing the refusal, and
the workbench path appears in the output of several unrelated git failures. Forcing the
locale keeps the strong assertion and removes the only thing that made it machine-specific.
`LC_ALL` rather than `LANG` or `LC_MESSAGES` because it outranks both under POSIX, so it
holds whatever else the developer's environment declares.

Verified rather than inferred: on this `de_DE.UTF-8` machine, `LC_ALL=C`, `LANG=C` and
`LC_MESSAGES=C` each restored the exact English sentence `The following paths are ignored
by one of your .gitignore files` with exit status 1.

No companion assertion was added. With the locale pinned, a second weaker check on the
same output would be a duplicate that pins nothing the first does not already pin.

## Verification

- [x] Original error resolved — `circle-stash-git-exclusion.test.ts` 8 passed, 0 failed
- [x] Full test suite passes — 1008 passed, 2 failed, 1010 total, 48 files
- [x] No regressions introduced — failures fell from 3 to 2; both survivors are in
      `fusion-plane.test.ts` and belong to a second bugfixer working in parallel

## Scope check across the suite

Swept `hooks/lib/__tests__/` for the same class — any assertion matching literal git, shell
or system output — two ways, and found no second instance.

- **By hand:** every direct git spawn in the tree (17 call sites) was read. All but this
  one either build a fixture (`init`, `config`, `add`, `commit`) or assert on a
  machine-readable value git does not translate: a commit hash, a `rev-list --count`
  number, `rev-parse --is-inside-work-tree`, file content from `git show <sha>:<path>`, and
  the `stash@{N}:` prefix of `git stash list` (confirmed untranslated under `de_DE.UTF-8`).
- **Mechanically:** extracted all 216 prose-shaped `toContain` / `toMatch` literals in the
  test tree and checked each against fusion's own authored sources. Every one that is not
  a fixture or prompt-text lint resolves to a fusion operator string, which is English in
  every project under the exempt-surfaces rule in `rules/fusion-workbench-conventions.md`
  `## Project language`. One near-miss worth naming: `staging-drift.test.ts:439` asserts
  `"not inside a git repository"`, which reads like git's `fatal: not a git repository` and
  is in fact fusion's own sentence at `hooks/lib/staging-drift.ts:470`.

No defect record filed, because the sweep found nothing latent to record.

## Unrelated Issues Found

None.
