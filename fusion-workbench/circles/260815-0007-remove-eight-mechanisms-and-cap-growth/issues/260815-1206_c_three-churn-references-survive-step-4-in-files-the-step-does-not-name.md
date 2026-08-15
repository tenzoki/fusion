Three churn references survive step 4 in files the step's list does not name

---

Step 4 of `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` removed churn
from every file its list names. Three references to the removed mechanism survive in files the
list does not name, so nobody owns them. None of them is gate-forced — `npm test` is green with
all three in place — which is exactly why they need a record rather than a note.

---

## The three

1. **`.gitignore:39`** — `!bin/fusion-churn-rank`. A re-inclusion exception for a file step 4
   deleted. Harmless, and dead: the `bin/*` ignore rule above it has nothing left to re-include
   under that name.

2. **`.claude-plugin/plugin.json:4`** — the shipped `description` still advertises
   "churn detection" as a plugin capability. This is the string a user reads in the marketplace
   listing, so it is the one of the three with an outside reader. Step 2 edited this same
   description (to drop the Plane mirror) and step 9 edits it again (for the domain values); step
   4's list omits it.

3. **`skills/help/SKILL.md:106`** — the compliance-guard pointer names "churn thresholds" among
   the things `hooks/config.example.json` documents. The two thresholds leave that file at step 5,
   which is an `ontocoder` step whose list is the four configuration JSON files and does not
   include this skill body either.

## Why no gate catches them

`reference-resolution-lint.test.ts` scans `rules/`, `agents/`, `docs/`, `templates/`,
`skills/*/SKILL.md`, the root `README*.md` and `CLAUDE.md`, shell scripts' comment lines, and
`hooks/lib/*.ts` comments for record citations only. `.gitignore` and `.claude-plugin/plugin.json`
are not in that set at all. `skills/help/SKILL.md` is scanned, but its churn mention carries no
path-shaped token — the only path on the line, `hooks/config.example.json`, still exists — so
there is nothing for the lint to fail on. This is the bare-filename class the plan's
`**Decidability:**` header already names, arriving on a third surface.

## What it would take

One line deleted from `.gitignore`, one clause from the plugin description, one phrase from the
help pointer. The plugin-description edit is worth sequencing with step 9's, which touches the
same string for the domain values, rather than rewriting the sentence twice.

## Related

- `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` step 4 (file list),
  step 5 (the configuration leaves), step 9 (the next edit to the plugin description).
- `issues/260815-0803_*_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md`
  — the same class, measured on step 2.
- `history/260815-1206-coder-step4-churn-removal.md` — the run that found them.

---

**Two of the three are now closed; item 1 is the whole of what is left.**

Item 3 (`skills/help/SKILL.md:106`) was resolved in `04ea182`, the step-5 commit, which named the
edit and its reason — recorded in
`issues/260815-1251_o_the-three-churn-references-record-lists-three-and-two-remain.md`, which asked
for this append.

Item 2 (`.claude-plugin/plugin.json:4`) was resolved in step 9, which rewrote the same sentence for
the domain values and dropped the `churn detection` clause in the same edit, exactly as
`## What it would take` above asked. The description now reads
*"Project-agnostic specialized agents (3 parameterised by domain — code/data) with a compliance
guard, decision-record tracking, …"*. The version was **not** bumped; step 15 owns that.

Item 1 (`.gitignore:39`, `!bin/fusion-churn-rank`) still stands, and it stays outside step 9's
scope on purpose. That `.gitignore` block now carries two stale re-inclusion exceptions and step 11
adds a third when `bin/fusion-state-drift` goes, so it is one sweep, not three edits in three steps
— see
`issues/260815-0803_o_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane.md`.
This record stays `_o_` for that one item.

---
Resolved: all three items are now resolved, and the record's own append already carried two of them. Item 3, `skills/help/SKILL.md`'s churn-thresholds phrase, went in `04ea182` (step 5). Item 2, the `churn detection` clause of the `.claude-plugin/plugin.json` description, went in `0894d0d` (step 9), which rewrote the same sentence for the domain values. Item 1, `.gitignore`'s `!bin/fusion-churn-rank`, went in `5f2171e` as part of the single sweep the record asked for, together with the two other dangling exceptions. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913: no `churn` token survives in `.gitignore`, `.claude-plugin/plugin.json` or any skill body, and the only remaining occurrences in the tree are the historical passages in `hooks/tracker.ts` and `hooks/lib/config.ts` that record what left and why, plus the nine cadence-metric uses in `skills/cadence/SKILL.md` that `## Current State` named as keepers.
