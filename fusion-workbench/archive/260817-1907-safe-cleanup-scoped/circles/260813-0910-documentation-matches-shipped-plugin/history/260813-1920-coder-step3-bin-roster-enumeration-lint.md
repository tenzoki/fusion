# Coder — the `bin/` roster joins the derivable-enumerations lint

**Status:** Complete
**Date:** 260813-1920
**Agent:** coder
**Circle:** `260813-0910-documentation-matches-shipped-plugin`
**Plan:** `260813-1820_*_documentation-matches-shipped-plugin.md`, step 3 (now `[DONE]`)
**Files changed:** `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` only, one appended `describe` block plus one derived-ground-truth helper.

## What was added

Section 8 of the file, `enumeration lint: the bin/ helper roster in CLAUDE.md's Layout
table`, following the shape sections 1 (the skill roster) and 5 (the `hooks/lib` table)
already use. Nothing existing was edited; the block is appended and reuses the file's
`pluginRoot` / `read` helpers.

**Ground truth** — `binHelpers()`: `readdirSync("bin", { withFileTypes: true })`, regular
files only, dotfiles dropped, sorted. No extension filter, because the helpers are
extensionless executables (plus the compiled `monitor`); the roster is what the directory
holds.

**Documented claim** — `documentedRows()`: `/^\| `bin\/([A-Za-z0-9._-]+)` \|/gm` over
`CLAUDE.md`. Anchored to the Layout table's row shape, exactly as the file's six existing
parsers are anchored to theirs. Line-anchored, so the many in-prose mentions of
`` `bin/fusion-rules` `` inside other rows are not rows and are not counted. `install.sh`
sits between the `bin/` rows in the table and is not matched, which is correct — it is not
under `bin/`.

**Both directions**, in one `drift()` helper mirroring `claudeMdDrift()`:

- a file under `bin/` with no row → `bin/<name> exists but CLAUDE.md's Layout table has no row for it`;
- a row naming a file that does not exist → `CLAUDE.md's Layout table has a row for bin/<name> but that file does not exist`;
- a third condition beyond the plan's two, cheap here and a real defect if it ever fires: two rows for one helper.

**Non-vacuity** — `expect(rows.length, "no `| `bin/…` |` Layout rows found — CLAUDE.md's
Layout table was reshaped; update the parser").toBeGreaterThan(0)`, plus a floor on the
derived side (`helpers.length > 5`). A reworded table makes the parser find nothing and
this fails loudly; the fix is the parser, never a fuzzy match.

**Mutation check** — `drift([...helpers, "fusion-scratch-helper"], …)` must contain the
missing-row message. `toContain` rather than `toEqual`, with the same reasoning the skill
roster's fixture states in place: with a real drift present the corpus test already fails
and the fixture should not fail a second time over it.

## The count check that was deliberately not added

The block's comment says so, at length, because the survey proposed a workbench
tracked-file gate and the next reader will otherwise add one. Step 2 **deleted** the count
from `CLAUDE.md:51` rather than correcting it, so there is no documented value left to diff
against; a gate would have to invent one. The comment states both halves — do not add the
check here, and do not restore the count in `CLAUDE.md` so that one becomes possible.

## Verification

- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 21 tests passed (18 before, +3).
- `cd hooks && npx vitest run` — exit 0, 49 files, 1022 tests passed (1019 before, +3).

**The first run is green because step 2 landed first**, which is the whole of this step's
dependency. Non-vacuity was confirmed beyond the `> 0` floor rather than assumed: an
independent `node -e` read of both sides returns 15 rows against 15 files, sorted-equal.
Had the parser silently matched fewer, the corpus assertion would still have passed and the
check would have been worth nothing.

## Not done here, deliberately

- No edit to `CLAUDE.md`. The file in scope was the test only; the table was completed in step 2.
- No commit. The orchestrator commits.
