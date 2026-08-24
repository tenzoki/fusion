# C3 step 10 — `/fusion:next` refuses on the claim, names the holder, and writes the field on activation

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-24
**Plan:** `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_o_c3-attribution-on-records-and-a-claim-on-the-circle.md`, step 10

## What was written

`skills/next/SKILL.md`, three edits, +1 098 bytes (26 218 -> 27 316) against a budget of 1 100.

- **Step 6.1** gains one paragraph after the mismatch halt. Where `$MARKER` is `t`, the refusal is
  read off the record's `**Claim:**` rather than off the marker: the step reads the field and this
  checkout's identity from `bin/fusion-identity` (guarded with `[ -x ]`), and where the value opens
  with `Claimed ` and names another identity it says **who** holds the Circle and **when** the claim
  was written, then offers one override at an `AskUserQuestion`. Taking the override appends the
  `Overridden ` sentence per `agents/orchestrator.md` `## Circle head fields` — the first sentence
  stays, so both identities stand in the record — and writes `.active-circle` (Step 6.3) and nothing
  more, because the record already carries `_t_` and there is nothing to rename. `Unclaimed`, an
  absent field, or this checkout's own identity falls back to the marker mismatch, reported as one.
- **Step 6.2** no longer says the activation rename moves neither head field. It names the one field
  this act does move, `**Claim:**`, and delegates its value to `agents/orchestrator.md`
  `## Circle head fields` exactly as it already delegates the other two, to be written in the same
  command as the rename. The three bullets below it are untouched: `**Active spec/plan:**` and
  `**Active session history:**` are still left exactly as they stand.
- **`## Boundaries`** enumerates the claim write and the takeover's `Overridden ` sentence in the
  skill's write set, and its "no head field is set" clause now names the one head field that is.

`hooks/lib/__tests__/reference-resolution-lint.test.ts`: `BASELINE.paths` 1316 -> 1319 with the
gate's required one-line accounting note. Anchors and records are unmoved.

## Measurements

- `skills/*/SKILL.md`: 236 213 -> 237 311 bytes, ceiling 240 237. **2 926 bytes free.**
- hook-test line surface: 20 333 -> 20 334 lines, budget 20 375. The one line is the accounting note.
- `agents/*.md`: unchanged at 407 098 bytes.
- No growth baseline was moved, in either direction.

## One finding, not changed

The two anchors this step added (`## Circle head fields`, `### The claim field`) register in **no**
class and that is why `anchors` stayed at 186. `scanHeadingAnchors` resolves its file token
literally, and unlike `scanPluginPaths` it does not strip a `ROOT_VARS` prefix, so a
`$FUSION_SRC/`-rooted anchor citation is skipped by the gate. Step 6.2's older citation of
`## Circle head fields` was never counted either, for the same reason. It is a hole in the anchor
gate over every `$VAR/`-rooted citation in the shipped skill bodies, not a defect in this step's
text; it is recorded here rather than filed, because filing an issue is outside this step's file
scope.

## A second finding, and it needs no text

Where the installed `bin/fusion-identity` is absent — the exact case the `[ -x ]` guard exists for,
and the case in this work tree today, where `$FUSION_PLUGIN_ROOT/bin/fusion-identity` exits 127 —
the new branch cannot evaluate "names another identity", and the step falls through to the marker
mismatch above it. That fallback is **already a refusal**: it halts, renames nothing and writes no
pointer. So the degradation is safe by construction and only the message is poorer, which is why no
rule for it was invented here. The plan's step 10 states none, and writing one would be the
improvisation the coder contract forbids.

## Verification

`npm test` from `hooks/` — exit 1. One failing test, `surface-growth-bound.test.ts`, on the stale
`hooks/lib/__tests__/fixtures/surface-growth.golden`, which is the orchestrator's to regenerate and
was explicitly out of scope for this step. Its diff is exactly this step's two surfaces:
`next/SKILL.md 26218 -> 27316` (skills total 236 213 -> 237 311) and the one hook-test line. The
remaining 731 tests pass, including the reference-resolution lint, the path-literal lint, the
workbench citation gate and all three growth bounds.
