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
