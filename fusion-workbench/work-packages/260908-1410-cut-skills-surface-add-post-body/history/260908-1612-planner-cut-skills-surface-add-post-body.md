# Planner: the implementation plan for cutting the skills surface and adding the post step body

**Status:** Complete
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Date:** 2026-09-08 16:12
**Circle:** `260908-1410-cut-skills-surface-add-post-body` (target passed as `**Circle:**`; it is also the active Circle)
**Executors offered:** coder, ontocoder, analyst
**Plan:** `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`

## What was asked

Write the implementation plan for the active Circle against two inputs: the Circle record and the measured cut ledger `260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md`. Four user rulings were carried in and not reopened (all ten rows, the help topic capped at 700 bytes, both invocation shapes, and the stop-at-6-500 branch), plus two rulings settled before the Circle was filed (the inverted shape, and the rejection of the surface-count objection). The dispatch asked for the ordering to be justified in the plan, for the easily dropped roster obligations to be carried, and for every claim in the dispatch to be checked against the tree.

## What was done

Read the always-on rules, the Circle record, the ledger in full, the shaper's history, `skills/cleanup/SKILL.md` whole, `skills/curate/SKILL.md` and `skills/news/SKILL.md` whole, the relevant parts of `skills/archive/SKILL.md`, `skills/log-activity/SKILL.md`, `skills/setup/SKILL.md`, `skills/migrate/SKILL.md`, `skills/next/SKILL.md`, `skills/help/SKILL.md` and `skills/direct/SKILL.md`, and four hook tests (`surface-growth-bound`, `helpers/growth-bound`, `derivable-enumerations-lint`, `plan-stopping-section-lint`, plus the header of `reference-resolution-lint`).

Wrote a 17-step plan in three phases: cut rows 1 through 9 with a measurement gate, then build the new body with a second measurement gate and the roster obligations in one commit, then the help topic and a single golden regeneration.

## What was verified

Every ledger figure was re-measured at HEAD `94a262b0`.

- `wc -c skills/*/SKILL.md` gives 259 495, the figure the ledger measured at `0f5597be` and the shaper re-took at `8502d539`. The surface has not moved.
- `SKILL_BASELINE` sums to 240 614 over the 12 files it names, so the budget is 260 614 and free is 1 119. All three match the ledger.
- Every "before" span reproduces exactly: rows 1 (1 340 / 1 327 / 1 179 / 1 316), 2 (1 048), 3 (1 014), 4 (554), 5 (917 / 961 / 457), 6 (2 226), 7 (608), 8 (353), 9 (531 / 523 / 466 as sub-line spans). Row 10 measures 2 069 against the ledger's 2 070, a one-byte difference in the span's trailing blank line.
- Every record citation in the plan resolves to exactly one file.

## Where the inputs were wrong or incomplete

Five findings, each carried into a plan step rather than left for an executor.

1. **The lint forces two edits, not one.** `derivable-enumerations-lint.test.ts` requires both a `/fusion:post` token in `CLAUDE.md` and exactly one anchored `README-agents.md` table row. The ledger's "What the new body owes" names only the first; the dispatch named both.
2. **A third prose claim goes false, in a file nobody named.** `README-agents.md:235` reads "Three more bodies in the table" and becomes four. Neither the ledger nor the Circle record nor the dispatch reaches this site, and no lint reads it.
3. **Three heading anchors in the ledger's verification table are spelled with a colon where the tree uses an em-dash** (`## State Markers — issues and planning`, `## State Markers — decisions`, `## State Markers — circles`). The anchor lint does a prefix match, so a copied spelling reddens the suite on row 5.
4. **Row 6's pointer target has no heading of its own.** The paragraph sits inside `## The second argument: the Circle in scope`, so no permitted citation spelling addresses it. The plan cites the file without an anchor and files the gap, because the Directive forbids a rule file gaining a byte.
5. **The golden is regenerated once, not per commit.** `260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md` already ruled it: the green unit is the Turn. Neither the Circle record nor the ledger names that record, and an executor meeting the golden's failure mid-run would otherwise treat it as its own defect.

Two smaller qualifications. The dispatch says the new body matches "the three existing step bodies"; the three do not share one shape, and only `skills/archive/SKILL.md` carries an inline-versus-standalone branch, which is the one `post` copies because it is the only other step body that asks a question. And migrate's row 9 exclusion holds, but its stated reason is stronger than the tree supports: the exemption category is authored in `rules/fusion-workbench-conventions.md` `## Project language`, and what migrate states alone is its application to its own shell blocks.

## Records filed

- Decision, this Circle: `260908-1612_*_can-migrates-language-preamble-adopt-the-shortened-form-and-keep-its-shell-string-clause.md`.
- Defect, this Circle: `260908-1612_*_readme-agents-calls-curate-the-only-path-to-claude-md-while-a-lint-forces-a-hand-edit.md`.
- Defect, this Circle: `260908-1612_*_the-migrate-carve-outs-authoring-home-has-no-heading-a-citation-can-address.md`.
- Defect, shared store: `260908-1612_*_log-activity-calls-itself-cleanups-step-6-and-it-is-step-5.md`. Found next to this work; that file is in no ledger row.

## Not done

No code, data or shipped text was edited. No agent was dispatched. Execution is the user's call.
