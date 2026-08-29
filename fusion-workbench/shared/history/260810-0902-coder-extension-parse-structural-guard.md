# coder — the extension parse gets a structural guard

**Status:** Complete
**Agent:** coder
**Date:** 260810
**Source:** `260810-0749_*_the-extension-parse-guards-against-matching-nothing-but-not-against-matching-less.md`
**Files changed:** `hooks/lib/__tests__/fusion-count-sources.test.ts` (only)

## What the task asked

Replace the magic floors in `extensions(varName)` (>50 for `CODE_EXT`, >15 for `DATA_EXT`)
with an assertion that every declared assignment line actually parses, so a line that stops
matching fails the test instead of being silently subtracted.

## What was done

`extensions()` now takes the source as a second parameter (defaulting to reading the script),
so the guard itself is testable, and enforces three things:

1. `declared.length === 0` — the variable is gone or renamed. This is the case the floors used
   to catch, expressed structurally.
2. Every line starting `<VAR>=` must match the assignment regex. Since the regex is anchored at
   `^<VAR>="`, any matching line is necessarily in the declared set, so requiring each declared
   line to match *is* `matchedLines === declared` as the record suggested. The error names the
   offending line, which the numeric comparison could not.
3. Every parsed token matches `/^[A-Za-z0-9]+$/`.

Both floors are removed. The loop over the two variables lost its now-dead `other` and `floor`
bindings and became `for (const varName of ["CODE_EXT", "DATA_EXT"] as const)`.

## Deviation from the record, and why

The record cites three example mutations and says each "stops matching". Measured, one of them
does not: a line rewritten to `CODE_EXT="${CODE_EXT}|c|h|…"` **still matches**, because the
continuation prefix `(?:\$CODE_EXT\|)?` is optional — the regex falls through to `(.+)` and
captures the literal `${CODE_EXT}` as an extension.

    matched: true  ["${CODE_EXT}","c","h","cc"]

So the line count is unchanged and the list gets *longer*, not shorter. The record's suggested
fix alone (line count) does not catch this, and neither would the floor. Check 3 above closes
it. This is an addition to the record's direction, not a rejection of it: checks 1 and 2 are
what the record asked for.

The first test run caught this empirically — the demonstration test failed on exactly this
mutation before the token check existed, which is how the gap was found rather than reasoned.

## Demonstration (acceptance criterion)

A permanent test, `fails the parse when a declared assignment line stops matching, instead of
covering less`, exercises the helper against mutated copies of the real source string (the
script on disk is never touched). It asserts each mutation throws:

- trailing comment on the C-family `CODE_EXT` line → `declared but not parsed`. That line
  carries 8 extensions; 60 − 8 = 52, which cleared the old floor of 50, so this is the exact
  silent-subtraction the record describes.
- trailing comment on a `DATA_EXT` line → `declared but not parsed`.
- the `${CODE_EXT}` braced rewrite → `not an extension`.
- an absent variable → `no assignment lines`.

Each mutation is asserted to have actually changed the source, so a fixture that stops matching
the script fails rather than passing vacuously.

## Verification

`cd hooks && npm test` — exit 0. 38 files, 1002 passed (`fusion-count-sources.test.ts`: 18,
was 17).

Observation, not caused by this change: the suite total is not stable across runs — three
consecutive runs gave 1002, 1005, 1002. Diffing per-file counts pins it entirely to
`lib/__tests__/fusion-plane.test.ts`, which collected 96 tests in one run and 93 in another.
`fusion-count-sources.test.ts` was 18 in every run and green in every run. Not investigated
further — out of scope for this task, and worth a separate look.

## Not done, by instruction

No commit, and the issue file's `_o_` marker is unchanged — the user does both after validating.
