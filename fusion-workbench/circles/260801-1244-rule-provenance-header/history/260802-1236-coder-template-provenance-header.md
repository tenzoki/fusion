# Coder session — provenance header for the investigator capture-layout template

**Date:** 2026-08-02 12:36
**Agent:** coder
**Status:** Complete
**Circle:** `260801-1244-rule-provenance-header`
**Plan:** not a plan step. Added by the user at the plan gate on 2026-08-02, after asking
whether consuming projects need a migration for the new convention. The prompt was the
specification.
**HEAD at start:** `de9d5aa` (Step 3, the lint gate)

## Why this exists

The migration question answered itself as no: `bin/fusion-rules` never opens a rule file's
content, and the lint gate reads the plugin's own `rules/` directory only, so a consuming
project's existing headerless rule files keep working unchanged.

One file breaks that reasoning. `templates/investigator-capture-layout.md` is a rule file
that a project **copies into its own `./rules/`**. Headerless, it would hand every project
adopting fusion after this lands a rule file that violates the convention on day one. So the
template gets a header, and because it is a template rather than a finished rule, the header
is a placeholder the copying project replaces rather than a citation of fusion's own history.

## What changed — one file, four added lines, zero deletions

`templates/investigator-capture-layout.md`:

1. **Line 3, directly under the H1**, the placeholder header, in the wording the user
   approved:

   ```
   **Provenance:** replace this line with the record, Circle, or commit that motivated your project's capture layout.
   ```

   Placement matches all ten backfilled rule files: H1, blank, header, blank. The conventions
   file allows a header to sit after a blockquote lede within the ten-line window, but the
   canonical position is line 3 and this file fits it, so it takes it.

2. **A new sentence pair in the lede blockquote**, as its own paragraph between the copy
   instruction and the "without a filled-in copy" paragraph:

   > The `Provenance:` line above is yours to replace as well. It carries no angle brackets,
   > so it is easy to read past.

## The judgement call the prompt asked for: the lede needed the clause

The existing lede says "fill in every `<bracketed placeholder>`". That instruction does not
cover the new header, for two independent reasons, and the second is the one that decides it.

*The header is not a bracketed placeholder.* Every other fillable spot in the template is
literally wrapped in angle brackets, including `<YYYY-MM-DD>` and `<name or team responsible>`
at the very bottom. The approved header wording carries none. A reader applying the lede's
instruction as written would scan for `<...>`, find none in the header line, and leave it.

*The header sits above the lede that instructs.* A reader meets the `Provenance:` line before
reading any instruction about what to do with the file. By the time the copy instruction
arrives, the header has already been scrolled past. Relying on the reader to go back up is
exactly the "could plausibly copy the file and never realise" case.

The clause is two short sentences rather than a rewrite of the copy instruction, which also
keeps the diff at zero deletions.

## Three constraints, held

- **The gate does not read `templates/`.** Verified by hand instead, below. The gate's file
  set is `readdirSync` over the plugin's `rules/` only.
- **The gate's corpus was not widened.** `hooks/lib/__tests__/provenance-header-lint.test.ts`
  is untouched. It still reads one directory, still by `readdirSync`, still ten files.
- **`templates/plane.config.yaml` got no header.** It is configuration, not a rule file.

## Verification

1. **The header is at line 3 and matches the gate's regex** — tested directly by running the
   gate's own `HEADER` pattern and `HEADER_WINDOW` against the file, not read by eye:

   ```
   headerLine = 3
   line 3 = "**Provenance:** replace this line with the record, Circle, or commit that motivated your project's capture layout."
   regex.test(line3) = true
   ```

2. **`git diff --numstat templates/`** → `4  0  templates/investigator-capture-layout.md`.
   Four insertions, zero deletions. `git status --porcelain templates/` shows that one path
   and nothing else, so `plane.config.yaml` is untouched.

3. **`cd hooks && npm test`** → 17 test files, 777 tests passed, 20.11s. Identical to Step 3's
   recorded totals, as expected: nothing under `hooks/` or `rules/` changed. The gate alone
   (`npx vitest run lib/__tests__/provenance-header-lint.test.ts`) is 24 passed.

4. **The gate's file count is unchanged at ten.** `ls rules/*.md | wc -l` → `10`:
   `agent-setup`, `context-lean-claude-md`, `context-manifest`, `critical-stance`,
   `decision-record-examples`, `design-diagrams`, `fusion-workbench-conventions`,
   `git-branch-discipline`, `protected-path-discipline`, `user-facing-output`.

## Not done

No commit. The user commits after verifying. No plan document was edited, since this task is
not a plan step.
