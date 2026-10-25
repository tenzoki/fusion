
## The two passes and the approval

You run in two passes with user approval between them. **No existing statement on any of the three surfaces is changed before the user has seen the complete change ledger.** Which pass you run is set by `**Mode:**` — see `## Dispatch parameters`.

### Pass 1 — survey. No writes to any surface.

Read the seven evidence sources, assign a tier and a citation per candidate change, and write the **run file**, which is written on **every** run whether or not anything is later applied. The only other files this pass may create are the two ungated ones in `## Scope`: a new open decision record for a contradiction you may not resolve, and a defect record for work outside your remit. Neither changes an existing statement, which is why neither waits for approval. **On an `**Edges:** on` run this pass writes into no work package either** — every edge it reads becomes a ledger entry and nothing else.

### The approval

The approval prompt **never contains the ledger.** It names the run file's path, the count per consequence group, the count of candidates as text saying they are not on offer, the blast-radius check, and asks for a decision at group granularity in one question, with one line inviting per-entry approval by id. Keep it inside the eight-line cap in `rules/user-facing-output.md`.

Groups are presented **most consequential first**, and constraint removals appear first in what the user sees, never last:

1. constraint removals
2. Tier 3 changes
3. Tier 2 changes
4. Tier 1 changes
5. relocations
6. work-item ordering edges
7. work-item citation edges
8. consolidations

The two edge groups sit there because an edge removes no constraint, which puts it below a relocation, and orders work, which puts it above a consolidation. **They are two groups rather than one** so that a user can take the citations without the orderings.

The user approves all, approves by group, approves individual entries by id, or rejects. **Rejecting everything leaves all three surfaces byte-identical and still leaves the run file on disk.**

### Blast-radius stop

If proposed deletions **and relocations together** exceed **20 percent of any single surface's bytes**, ask the user to confirm the scale in a **separate, earlier prompt**, before the ledger counts are shown. A run that wants to take a fifth of a project's binding rules out of a surface is either right about something large or wrong about something large, and both deserve a pause. **Relocated bytes count toward the 20 percent**, in full: the passage leaves the surface a session reads either way, and that it survives at the destination changes the scale of the cut not at all. The 20 percent is a default the user may override for the run.

**A survey always states each surface's net byte delta**, summed over the entries that touch it, `(deleted)` counting as 0 bytes. A tiered, consolidation or edge entry adds After minus Before to its own surface. A relocation adds Pointer left behind minus Before to the source's surface, and the whole After block to the destination's. If a surface's tiered and consolidation entries write back over 1.5 times the bytes they replace, a clause says so; relocations and edges are outside that ratio. It is a reporting cut-off, never a stop; the factor rests on one measurement (krk, 2026-09-17: 2.03 times).

### Preserve list

**Never propose removing an item that falls under one of these five categories.** They read as prunable and are load-bearing. **What each category guards is the item's content, not the place it sits:** every one of the five forbids **deletion** and permits **relocation behind a pointer**, because moving a non-obvious failure mode into the file that now holds its topic does not lose it and deleting it does (`260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md`). The list moved here on 2026-08-15 from the removed `CLAUDE.md` revision skill, which is where it was authored and which held the only copy:

- **Critical procedures** — release flow, setup invariants, "do not do X" rules. Even where the rule looks obvious, repetition is cheap and the cost of forgetting it is high.
- **Hidden coupling** — anything an outsider would have to discover the hard way, of the shape "the marketplace clone must be `git pull`-ed by hand for a new version to land locally".
- **Non-obvious failure modes** — the "if you see X, the cause is Y" rows of a troubleshooting table.
- **Authoritative pointers** — paths to source-of-truth files, rules and normative material. These are the spine of the document.
- **User-authored content** whose removal no evidence tier justifies. Where the user's intent is unclear, leave it.

The single exception is a **Tier 2 change with an explicit superseding record**. Tier 1 and Tier 3 evidence is not sufficient against a preserve-list item. Such an entry is not offered for approval at all. The exception is an exception to **deletion**, and it reaches a relocation not at all: relocating a preserve-list item needs no exception, because it removes nothing. It is an ordinary ledger entry in the relocation shape, gated like every other change.

### Pass 2 — apply. Approved entries only.

Your whole input is the run file plus the approval set. **Never re-derive a proposal in this pass.**

Before applying an entry, **re-read its before-text from disk**. Where disk and ledger disagree, mark the entry `stale` and apply nothing for it. That check is what makes a two-dispatch run as safe as a one-dispatch run **for every entry that owns its region**, and it costs one read per entry. The edge entry does not own its region and does not get this check; what it gets instead is three preconditions, stated below and narrower, and no sentence here or in `skills/curate/SKILL.md` may claim the whole-line comparison on its behalf. **After writing an entry, re-read the region you wrote and compare it byte for byte against the text the ledger says that region must carry.** The user approved those bytes; the before-text check cannot see what landed, and a doubled period once got through it (`260815-1943_*_the-curators-applied-text-carries-two-characters-the-approved-text-did-not.md`). A mismatch is `failed`, naming both texts.

**A relocation writes two files, and its two texts are not interchangeable.** Every other entry writes one region, and the text that region must carry is the After block. For a relocation **the After block is what the destination must carry, and the `Pointer left behind:` line is what the source must carry**. Apply one in these five steps, stopping at the first that does not hold, which leaves the passage where it already was:

1. **Re-read the before-text at the source**, as for any entry. Disagreement with the ledger is `stale` and nothing is written.
2. **Read the destination.** Where it already carries the entry's After block byte for byte, go to step 4.
3. **Where it does not, the destination decides what you may do.** One of the three surfaces you edit: **write it first**, creating the file where the destination does not exist yet — the approval that authorised the cut authorised this write, the two being one entry — then re-read it and compare byte for byte against the After block; a mismatch is `failed` and **the source is not touched**. A file outside those three: you write nothing, the entry is `stale`, and `## Reporting work you may not do` says whose write is being waited on.
