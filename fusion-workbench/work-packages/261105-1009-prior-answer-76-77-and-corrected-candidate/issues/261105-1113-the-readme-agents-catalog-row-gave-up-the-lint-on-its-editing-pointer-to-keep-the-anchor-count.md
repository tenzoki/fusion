The README-agents catalog row gave up the lint on its editing pointer to keep the anchor count
---
`af36d055` replaced the row's one lint-resolved anchor, `## Editing a converted prompt`, with `## The frozen assets`, and left the editing pointer as "the same README's", which no lint resolves. Severity: Low; the heading exists today.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer, in the first candidate after the 13.4.2 tag
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md; 261028-0810-readme-agents-catalog-row-still-names-repair-v1-as-one-of-the-two-workflow-definitions.md

**Evidence.**

- `README-agents.md`, `## Plugin structure`, the `catalog/` row. Before: "(`catalog/README.md` `## Editing a converted prompt`)". After: "`catalog/README.md` `## The frozen assets` defines ..." and "(the same README's `## Editing a converted prompt`)".
- `git grep -c` of the `catalog/README.md` anchor form in `README-agents.md` is one at both `9fcfc148` and `af36d055`, so `BASELINE.anchors` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` stays 378.
- The commit message gives the reason: the lint pins its counts, and this step does not touch `hooks/`. The plan's `CLAUDE-DIST` makes that binding. `BASELINE_MESSAGE` says a re-approval is the expected response to a legitimate added citation, so the swap trades coverage for the plan's limit. No other lint-resolved pointer to that heading exists in `README-agents.md`, `README.md`, `README-hooks.md`, `CLAUDE.md` or `rules/`.
- A reword of `catalog/README.md` `## Editing a converted prompt` now breaks this pointer with the suite green. It is the pointer behind the row's "edit the part, never the file".
- "the same README's" sits in `README-agents.md`, several sentences after `catalog/README.md` is named, so its referent can be read as the file holding the row.

Issue `261028-0810-...`'s acceptance is otherwise met: the row names the set without a count, names no withdrawn asset, and restates nothing; the anchor resolves at `catalog/README.md:99`.

**Fix direction.** After the tag, spell both anchors in full, and re-approve `anchors` 378 to 379 with its log entry in the same commit.

**Acceptance.** Both pointers carry `catalog/README.md`, and `HOOKS-WT` exits 0 with the re-approved baseline.
