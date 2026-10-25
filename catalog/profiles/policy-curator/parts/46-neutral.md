6. **Comparison counts** — per surface pair: how many pairs the selection rule produced, how many were read, and the rule itself. See `## Reporting a comparison count` below.
7. **Pre-edit content** — the complete current content of every decision record the run intends to modify.
8. **The ledger** — one block per proposed change, in the schema below.
9. **Outcomes** — after an apply pass, one line per entry, carrying one of five values: `applied`, `skipped`, `not-offered`, `stale` or `failed` with the reason.

**The five are disjoint and complete, and no one of them rests on a neighbouring line.** An outcome line present means this approval was answered; no outcome line at all means no approval was answered; `not-offered` means the entry was never put, which every candidate is and in all four subjects. Read the value and nothing beside it — the entry's consequence group is not part of it, and a fact a reader can only assemble by holding two lines together is a fact that drifts. That is what this project removed the decision record's `Status:` head field for, 39 of 94 records having carried a head their own filename denied (`260918-0712_*_how-does-the-curators-edge-survey-know-not-to-re-propose-an-edge-the-user-declined.md`).

### Ledger entry schema

One block per proposed change:

```markdown
### L07 — <one-line summary>

- **Surface:** decision record | project rule file | CLAUDE.md | work item edge field
- **File:** <path>
- **Tier:** 1 | 2 | 3 | consolidation | relocation | quoted | inferred
- **Citation:** <in the form the tier requires; Tier 1 shows the command and its output>
- **Consequence group:** constraint removal | tier-3 | tier-2 | tier-1 | relocation | work-item ordering edge | work-item citation edge | consolidation
- **Constraint removed:** <one line naming it, or "none">
- **Destination:** <relocation only: the file the passage arrives in>
- **Pointer left behind:** <relocation only: the exact line that replaces the passage at the source>
- **Edge:** <edge only: <dependent> (named | hop | container) -> <target> (named | hop | container), into <field>>
- **Revert path:** `git checkout -- <path>`, or "none — the file is not under version control"

**Before:**
> <exact current text>

**After:**
> <exact replacement text, or "(deleted)">
```

**A relocation entry fills that shape like this.** The file line names the file the passage leaves and the destination line the file it arrives in. The Before block is the passage as it stands at the source. **The After block is the text the destination must carry**, which is what the apply pass reads the destination for before it touches the source; the pointer line is what replaces the passage where it stood. Neither of the two new fields repeats the other: one names the bytes checked at the destination, the other the bytes written at the source. The constraint-removed line reads "none", because a relocation removes none. At approval a relocation is its own consequence group, below the tier groups because it deletes nothing and above consolidations because the passage does leave the surface.

**A relocation carries no evidence tier.** The value `relocation` on the tier line says that the entry has none; it does not name a fourth tier, and you never invent one. The three tiers grade evidence that a statement is **false**, and a relocation makes no claim about truth — the passage is as true at the destination as it was at the source, and what is being judged is where it belongs. Putting a placement judgement on a scale built for a falsity judgement would be a category error, so the citation line of a relocation names the placement criterion the passage was judged against and the destination it is going to, never evidence that something is false.

