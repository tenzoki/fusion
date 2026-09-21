The `### Who filed it` enumeration omits the work item, whose template carries `**Filed by:**` and now has a second writer
---
`rules/fusion-workbench-conventions.md:500` states the criterion and then enumerates: "Which record kinds owe the field: every kind whose template carries the line, and those are defects and decisions (the two formats above), and review files". The work-item template at `rules/fusion-workbench-conventions.md:195` carries `**Filed by:** user, <person>`, and `:204` says every field not listed as optional "is always written". By the criterion the line states, the work item is a fourth kind; the enumeration beside it names three. The binding decision, `260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` (option 2), predates the work-item grammar (260910) and could not have named it. Until `b30ec2ea` the one writer of the field on a work item was `skills/memo/SKILL.md:119`, which spells `user, <person>` and resolves the person half itself. That commit adds a second writer: `agents/orchestrator.md:398` now says the orchestrator writes "`**Filed by:** user`", with no person half named, and `:418` sends it to `### Who filed it` for exit-code handling on the claim only. Whether the orchestrator's write owes the person half and the halt-on-exit-1 procedure is therefore decidable from `:195-204` (yes) and from `:500` (no) with opposite answers.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. No record on disk is wrong today; the memo route writes the person half. What is wrong is an enumeration that its own criterion contradicts, and the new route reads the enumeration.

**Evidence path.** `rules/fusion-workbench-conventions.md:195`, `:204`, `:500`; `skills/memo/SKILL.md:119`; `agents/orchestrator.md:398` and `:418` at `b30ec2ea`.

**Fix direction.** Add the work item to the enumeration at `:500` ("defects and decisions, review files, and work items, whose grammar is `## Backlog entries — work items`"), and have `agents/orchestrator.md:398` say `**Filed by:** user, <person>` with the person half read as `### Who filed it` prescribes, which is the form `:195` and the memo skill already write. The conventions edit is charged to the always-on floor; regenerate `hooks/lib/__tests__/fixtures/rules-emission.golden`. The decision record is not to be edited: an `_i_` record that predates a kind says nothing false about it.

**Acceptance.** `grep -n 'those are defects and decisions' rules/fusion-workbench-conventions.md` returns a line that also names work items; `agents/orchestrator.md` `## Work items` names the person half of the field it writes; `npx vitest run lib/__tests__/rules-emission-golden.test.ts lib/__tests__/surface-growth-bound.test.ts lib/__tests__/reference-resolution-lint.test.ts` is green.

---
Resolved: fixed in the commit that carries this line.
