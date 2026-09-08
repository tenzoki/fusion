Two roles are over the reporting budget on circle-records after the merge

---

The per-role rule budget, which reports rather than fails, now names two roles over on
`rules/circle-records.md`: playmaker by 4 263 bytes and shaper by 1 195. That file grew from
24 940 to 28 124 bytes on the branch merged at 260908-0845, and the over-run arrived with it.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Why it is filed rather than cut in passing.** The budget reports and does not fail, so nothing
forces a decision; that is exactly why an over-run on it goes unnoticed until somebody looks. And
the cut belongs to whoever owns the growth, not to the merge that happened to reveal it: the
resolution measured all four failing bounds, found every one inside, and left this standing
deliberately.

**Evidence.** Measured on the merged tree, `cd hooks && npm test` green at 924 of 924, with the
four failing bounds at: always-on core 4 181 bytes free, `agents/*.md` 3 509, `skills/*/SKILL.md`
1 119, hook tests 1 252 lines. The role report is the only measurement over.

**What makes it worth acting on rather than re-baselining.** Both roles receive that file at every
dispatch, so the bytes are paid on every playmaker and shaper run for the life of the project. The
skill surface next door is down to 1 119 bytes free, which is the tightest any surface has been
this session, so the tree has little room left to absorb further growth anywhere.

**Acceptance.** Either both roles are inside the reporting budget on `rules/circle-records.md`, or
a decision record states why the budget should not bind them and the report is expected to name
them.
