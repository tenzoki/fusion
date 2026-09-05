# A fourth repair class takes the decidable half of the splice damage, and the header carries the git remedy for the rest

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7

## What was asked

Repair `260830-2247_*_the-repair-pass-cannot-undo-the-splice-damage-the-unanchored-store-strip-produced.md`
without blurring the cut the analysis
`260905-2158-the-nine-open-defects-after-loop-1-and-what-loop-2-should-do.md` found: a fourth
`--repair` class for the half that is decidable from the token, and a written git remedy for the
half that is not. Measure the population of each half in this repository before and after.

## The boundary implemented

What survives immediately in front of the stamp decides it.

A **letter run** is the broken head of one path segment, cut where the store name began. It is not
a path and cannot become one, and no rooting the layout admits ends in a letter, so the damage is
readable off the token alone. The new class `spliced-prefix` deletes it, leaving the storeless
citation the sweep meant to write. Three further conditions stand in front of the delete, and each
answers a distinct question: the run must itself begin at a non-path boundary (a `/` in front of it
means a complete segment survived, so the composite case falls to the other half); the basename
must name a record or a Circle directory this workbench indexes (a basename that names nothing here
was never a local pointer, so no splice of a local citation produced it); and it must read back
through the grammar whole, which is the sweep's own visibility guard asked of a repair.

A **complete path segment** terminated by its own `/` is intact text whose removed interior the
token does not record. The token does not say which store stood there, nor whether a
`fusion-workbench/` or a `shared/` stood with it, and the index cannot say either, because the
record may have been archived since. That half gets no repair class and no detector, because
telling a spliced foreign path from one somebody wrote on purpose is the same undecidable question
that caused the damage. It gets a four-step git recovery in the program's own header.

I agree with the analysis about where the boundary falls. My own reading sharpened one thing it did
not name: the composite shape, a letter run behind a surviving path segment, belongs to the
undecidable half rather than the decidable one, because stripping the fragment there would edit a
token that is still wrong afterwards and still invisible.

## Population, measured over this repository's own citation corpus

The corpus is the one both hand-run helpers read: 2 532 files, every `*.md` under the workbench
plus `CLAUDE.md`, `rules/*.md`, `docs/**/*.md` and the three declared patterns in `fusion.json`.
Fenced and blockquoted lines excluded, as the repair pass excludes them.

This repository **did** run the damaging sweep: `f1099c5f`, before the left anchor landed at
`cbc1d9fb`.

| half | before | after |
|---|---|---|
| letter run (decidable) | 1 token, 0 of them instances | unchanged |
| foreign path segment (undecidable) | 63 candidates, 31 naming an indexed record, **22 confirmed against `f1099c5f^`** | unchanged |

The single letter-run token is an exhibit of the defect inside
`260830-1841_*_where-may-a-store-prefixed-citation-begin-and-which-rooting-forms-does-the-grammar-name.md`,
and its basename names nothing in the index, so the index condition declines it. The class is
therefore pinned by fixtures rather than by this tree, and `--repair --dry-run` here reports
`spliced-prefix=0`.

The 22 confirmed instances are all one shape: an absolute path a history entry wrote for itself,
`/Users/k1/Projects/productive/fusion/` followed by a basename, where `fusion-workbench/<store>/`
was eaten out of the middle. Confirmation is mechanical rather than by eye: for each candidate the
`f1099c5f^` revision of the same file was read and asked whether a store segment stood in front of
the same basename. The nine that did not confirm are `$SCAN_ISSUES/`-style variable rootings that
were never store-prefixed.

## What changed

`hooks/citation-sweep.ts`

- `SPLICED_RE`, the fourth class's pattern. Its tail carries no `_`, because a basename's slug never
  does and an underscore is where a chained tail begins.
- `repairsOn()` produces `spliced-prefix`, and returns its repairs sorted right to left across both
  producers instead of relying on one producer's walk order.
- The repair loop in `main()` runs to a fixpoint. One token can carry both damages, and the glued
  prefix hides its own chained tail from `CHAINED_RE`'s lookbehind, so a single pass would leave the
  second damage for a second run and `--repair` would stop being idempotent. Every repair strictly
  shortens the line, so the walk terminates; the eight-pass bound is belt to that brace.
- The header documents the fourth class, the two shapes and why exactly one of them repairs, and
  carries the four-step git recovery for the other, including why `git revert` is the wrong tool
  (the same commit made a large number of correct rewrites).
- The summary line gains a trailing `spliced-prefix=<n>` field.

`hooks/lib/__tests__/citation-sweep.test.ts`

- One case pinning both halves: three repairable shapes (a record, a markerless record, a Circle
  directory), one token carrying both damages repaired in a single run, a surviving path segment and
  a `/`-preceded letter run each left byte-identical, a basename that names nothing here declined,
  and both exhibits untouched. Idempotency asserted as the existing case asserts it.
- The existing repair case's two summary lines updated for the new field.

+47 lines on the hook-test surface, against 2 500 of head-room over the baseline.

## Verified

`npm test -- lib/__tests__/citation-sweep.test.ts`, exit 0, 17 passed. That run includes the release
gate, `--dry-run` over this repository's committed workbench reporting `rewrites=0`, and both
`--repair` idempotency assertions.

`reference-resolution-lint.test.ts` and `workbench-citation-lint.test.ts` green, since the header
grew and `hooks/*.ts` is in the declared citation corpus.

`--repair --dry-run` over this repository, run against the committed build and against this one, is
byte-identical apart from the new `spliced-prefix=0` field: the change adds nothing here and takes
nothing away.

## Not done, and whose it is

The record's second acceptance branch asks that the git remedy stand "where somebody about to run
`--write` will read it". It is written in `hooks/citation-sweep.ts`, the authoring home for this
program's behaviour. Two further reader-facing surfaces name guard (a)'s general promise and not
this shape, `bin/fusion-citation-sweep` and `docs/upgrading-to-v10-20.md`, and both are outside this
task's stated scope. A pointer from each is the orchestrator's to dispatch.
