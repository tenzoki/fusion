The migrate carve-out's authoring home has no heading a citation can address

---

`rules/workbench-path-resolution.md` is the authoring home for why `/fusion:migrate` names store paths literally instead of calling `bin/fusion-paths`. The paragraph carrying all three reasons sits inside `## The second argument: the Circle in scope`, under no heading of its own, so no citation of it can take the anchor form the project mandates.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Evidence.** The paragraph opens "One consumer names the layout literally, and only one: `/fusion:migrate`", at `rules/workbench-path-resolution.md`, between `## The second argument: the Circle in scope` and `## The key table`. `rules/fusion-workbench-conventions.md` `## Filename Patterns` requires living text to cite a rule file by heading anchor and never by line number. `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves an anchor only in the adjacent form `` `file.md` `## Section` ``, checking that the cited heading exists in the cited file. A citation of this paragraph therefore has three options and none is right: a line number, which the conventions forbid; the enclosing heading, which names the wrong subject; or no anchor at all, which is what the plan below settles for.

**Origin.** Surfaced by step 1 of `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`, which replaces `skills/migrate/SKILL.md`'s copy of the three reasons with a pointer at this paragraph. The Circle's Directive forbids any rule file gaining a byte, so the plan cites the file without an anchor and names the paragraph in prose rather than adding the heading.

**Acceptance test.** A citation of the migrate carve-out resolves to a heading whose text names the carve-out, and `skills/migrate/SKILL.md`'s pointer uses that anchor.
