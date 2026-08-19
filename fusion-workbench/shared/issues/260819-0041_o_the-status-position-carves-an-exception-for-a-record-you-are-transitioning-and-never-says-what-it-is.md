The `Status:` position carves an exception for "a record you are transitioning" and never says what it is

---

The paragraph `b54ace5` added to the decision-record template gives an unconditional instruction and
then justifies it with a clause that excludes the case the instruction most needs to cover.

---

`rules/fusion-workbench-conventions.md:524-530`:

> A record written before the removal still carries the field; leave it exactly as it stands —
> hand-correcting a record you are **not transitioning** destroys the evidence the removal was decided
> on.

Read as an imperative, it says: leave it, always. Read through its own justification, it says: the
harm is specific to records you are not transitioning, which invites the reading that a record you
*are* transitioning may be corrected. The two readings differ on the one case an agent will actually
meet, because the only time an agent touches a pre-removal record at all is when it transitions one.

`rules/critical-stance.md` §4 is the standard: every input falls in exactly one branch. This split
overlaps, in the paragraph that removes a field for having drifted from the marker beside it.

**The range itself demonstrates the ambiguity being live.** Four records were transitioned to `_i_`
in `52b1d95..b54ace5` and all four still carry `**Status:** open` in their heads — including
`260816-1707_i_*` and `260818-2212_i_*`, the two decisions that answered this. So the behaviour that
happened is the strict reading, and it is the right one. Nothing in the text says so unambiguously.

**A sibling surface has the same sentence without the clause,** which is evidence the clause is
carriage rather than intent. `skills/next/SKILL.md:224`, on the Circle record's identical removal:

> A record written before the removal still carries the field — leave it exactly as it stands rather
> than correcting it.

No exception, no ambiguity. The clause comes from `agents/orchestrator.md:298-303`, whose Circle-record
paragraph carries it verbatim ("hand-correcting it on a record you are not transitioning"), so this is
inherited phrasing rather than something the range invented — but it is now in three shipped places,
two of which are always-on rule text.

Verified at HEAD `b54ace5` by reading `rules/fusion-workbench-conventions.md:521-530`,
`agents/orchestrator.md:293-303` and `skills/next/SKILL.md:224`, and by
`git diff 52b1d95..b54ace5 -- fusion-workbench/ | grep '^[+-]\*\*Status'`, which returns nothing —
no existing record's field was touched anywhere in the range.

**Fix direction.** Drop the qualifier in all three places, matching `skills/next/SKILL.md`'s wording:
the instruction is unconditional, and the reason it holds for a record you are transitioning is
stronger, not weaker — a transition is exactly the moment the temptation to "tidy" the stale header
arrives, and the population the removal was measured on is what would be destroyed. One clause, three
files, and it shrinks two of them.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.
