A gate's remediation text names two commands that do not exist, and no gate resolves a command token

---

The domain-cascade gate tells whoever trips it to take "the route `/fusion:next`, `/fusion:direct` and `/fusion:reconcile` take". Two of those three commands were deleted in v11. The reader is sent to a route they cannot follow, at the one moment they are looking for a way out.

---

**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260916-2144_*_the-holder-naming-section-documents-a-command-a-consumer-and-a-field-shape-that-are-all-gone.md, 260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md

## The defect

`hooks/lib/__tests__/domain-cascade.test.ts:519-520` composes the failure report a developer reads when the gate fires, and names three commands as the route that obtains the session domain. `skills/next/` was deleted in `git:2a785ba2` and `skills/direct/` in `git:07961552`. `/fusion:reconcile` survives, so one third of the sentence is true and nothing in it marks which third.

## Why both survived the deletions

No gate resolves a command token anywhere in the shipped corpus. `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans `rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the root READMEs, `bin/` shell headers and the `hooks/` TypeScript comments, and its classes are file paths, heading anchors and record citations. Its own baseline log states the consequence twice, at `hooks/lib/__tests__/reference-resolution-lint.test.ts:464`: a departed command "is not a token of any pinned class in either spelling", and `/fusion:curate` "is a command token of no pinned class". A slash command is the one reference class in this corpus that nothing checks.

The file this instance sits in is doubly out of reach: `surface()` walks `hooks/lib` and `hooks/` for `.ts` files but not `hooks/lib/__tests__`, so the test bodies are outside every existence check even for the classes the gate does read.

## Scope

The live roster is `ls -1 skills/`, thirteen directories. Over the shipped surface (`rules agents skills bin hooks docs templates *.md install.sh`, excluding `dist/` and the activity log), `grep -rhoE '/fusion:[a-z-]+'` yields six names that match no directory. Four are legitimate history and are not part of this defect: `agents/shaper.md:55` names `/fusion:direct` as removed and says so, `hooks/lib/__tests__/surface-growth-bound.test.ts:54` quotes a past commit subject carrying `/fusion:circle-stash` and `/fusion:circle-pop`, `hooks/lib/__tests__/reference-resolution-lint.test.ts:464` records the `/fusion:log-activity` merge, and `/fusion:migrate-workbench-v2` is named as retired wherever it appears. The two live pointers are this one and the one filed as `260916-2144_*_the-holder-naming-section-documents-a-command-a-consumer-and-a-field-shape-that-are-all-gone.md`.

## Acceptance test

The gate's remediation text names only commands that exist, or states the route without naming a command at all. And a `/fusion:<name>` token in shipped text is resolved against `skills/`, so that deleting a skill turns a gate red on every live pointer to it; the exemption form for a deliberate historical mention is decided at the same time, since four such mentions stand today and each must stay green.

---
Resolved: both halves of the acceptance. Text half, commit `32de95e1` (plan step 9): the domain-cascade remediation text names only `/fusion:reconcile`, the one command of the three that exists. Gate half, this commit (step 21): `hooks/lib/__tests__/reference-resolution-lint.test.ts` reads a fourth class, (d) slash commands: every `/fusion:<name>` token on the class's lines (the Markdown surfaces in full, the `bin/` scripts' and `install.sh`'s comment lines; the `hooks/` TypeScript comment lines stay records-only) must name `skills/<name>/SKILL.md` or a key of `RETIRED_COMMANDS`, and a finding lands in the whole-surface "no dangling reference of any class" case; the placeholder `/fusion:<name>` is excluded by shape (the name opens on a letter). The exemption form for a historical mention is that map, an entry per name with what removed it, guarded twice like `EXAMPLE_PATHS`: no key names a directory, and every key is still cited as a `/fusion:<name>` token on the class's own lines, so the map seeds with the two names the surface mentions (`direct`, deleted `07961552`; `migrate-workbench-v2`, retired `40ca86db`) and not with the four the record listed that nothing on the surface cites — a fresh pointer to `/fusion:next` written tomorrow is therefore red, which the six-entry map of the plan's text would have let through (the second opinion's finding, taken). No count is pinned. Made to fail on a probe `/fusion:nosuch` line appended to `docs/philosophy.md` (restored) and passing on the tree. The test bodies stay outside the surface, as the record's own instance did. Working answer per `260921-1718_*_does-a-slash-command-token-in-shipped-text-become-a-pinned-class-and-what-exempts-a-historical-mention.md` option 1. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 21, fixed in the commit that carries this line.
