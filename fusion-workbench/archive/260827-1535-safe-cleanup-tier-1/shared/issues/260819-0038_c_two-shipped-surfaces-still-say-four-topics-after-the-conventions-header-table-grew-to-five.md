Two shipped surfaces still say "four topics" after the conventions header table grew to five

---

`b200902` added a fifth row to the partition table in `rules/fusion-workbench-conventions.md` and
correctly changed that file's own lead-in from "Four topics" to "Five topics" and "these five files"
to "these six files". Two other copies of the same count were not touched, and both ship.

---

`CLAUDE.md:44`, the `rules/fusion-workbench-conventions.md` Layout row:

> Its own header table names the **four topics** that were partitioned out of it and where each now
> lives.

`README-agents.md:271`:

> Its header table names the **four topics** that have their own authoring homes next door — the
> resolver's key table (`workbench-path-resolution.md`), the Circle state vocabulary and record
> templates (`circle-records.md`), rule-file provenance (`rule-file-provenance.md`), and the commit
> lock (`commit-lock.md`) — each emitted only to the agents that apply it.

The README copy is the worse of the two: it does not merely carry a stale number, it enumerates the
four by name, so `rules/workbench-tracking.md` is absent from the one user-facing list of the
partitioned rule files. Its closing clause is also now false as a universal — "each emitted only to
the agents that apply it" holds for the four it names and not for the fifth, which is emitted to no
agent at all, and that is the whole point of decision `260816-1707`.

`rules/fusion-workbench-conventions.md:7` at HEAD, for comparison:

> **Five topics** that were once defined here now have their own authoring homes […] cite whichever
> of these **six files** owns the rule.

Verified at HEAD `b54ace5` by `grep -n "four topics" CLAUDE.md README-agents.md` (two hits) and by
counting the rows of the table at `rules/fusion-workbench-conventions.md:9-16` (five).

**Why it survived.** The count lives in three places and nothing pins them together.
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` covers the skill roster, the agent counts,
the always-on rule list, the conditional emission sets, the `hooks/lib` table and the `bin/` helper
roster — it has no case for the partition table, and neither the number nor the file list is
derivable from anything it already reads. `npm test` is green at HEAD with both copies stale.

This is the class `260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`
names, arriving through a third surface, and the same shape as
`260815-0803_*_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md`.

**Fix direction.** Correct both counts, add `workbench-tracking.md` to the README enumeration with
its "emitted to no agent" qualifier, and — separately, because it is a wider question — decide
whether the partition table earns a `derivable-enumerations-lint` case the way the `bin/` roster
did. Scope: shipped documentation, both consuming-project-facing (`README-agents.md`) and
this repository's auto-loaded context (`CLAUDE.md`).

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301-orchestrator-session.md`. No Circle active, so it is
filed in the shared store under the Origin Rule.

---
Resolved: `CLAUDE.md:44` and `README-agents.md:271` now say five topics, and the README enumeration names `workbench-tracking.md`. The closing clause was not written as the record proposed: an "emitted to no agent" qualifier on the fifth would have implied the other four are agent-emitted, and the partition table shows three of the five are not. It now states that three of them are reached by citation rather than emission, which matches the table row for row.
